#! /usr/bin/env ruby

# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

$LOAD_PATH.unshift File.expand_path('../../../src', __FILE__)
require 'a10_monitoring'

# Server status code 1 means up, 0 means down. See API docs page 226.
SERVER_STATUS_UP = 1

#===============================================================================
# Application usage and options
#===============================================================================

DESCRIPTION = <<-STR
Check A10 load balancer VIP health, by checking the percent of backend servers
that are up. Returns:

CRITICAL if % up < critical-threshold
WARNING  if % up < warning-threshold
OK       otherwise
STR

EXAMPLES = <<-STR
__APPNAME__ [options]
STR

cli = CommandLine.new(:description => DESCRIPTION, :examples => EXAMPLES)

cli.option(:slb, '-s', '--slb HOST[:PORT]', "SLB host and port. Assumes port 80 if not specified.") do |v|
  v
end
cli.option(:vip, '-V', '--vip NAME:PORT', "VIP, as the vserver name and port.") do |v|
  v
end
cli.option(:warning_threshold, '-w', '--warning PCT', 'Warning threshold, as percent (0-100)', 80) do |v|
  Float(v)
end
cli.option(:critical_threshold, '-c', '--critical PCT', 'Critical threshold, as percent (0-100)', 20) do |v|
  Float(v)
end
cli.option(:verbose, '-v', '--verbose', "Enable verbose output, including backtraces.") do
  true
end
cli.option(:version, nil, '--version', "Print the version string and exit.") do
  puts A10_MONITORING_VERSION_MESSAGE
  exit
end

#===============================================================================
# Functions
#===============================================================================

# Convert virtual server status to string (p. 255 in API docs)
def vserver_status_to_string(code)
  case code
  when 0 then :DISABLED
  when 1 then :ALL_UP
  when 2 then :PARTIAL_UP
  when 3 then :FUNC_UP
  when 4 then :DOWN
  else        :UNKNOWN
  end
end

#===============================================================================
# Main
#===============================================================================

slb = nil

begin
  # Parse command-line arguments
  cli.parse
  raise ArgumentError, 'please specify the SLB host:port'  unless cli.slb
  raise ArgumentError, 'please specify vip (name:port)'    unless cli.vip
  raise ArgumentError, 'please specify warning threshold'  unless cli.warning_threshold
  raise ArgumentError, 'please specify critical threshold' unless cli.critical_threshold

  vserver, port = cli.vip.split(':')
  raise ArgumentError, 'port required in vip (name:port)'  unless port
  port = Integer(port) rescue raise(ArgumentError, "invalid port '#{port}'")

  # Fetch vip data
  slb = A10LoadBalancer.new(cli.slb)
  vserver_conf = slb.virtual_server_configs[vserver]
  Icinga::quit(Icinga::UNKNOWN, "vserver '#{vserver}' not found") unless vserver_conf

  port_data = vserver_conf[:vport_list][port]
  Icinga::quit(Icinga::UNKNOWN, "port #{port} not found for vserver '#{vserver}'") unless port_data

  # Get the service group and status
  group       = port_data[:service_group]
  status_code = port_data[:status]
  status_name = vserver_status_to_string(status_code)

  if group.empty?
    Icinga.quit(Icinga::CRITICAL, "vip #{cli.vip} has no assigned service group")
  end

  # If not up, quit
  unless [:ALL_UP, :PARTIAL_UP, :FUNC_UP].include? status_name
    Icinga.quit(Icinga::CRITICAL, "vip #{cli.vip} status is #{status_name}")
  end

  # Calculate the percent of servers that are up
  servers      = slb.service_group_configs[group][:member_list]
  servers_down = servers.select { |s| s[:status] != SERVER_STATUS_UP }.map { |s| s[:server] }
  up_flags     = servers.map { |s| s[:status] == SERVER_STATUS_UP ? 1 : 0 }
  num_up       = up_flags.inject(&:+)
  num_hosts    = up_flags.size
  pct_up       = 100.0 * num_up.to_f / num_hosts

  # Return warning or critical if bad
  message = "vip %s has %d of %d hosts up (%0.0f%%)" % [cli.vip, num_up, num_hosts, pct_up]
  message += ". Hosts down: #{servers_down.join(', ')}" unless servers_down.empty?

  Icinga.quit(Icinga::CRITICAL, message) if pct_up < cli.critical_threshold
  Icinga.quit(Icinga::WARNING,  message) if pct_up < cli.warning_threshold
  Icinga.quit(Icinga::OK,       message)

rescue => e
  Utils.print_backtrace(e) if cli.verbose
  Icinga::quit(Icinga::CRITICAL, "#{e.class.name}: #{e.message}")
ensure
  slb.close_session if slb
end
