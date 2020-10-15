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
Check the network bandwidth consumed by each interface on the A10 load balancer.
This is measured in percent of total interface bandwidth.

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
cli.option(:warning_threshold, '-w', '--warning PCT', 'Warning threshold, as percent (0-100)', 80) do |v|
  Float(v)
end
cli.option(:critical_threshold, '-c', '--critical PCT', 'Critical threshold, as percent (0-100)', 90) do |v|
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

  # Prepare to fetch data
  slb  = A10LoadBalancer.new(cli.slb, :sleep_sec => cli.sleep_sec)
  warn = cli.warning_threshold
  crit = cli.critical_threshold
  warn_ports = []
  crit_ports = []

  # Examine each interface
  slb.network_interface_stats.each do |port,link|
    # Check for high usage
    if link[:in_usage] > crit || link[:out_usage] > crit
      crit_ports << port
    elsif link[:in_usage] > warn || link[:out_usage] > warn
      warn_ports << port
    end

    # Print verbose output
    if cli.verbose
      in_pretty  = Utils.pretty_rate(link[:in_bit_rate], :bits)
      out_pretty = Utils.pretty_rate(link[:out_bit_rate], :bits)
      puts "Port %02d: %s, %10s in (%0.1f%%), %10s out (%0.1f%%)" %
        [port, link[:speed], in_pretty, link[:in_usage], out_pretty, link[:out_usage]]
    end
  end

  # Return the proper message and status
  if crit_ports.count > 0
    message = "network link usage above #{crit}% on ports: #{crit_ports.join(',')}"
    status = Icinga::CRITICAL
  elsif warn_ports.count > 0
    message = "network link usage above #{warn}% on ports: #{warn_ports.join(',')}"
    status = Icinga::WARNING
  else
    message = "network link usage below #{warn}% on all ports"
    status = Icinga::OK
  end
  Icinga::quit(status, message)

rescue => e
  Utils.print_backtrace(e) if cli.verbose
  Icinga::quit(Icinga::CRITICAL, "#{e.class.name}: #{e.message}")
ensure
  slb.close_session if slb
end
