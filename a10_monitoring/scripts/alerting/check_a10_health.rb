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
Check hardware health for CPUs, fans, and power supplies. Returns:

OK       if all components are healthy
CRITICAL if any components are unhealthy
STR

EXAMPLES = <<-STR
__APPNAME__ [options]
STR

cli = CommandLine.new(:description => DESCRIPTION, :examples => EXAMPLES)

cli.option(:slb, '-s', '--slb HOST[:PORT]', "SLB host and port. Assumes port 80 if not specified.") do |v|
  v
end
cli.option(:cpu_temp_crit, '-C', '--cpu-temp-crit TEMP', "A10 CPU Temperature.", 55) do |v|
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
  raise ArgumentError, 'please specify the SLB host:port' unless cli.slb

  # We will collect an array of error messages
  slb = A10LoadBalancer.new(cli.slb)
  errors = []

  # CPU status
  if slb.cpu_status != 'ALL_OK'
    errors << "CPU status is '#{slb.cpu_status}'"
  end
  puts "CPU status: #{slb.cpu_status}" if cli.verbose

  # CPU temperature
  if slb.cpu_temp_c > cli.cpu_temp_crit
    messages << "CPU temp is #{slb.cpu_temp_c}C"
  end
  puts "CPU temp: #{slb.cpu_temp_c}C" if cli.verbose

  # Fans
  slb.fan_status.each_with_index do |status, i|
    if status !~ /^OK/
      errors << "Fan #{i+1} status is '#{status}'"
    end
    puts "Fan #{i+1} status: #{status}" if cli.verbose
  end

  # Power supplies
  slb.power_status.each_with_index do |status, i|
    if status != 'on'
      errors << "Power supply #{i+1} status is '#{status}'"
    end
    puts "Power supply #{i+1}: #{status}" if cli.verbose
  end

  # Return the proper status
  if errors.empty?
    Icinga.quit(Icinga::OK, "hardware components healthy")
  else
    Icinga.quit(Icinga::CRITICAL, errors.join("; "))
  end

rescue => e
  Utils.print_backtrace(e) if cli.verbose
  Icinga::quit(Icinga::CRITICAL, "#{e.class.name}: #{e.message}")
ensure
  slb.close_session if slb
end

