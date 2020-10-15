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
Check A10 load balancer CPU usage. Returns:

CRITICAL if % usage > critical-threshold
WARNING  if % usage > warning-threshold
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
cli.option(:cpu_types, '-t' , '--cpu-types LIST', 'CPU types, as a csv list. Accepted values: data, mgmt.', 'data,mgmt') do |v|
  v
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

  cpu_types      = cli.cpu_types.split(',').map(&:to_sym)
  check_data_cpu = cpu_types.include? :data
  check_mgmt_cpu = cpu_types.include? :mgmt

  cpu_types.each do |type|
    raise ArgumentError, "invalid CPU type '#{type}'" unless [:data,:mgmt].include? type
  end
  raise ArgumentError, "no CPU type specified" unless check_data_cpu || check_mgmt_cpu

  # Create the SLB object
  slb  = A10LoadBalancer.new(cli.slb)
  warn = cli.warning_threshold
  crit = cli.critical_threshold

  # Verbose output
  if cli.verbose
    slb.data_cpu_usages.each_with_index do |usage, index|
      puts "data cpu %2d: %d%%" % [index+1, usage]
    end
    slb.mgmt_cpu_usages.each_with_index do |usage, index|
      puts "mgmt cpu %2d: %d%%" % [index+1, usage]
    end
  end

  # Return the proper status
  Icinga.quit(Icinga::CRITICAL, "data CPU usage is %0.1f%%" % slb.data_cpu_avg) if check_data_cpu && slb.data_cpu_avg > crit
  Icinga.quit(Icinga::CRITICAL, "mgmt CPU usage is %0.1f%%" % slb.mgmt_cpu_avg) if check_mgmt_cpu && slb.mgmt_cpu_avg > crit
  Icinga.quit(Icinga::WARNING,  "data CPU usage is %0.1f%%" % slb.data_cpu_avg) if check_data_cpu && slb.data_cpu_avg > warn
  Icinga.quit(Icinga::WARNING,  "mgmt CPU usage is %0.1f%%" % slb.mgmt_cpu_avg) if check_mgmt_cpu && slb.mgmt_cpu_avg > warn
  Icinga.quit(Icinga::OK, "CPU usage ok (data: %0.1f%%, mgmt: %0.1f%%)" % [slb.data_cpu_avg, slb.mgmt_cpu_avg])

rescue => e
  Utils.print_backtrace(e) if cli.verbose
  Icinga::quit(Icinga::CRITICAL, "#{e.class.name}: #{e.message}")
ensure
  slb.close_session if slb
end
