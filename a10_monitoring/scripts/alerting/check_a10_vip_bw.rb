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
This script checks the bandwidth for an A10 SLB VIP. It will query the SLB twice
for bytes transmitted and received, and then compute the transfer rate.

A VIP is specified by a virtual server name and port ("name:port"). The port is
optional; if specified, the script will check the bandwidth only for that port.
Otherwise, it will check the bandwidth for all ports on the virtual server.

Return values:

CRITICAL if bandwidth > critical-threshold
WARNING  if bandwidth > warning-threshold
OK       otherwise
STR

EXAMPLES = <<-STR
__APPNAME__ [options]
STR

cli = CommandLine.new(:description => DESCRIPTION, :examples => EXAMPLES)

cli.option(:slb, '-s', '--slb HOST[:PORT]', "SLB host and port. Assumes port 80 if not specified.") do |v|
  v
end
cli.option(:vip, '-V', '--vip NAME[:PORT]', "VIP name and port. If port missing, consider all ports.") do |v|
  v
end
cli.option(:warning_threshold, '-w', '--warning RATE', 'Warning threshold, in Mb/s', 400) do |v|
  Float(v)
end
cli.option(:critical_threshold, '-c', '--critical RATE', 'Critical threshold, in Mb/s', 600) do |v|
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
  raise ArgumentError, 'please specify vip (name:port)'    unless cli.vip
  raise ArgumentError, 'please specify warning threshold'  unless cli.warning_threshold
  raise ArgumentError, 'please specify critical threshold' unless cli.critical_threshold

  vserver, port = cli.vip.split(':')
  if port
    port = Integer(port) rescue raise(ArgumentError, "invalid port '#{port}'")
  end

  warn = cli.warning_threshold
  crit = cli.critical_threshold

  # Fetch vserver data
  slb = A10LoadBalancer.new(cli.slb, :sleep_sec => cli.sleep_sec)
  stats = slb.virtual_server_stats[vserver]
  Icinga::quit(Icinga::UNKNOWN, "virtual server '#{vserver}' not found") unless stats

  # If a port was specified, only check its stats
  if port
    stats = stats[:vport_stat_list][port]
    Icinga::quit(Icinga::UNKNOWN, "port #{port} not found for vserver '#{vserver}'") unless stats
  end

  # Compute IO rates
  rx_rate_mbps = stats[:req_bit_rate] / 1024 / 1024
  tx_rate_mbps = stats[:resp_bit_rate] / 1024 / 1024
  pretty_rx_rate = Utils.pretty_rate(stats[:req_bit_rate], :bits)
  pretty_tx_rate = Utils.pretty_rate(stats[:resp_bit_rate], :bits)

  # Return the proper status
  message = "#{cli.vip} bandwidth: (tx: %s, rx: %s)" % [pretty_tx_rate, pretty_rx_rate]
  Icinga::quit(Icinga::CRITICAL, message) if tx_rate_mbps > crit || rx_rate_mbps > crit
  Icinga::quit(Icinga::WARNING,  message) if tx_rate_mbps > warn || rx_rate_mbps > warn
  Icinga::quit(Icinga::OK,       message)

rescue => e
  Utils.print_backtrace(e) if cli.verbose
  Icinga::quit(Icinga::CRITICAL, "#{e.class.name}: #{e.message}")
ensure
  slb.close_session if slb
end
