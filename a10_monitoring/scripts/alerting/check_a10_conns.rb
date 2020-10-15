#! /usr/bin/env ruby

# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

$LOAD_PATH.unshift File.expand_path('../../../src', __FILE__)
require 'a10_monitoring'

#===============================================================================
# Application usage and options
#===============================================================================

DESCRIPTION = <<-STR
Check A10 load balancer for number of open client (frontend) and server (backend)
connections. Returns:

CRITICAL if conns > critical-threshold
WARNING  if conns > warning-threshold
OK       otherwise
STR

EXAMPLES = <<-STR
__APPNAME__ [options]
STR

cli = CommandLine.new(:description => DESCRIPTION, :examples => EXAMPLES)

cli.option(:slb, '-s', '--slb HOST[:PORT]', "SLB host and port. Assumes port 80 if not specified.") do |v|
  v
end
cli.option(:warning_threshold, '-w', '--warning PCT', 'Warning threshold, as number of open conns', 1000000) do |v|
  Float(v)
end
cli.option(:critical_threshold, '-c', '--critical PCT', 'Critical threshold, as number of open conns', 1000000) do |v|
  Float(v)
end
cli.option(:sleep_sec, '-S', '--sleep-sec SEC', "Number of seconds to sleep between queries.", 4) do |v|
  Integer(v)
end
cli.option(:verbose, '-v', '--verbose', "Enable verbose output, including backtraces.") do
  true
end
cli.option(:version, nil, '--version', "Print the version string and exit.") do
  puts A10_MONITORING_VERSION_MESSAGE
  exit
end

#===============================================================================
# Main
#===============================================================================

slb = nil

begin
  # Parse command-line arguments
  cli.parse
  raise ArgumentError, 'please specify the SLB host:port'  unless cli.slb
  raise ArgumentError, 'please specify warning threshold'  unless cli.warning_threshold
  raise ArgumentError, 'please specify critical threshold' unless cli.critical_threshold

  # Get the number of open conns
  slb = A10LoadBalancer.new(cli.slb, :sleep_sec => cli.sleep_sec)
  warn = cli.warning_threshold
  crit = cli.critical_threshold

  # Count client and server connections
  client_conns = slb.virtual_server_stats.values.map { |x| x[:cur_conns] }.inject(:+)
  server_conns = slb.service_group_stats.values.map  { |x| x[:cur_conns] }.inject(:+)

  # Count client connections
  if cli.verbose
    puts "CLIENT CONNECTIONS:"
    slb.virtual_server_stats.each do |name, stats|
      ssl_conns = stats[:vport_stat_list][443][:cur_conns] rescue 0
      puts "%-30s: %8d open conns (SSL: %d)" % [name, stats[:cur_conns], ssl_conns]
    end
    puts

    puts "SERVER CONNECTIONS:"
    slb.service_group_stats.each do |name, stats|
      puts "%-30s: %8d open conns to %3d backend hosts" %
        [name, stats[:cur_conns], stats[:member_stat_list].count]
    end
    puts
  end

  # Return status code
  message = "#{client_conns} open client conns, #{server_conns} open server conns"
  Icinga::quit(Icinga::CRITICAL, message) if client_conns > crit || server_conns > crit
  Icinga::quit(Icinga::WARNING,  message) if client_conns > warn || server_conns > warn
  Icinga::quit(Icinga::OK,       message)

rescue => e
  puts Utils.pretty_backtrace(e) if cli.verbose
  Icinga::quit(Icinga::CRITICAL, "#{e.class.name}: #{e.message}")
ensure
  slb.close_session if slb
end
