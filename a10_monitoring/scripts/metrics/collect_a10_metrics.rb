#!/usr/bin/env ruby

# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

$LOAD_PATH.unshift File.expand_path('../../../src', __FILE__)
require 'a10_monitoring'
require 'socket'

#===============================================================================
# Application usage and options
#===============================================================================

DESCRIPTION = <<-STR
Collect metrics from an A10 load balancer and output them either to a Graphite-
compatible metrics system, or to stdout. This script will collect metrics for:

- device info
- network interfaces
- virtual servers
- service groups

Note: the SLB hostname/fqdn will be inserted between the prefix and the metric
name, with periods replaced by underscores (ie: <prefix>.<fqdn>.<metric>).
STR

EXAMPLES = <<-STR
# Output metrics to stdout in graphite line-protocol format
__APPNAME__ --slb slb1.company.com --freq 60

# Send metrics to your graphite host on port 2003
__APPNAME__ --slb slb1.company.com --freq 60 --metrics-host graphite.company.com:2003
STR

cli = CommandLine.new(:description => DESCRIPTION, :examples => EXAMPLES)

cli.option(:slb, '-s', '--slb HOST[:PORT]', "SLB host and port. Assumes port 80 if not specified.") do |v|
  v
end
cli.option(:freq, '-f', '--freq SEC', "Collection frequency, in seconds.", 60) do |v|
  Integer(v)
end
cli.option(:prefix, '-p', '--prefix STR', "Metrics path prefix. Separate tokens with dots or slashes (./).") do |v|
  v
end
cli.option(:metrics_host, '-m', '--metrics-host HOST:PORT', "Metrics host and port to send to. Needed for Graphite.") do |v|
  tokens = v.split(':')
  raise ArgumentError, "--metrics-host argument must be of the form HOST:PORT" unless tokens.count == 2
  raise ArgumentError, "--metrics-host argument must have a valid port" if tokens[1].to_i == 0
  tokens.take 2
end
cli.option(:verbose, '-v', '--verbose', "Enable verbose output, including backtraces.") do
  true
end
cli.option(:version, nil, '--version', "Print the version string and exit.") do
  puts A10_MONITORING_VERSION_MESSAGE
  exit
end

#===============================================================================
# Formatter classes
#===============================================================================

# Base class for all formatters
class MetricsFormatter
  # Initialize the formatter. Accepts any of the following options:
  #
  #     :prefix  Prefix to prepend to each metrics path.
  #     :host    Metrics host to send to. Sends to stdout by default.
  #     :port    Metrics host port to send to.
  #
  def initialize(options = {})
    @prefix = options[:prefix] ? options[:prefix] + '.' : ''
    @host   = options[:host]
    @port   = options[:port]
    @socket = TCPSocket.new(@host, @port) if @host && @port
  end

  # Format and send the metrics either to stdout, or to a remote host and port,
  # if specified during initialization.
  #
  # Params:
  #
  #     metrics  A hash from metric path to value.
  #     time     An integer timestamp.
  #
  def send(metrics, time)
    lines = format(metrics, time)
    io = (@socket || $stdout)
    lines.each { |l| io.puts l }
  end
end

# Graphite formatter. Formats as:
#     $METRIC_PATH $VALUE $TIMESTAMP
# Eg:
#     alice.interface.if_octets-eth0 42146 1180647081
#
class GraphiteFormatter < MetricsFormatter
  def format(metrics, time)
    time = time.to_i
    metrics.to_a.map do |p|
      name, value = p
      path = (@prefix + name).gsub('/', '.')
      "#{path} #{value} #{time}"
    end
  end
end

#===============================================================================
# Metrics-collection methods
#===============================================================================

def add_device_info_metrics(slb, metrics)
  metrics['cpu.count']              = slb.cpu_count
  metrics['cpu.temp_c']             = slb.cpu_temp_c
  metrics['cpu.temp_f']             = slb.cpu_temp_f
  metrics['cpu.data_cpu_usage.avg'] = slb.data_cpu_avg
  metrics['cpu.mgmt_cpu_usage.avg'] = slb.mgmt_cpu_avg

  slb.data_cpu_usages.each_with_index do |usage,i|
    metrics['cpu.data_cpu_usage.cpu_%02d' % [i+1]] = usage
  end
  slb.mgmt_cpu_usages.each_with_index do |usage,i|
    metrics['cpu.mgmt_cpu_usage.cpu_%02d' % [i+1]] = usage
  end

  metrics['memory.percent_used'] = slb.memory_percent_used
  metrics['memory.bytes_used']   = slb.memory_bytes_used
  metrics['memory.bytes_total']  = slb.memory_bytes_total

  metrics['disk.percent_used'] = slb.disk_percent_used
  metrics['disk.bytes_used']   = slb.disk_bytes_used
  metrics['disk.bytes_total']  = slb.disk_bytes_total

  slb.fan_status.each_with_index do |status, i|
    value = status =~ /^OK/ ? 1 : 0
    metrics['fan.%02d.ok' % [i+1]] = value
  end

  slb.power_status.each_with_index do |status, i|
    value = status == 'on' ? 1 : 0
    metrics['power.%d.ok' % [i+1]] = value
  end
end

def add_network_interface_metrics(slb, metrics)
  slb.network_interface_stats.each do |port, data|
    path = 'network_interface.%02d' % port
    metrics["#{path}.mtu"]           = data[:mtu]
    metrics["#{path}.admin_status"]  = data[:admin_status]
    metrics["#{path}.oper_status"]   = data[:oper_status]
    metrics["#{path}.capacity"]      = data[:capacity]
    metrics["#{path}.in_bit_rate"]   = data[:in_bit_rate]
    metrics["#{path}.out_bit_rate"]  = data[:out_bit_rate]
    metrics["#{path}.in_usage_pct"]  = data[:in_usage]
    metrics["#{path}.out_usage_pct"] = data[:out_usage]
  end
end

def add_virtual_server_metrics(slb, metrics)
  slb.virtual_server_stats.each do |vserver_name, data|
    path = "virtual_servers.#{vserver_name}"

    metrics["#{path}.status"]        = data[:status]
    metrics["#{path}.curr_conns"]    = data[:cur_conns]
    metrics["#{path}.tot_conn_rate"] = data[:tot_conn_rate]
    metrics["#{path}.req_pkt_rate"]  = data[:req_pkt_rate]
    metrics["#{path}.resp_pkt_rate"] = data[:resp_pkt_rate]
    metrics["#{path}.req_bit_rate"]  = data[:req_bit_rate]
    metrics["#{path}.resp_bit_rate"] = data[:resp_bit_rate]

    data[:vport_stat_list].each do |port, portdata|
      service_group = slb.virtual_server_configs[vserver_name][:vport_list][port][:service_group] rescue nil
      group_health = slb.service_group_configs[service_group][:pct_hosts_up] rescue 0

      metrics["#{path}.ports.#{port}.pool_health_pct"] = group_health
      metrics["#{path}.ports.#{port}.status"]          = portdata[:status]
      metrics["#{path}.ports.#{port}.curr_conns"]      = portdata[:cur_conns]
      metrics["#{path}.ports.#{port}.tot_conn_rate"]   = portdata[:tot_conn_rate]
      metrics["#{path}.ports.#{port}.req_pkt_rate"]    = portdata[:req_pkt_rate]
      metrics["#{path}.ports.#{port}.resp_pkt_rate"]   = portdata[:resp_pkt_rate]
      metrics["#{path}.ports.#{port}.req_bit_rate"]    = portdata[:req_bit_rate]
      metrics["#{path}.ports.#{port}.resp_bit_rate"]   = portdata[:resp_bit_rate]
    end
  end
end

def add_service_group_metrics(slb, metrics)
  slb.service_group_stats.each do |group_name, data|
    path = "service_groups.#{group_name}"
    config = slb.service_group_configs[group_name]
    metrics["#{path}.status"]          = data[:status]
    metrics["#{path}.curr_conns"]      = data[:cur_conns]
    metrics["#{path}.tot_conn_rate"]   = data[:tot_conn_rate]
    metrics["#{path}.req_pkt_rate"]    = data[:req_pkt_rate]
    metrics["#{path}.resp_pkt_rate"]   = data[:resp_pkt_rate]
    metrics["#{path}.req_bit_rate"]    = data[:req_bit_rate]
    metrics["#{path}.resp_bit_rate"]   = data[:resp_bit_rate]
    metrics["#{path}.num_hosts_total"] = config[:num_hosts_total]
    metrics["#{path}.num_hosts_up"]    = config[:num_hosts_up]
    metrics["#{path}.pct_hosts_up"]    = config[:pct_hosts_up]
  end
end

#===============================================================================
# Main
#===============================================================================

slb = nil

begin
  # Parse the command line
  cli.parse
  raise ArgumentError, 'please specify the SLB host:port' unless cli.slb

  slb_host = cli.slb.split(':').first
  metrics_host = cli.metrics_host.first rescue nil
  metrics_port = cli.metrics_host.last rescue nil

  # Prepend the modified SLB FQDN to the prefix
  prefix = (cli.prefix ? cli.prefix + '.' + slb_host.gsub('.', '_') : '')

  if cli.verbose
    puts "A10 SLB:      #{cli.slb}"
    puts "Prefix:       #{prefix}"
    puts "Frequency:    #{cli.freq} sec"
    puts "Metrics Host: #{cli.metrics_host || '<none>'}"
    puts
  end

  # Set up the metrics formatter
  formatter = GraphiteFormatter.new(
    :prefix => prefix,
    :host   => metrics_host,
    :port   => metrics_port
  )

  # Prepare to get metrics from the SLB
  slb = A10LoadBalancer.new(cli.slb)

  # Main loop: collect metrics and output them
  loop do
    start_time = Time.now.to_f
    puts "#{Utils.timestamp} - Collecting metrics" if cli.verbose

    # Clear out any existing metrics
    slb.clear

    # Collect metrics
    metrics = {}
    add_device_info_metrics       slb, metrics
    add_network_interface_metrics slb, metrics
    add_virtual_server_metrics    slb, metrics
    add_service_group_metrics     slb, metrics

    # Send the metrics
    formatter.send(metrics, start_time)

    # Sleep until the next iteration
    sleep_sec = (start_time + cli.freq) - Time.now.to_f
    if sleep_sec > 0
      puts "#{Utils.timestamp} - Sleeping for %0.1f sec" % [sleep_sec] if cli.verbose
      sleep(sleep_sec)
    end
  end

rescue => e
  puts Utils.pretty_backtrace(e) if cli.verbose
  abort "#{e.class.name}: #{e.message}"
ensure
  slb.close_session if slb
end
