#! /usr/bin/env ruby

# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

$LOAD_PATH.unshift File.expand_path('../../src', __FILE__)
require 'a10_monitoring'
require 'pp'

#===============================================================================
# Application usage and options
#===============================================================================

DESCRIPTION = <<-STR
Generic script to query the A10 API and pretty-print the JSON results. Accepts a
metric string and any number of parameters.

Useful metrics:

    network.interface.get port_num=1
    network.interface.getAll
    slb.service_group.getAll
    slb.virtual_server.getAll
    system.device_info.cpu.current_usage.get
    system.device_info.get
    system.performance.get

Statistics:

    network.interface.fetchAllStatistics
    network.trunk.fetchAllStatistics
    slb.service_group.fetchAllStatistics
    slb.virtual_server.fetchAllStatistics

STR

SYNOPSIS = <<-STR
__APPNAME__ -s <slb>[:port] -m <method> [param=value] ...
STR

EXAMPLES = <<-STR
__APPNAME__ -s slb1.example.com:443 -m system.device_info.get
__APPNAME__ -s slb1.example.com:443 -m network.interface.get port_num=1
STR

cli = CommandLine.new(:synopsis => SYNOPSIS, :description => DESCRIPTION, :examples => EXAMPLES)

cli.option(:slb, '-s', '--slb HOST[:PORT]', "SLB host and port. Assumes port 80 if not specified.") do |v|
  v
end
cli.option(:metric, '-m', '--metric METRIC', "A10 metric name.") do |v|
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

begin
  # Parse command-line arguments
  cli.parse
  raise ArgumentError, 'please specify the SLB host:port via -s' unless cli.slb
  raise ArgumentError, 'please specify the A10 metric via -m'    unless cli.metric
  params = Hash[*cli.positional.map { |x| x.split('=') }.flatten]

  # Fetch and print the data
  api = A10RestApi.new(cli.slb)
  pp api.get(cli.metric, params)

rescue Errno::EPIPE
  # If piping output to another command (eg. 'head'), that command may exit
  # before this one does. In such cases, just exit silently.
rescue => e
  puts (cli.verbose ? Utils.pretty_backtrace(e) : "#{e.class.name}: #{e.message}")
end
