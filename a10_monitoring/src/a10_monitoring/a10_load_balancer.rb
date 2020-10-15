# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

#===============================================================================
# The A10LoadBalancer class provides a high-level interface to A10 metrics. It
# uses the A10RestApi internally to query the REST API. HTTP requests will be
# made lazily, ie. only when needed.
#===============================================================================

class A10LoadBalancer
  # Seconds to wait between first and second API query, for rate calculations
  QUERY_SLEEP_SEC = 5

  # Initialize the A10LoadBalancer object. Will raise on error.
  # Params:
  #     host          A10 hostname and, optionally, port. Format: "host[:port]".
  # Options:
  #     :creds_file   Path the to A10 credentials json file
  #     :use_ssl      Force the use of SSL. SSL is used by default for port 443.
  #     :sleep_sec    Seconds to sleep between querying stats for rate data
  def initialize(host, options = {})
    @api = A10RestApi.new(host, options)
    @query_sleep_sec = options[:sleep_sec] || QUERY_SLEEP_SEC
  end

  # Close the current session, if open
  def close_session
    @api.close_session
  end

  # Clear out all existing metrics, so that new metrics will be collected
  def clear
    @cpu_usage = nil
    @device_info = nil
    @virtual_server_configs = nil
    @virtual_server_stats = nil
    @service_group_configs = nil
    @service_group_stats = nil
    @network_interface_configs = nil
    @network_interface_stats = nil
  end

  #-----------------------------------------------------------------------------
  # CPU
  #-----------------------------------------------------------------------------

  # Get the number of CPUs
  def cpu_count
    get_device_info[:cpu_count]
  end

  # Get the CPU status string
  def cpu_status
    get_device_info[:cpu_status]
  end

  # Return the cpu temp, in degrees Celsius
  def cpu_temp_c
    get_device_info[:cpu_temp_c]
  end

  # Return the cpu temp, in degrees Fahrenheit
  def cpu_temp_f
    get_device_info[:cpu_temp_f]
  end

  # Return the average data cpu usage
  def data_cpu_avg
    get_cpu_usage[:data_cpu_avg]
  end

  # Return the average mgmt cpu usage
  def mgmt_cpu_avg
    get_cpu_usage[:mgmt_cpu_avg]
  end

  # Return the array of data cpu usages, one entry per cpu
  def data_cpu_usages
    get_cpu_usage[:data_cpu_usages]
  end

  # Return the array of mgmt cpu usages, one entry per cpu
  def mgmt_cpu_usages
    get_cpu_usage[:mgmt_cpu_usages]
  end

  #-----------------------------------------------------------------------------
  # Memory
  #-----------------------------------------------------------------------------

  # Get the percent of memory used
  def memory_percent_used
    info = get_device_info
    100.0 * info[:memory_used] / info[:memory_total]
  end

  # Return the amount of used memory, in bytes
  def memory_bytes_used
    get_device_info[:memory_used]
  end

  # Return the amount of total memory, in bytes
  def memory_bytes_total
    get_device_info[:memory_total]
  end

  #-----------------------------------------------------------------------------
  # Disk
  #-----------------------------------------------------------------------------

  # Get the percent of disk used
  def disk_percent_used
    info = get_device_info
    100.0 * info[:disk_used] / info[:disk_total]
  end

  # Return the amount of disk space used, in bytes
  def disk_bytes_used
    get_device_info[:disk_used]
  end

  # Return the total disk capacity, in bytes
  def disk_bytes_total
    get_device_info[:disk_total]
  end

  # Return an array of disk status strings, one per disk
  def disk_status
    get_device_info[:disk_status]
  end

  #-----------------------------------------------------------------------------
  # Fans, Power
  #-----------------------------------------------------------------------------

  # Return an array of fan status strings, one per fan
  def fan_status
    get_device_info[:fan_status]
  end

  # Return an array of power supply status strings, one per power supply
  def power_status
    get_device_info[:power_status]
  end

  #-----------------------------------------------------------------------------
  # Virtual Servers
  #-----------------------------------------------------------------------------

  # Return a sorted array of virtual server names
  def virtual_server_names
    get_virtual_server_configs.keys.sort
  end

  # Return a hash of virtual server configurations.
  # - Each key is a name, and each value is a hash of data.
  # - If given a name, return only the data for that name.
  def virtual_server_configs
    get_virtual_server_configs
  end

  # Return a hash of virtual server statistics.
  # - Each key is a name, and each value is a hash of data.
  # - If given a name, return only the data for that name.
  def virtual_server_stats
    get_virtual_server_stats
  end

  #-----------------------------------------------------------------------------
  # Service Groups
  #-----------------------------------------------------------------------------

  # Return a sorted array of service group names
  def service_group_names
    get_service_group_configs.keys.sort
  end

  # Return a hash of service group configurations.
  # - Each key is a name, and each value is a hash of data.
  def service_group_configs
    get_service_group_configs
  end

  # Return a hash of service group statistics.
  # - Each key is a name, and each value is a hash of stats.
  def service_group_stats
    get_service_group_stats
  end

  #-----------------------------------------------------------------------------
  # Network Interfaces
  #-----------------------------------------------------------------------------

  # Return a sorted array of network interface port numbers
  def network_interface_port_nums
    get_network_interface_configs.keys.sort
  end

  # Return a hash of network interface configurations.
  # - Each key is a port number, and each value is a hash of data.
  def network_interface_configs
    get_network_interface_configs
  end

  # Return a hash of network interface statistics.
  # - Each key is a port number, and each value is a hash of data.
  def network_interface_stats
    get_network_interface_stats
  end

  #-----------------------------------------------------------------------------
  # Private data-fetching methods
  #-----------------------------------------------------------------------------

  private

  # Populate the CPU data hash, if needed, and return it
  def get_cpu_usage
    unless @cpu_usage
      data = @api.get('system.device_info.cpu.current_usage.get')['Current_cpu_usage']
      data_cpu_usages = data['current_data_cpu_usage_list'].map { |x| x['cpu_usage(%)'] }
      mgmt_cpu_usages = data[ 'current_mgm_cpu_usage_list'].map { |x| x['cpu_usage(%)'] }
      @cpu_usage = {
        :data_cpu_avg    => Utils.average(data_cpu_usages),
        :mgmt_cpu_avg    => Utils.average(mgmt_cpu_usages),
        :data_cpu_usages => data_cpu_usages,
        :mgmt_cpu_usages => mgmt_cpu_usages,
      }
    end
    @cpu_usage
  end

  # Populate the device info hash, if needed, and return it
  def get_device_info
    unless @device_info
      data = @api.get('system.device_info.get')['device_information']
      @device_info = {
        :cpu_count    => data['cpu_count'],
        :cpu_status   => data['cpu_status'],
        :cpu_temp_c   => data['cpu_temperature']['temperature_C'],
        :cpu_temp_f   => data['cpu_temperature']['temperature_F'],
        :memory_used  => data['memory_usage']['used(KB)'] * 1024,
        :memory_total => data['memory_usage']['total(KB)'] * 1024,
        :disk_used    => data['disk_usage']['used(KB)'] * 1024,
        :disk_total   => data['disk_usage']['total(KB)'] * 1024,
        :disk_status  => data['disk_status'].to_a.sort.map { |p| p[1] },
        :fan_status   => data['fan_status'].map { |x| x['status'] },
        :power_status => data['power_supply'].to_a.sort.map { |p| p[1] },
      }
    end
    @device_info
  end

  # Get the virtual server configs
  def get_virtual_server_configs
    unless @virtual_server_configs
      data = @api.get('slb.virtual_server.getAll')['virtual_server_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:name], x] }]
      data.each { |k,v| v[:vport_list] = Hash[v[:vport_list].map { |x| [x[:port], x ] } ] }
      @virtual_server_configs = data
    end
    @virtual_server_configs
  end

  # Get the virtual server stats
  def get_virtual_server_stats
    unless @virtual_server_stats
      # Fetch the first set of data
      data = @api.get('slb.virtual_server.fetchAllStatistics')['virtual_server_stat_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:name], x] }]
      data.each { |k,v| v[:vport_stat_list] = Hash[v[:vport_stat_list].map { |x| [x[:port], x ] } ] }
      prevdata = data

      # Wait before fetching again
      sleep @query_sleep_sec

      # Fetch the second set of data
      data = @api.get('slb.virtual_server.fetchAllStatistics')['virtual_server_stat_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:name], x] }]
      data.each { |k,v| v[:vport_stat_list] = Hash[v[:vport_stat_list].map { |x| [x[:port], x ] } ] }
      currdata = data

      # Compute rates (conns, packets, bits) for each vserver and all ports
      currdata.each do |name, curr|
        prev = prevdata[name]
        curr[:tot_conn_rate] = (curr[:tot_conns] - prev[:tot_conns]) / @query_sleep_sec
        curr[:req_pkt_rate]  = (curr[:req_pkts] - prev[:req_pkts]) / @query_sleep_sec
        curr[:resp_pkt_rate] = (curr[:resp_pkts] - prev[:resp_pkts]) / @query_sleep_sec
        curr[:req_bit_rate]  = 8 * (curr[:req_bytes] - prev[:req_bytes]) / @query_sleep_sec
        curr[:resp_bit_rate] = 8 * (curr[:resp_bytes] - prev[:resp_bytes]) / @query_sleep_sec

        curr[:vport_stat_list].each do |portnum,currport|
          prevport = prev[:vport_stat_list][portnum]
          if currport[:port] == prevport[:port] && currport[:protocol] == prevport[:protocol]
            currport[:tot_conn_rate] = (currport[:tot_conns] - prevport[:tot_conns]) / @query_sleep_sec
            currport[:req_pkt_rate]  = (currport[:req_pkts] - prevport[:req_pkts]) / @query_sleep_sec
            currport[:resp_pkt_rate] = (currport[:resp_pkts] - prevport[:resp_pkts]) / @query_sleep_sec
            currport[:req_bit_rate]  = 8 * (currport[:req_bytes] - prevport[:req_bytes]) / @query_sleep_sec
            currport[:resp_bit_rate] = 8 * (currport[:resp_bytes] - prevport[:resp_bytes]) / @query_sleep_sec
          end
        end
      end

      # Save the data
      @virtual_server_stats = currdata
    end
    @virtual_server_stats
  end

  # Get the service group configs
  def get_service_group_configs
    unless @service_group_configs
      data = @api.get('slb.service_group.getAll')['service_group_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:name], x] }]

      # Add num-hosts-up fields to each group
      data.each do |name, fields|
        num_hosts_total = fields[:member_list].count
        num_hosts_up    = fields[:member_list].select { |x| x[:status] == 1 }.count
        pct_hosts_up    = (100.0 * num_hosts_up / num_hosts_total).to_i rescue 0
        fields[:num_hosts_total] = num_hosts_total
        fields[:num_hosts_up]    = num_hosts_up
        fields[:pct_hosts_up]    = pct_hosts_up
      end

      @service_group_configs = data
    end
    @service_group_configs
  end

  # Get the service group stats
  def get_service_group_stats
    unless @service_group_stats
      # Fetch the first set of data
      data = @api.get('slb.service_group.fetchAllStatistics')['service_group_stat_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:name], x] }]
      prevdata = data

      # Wait before fetching again
      sleep @query_sleep_sec

      # Fetch the second set of data
      data  = @api.get('slb.service_group.fetchAllStatistics')['service_group_stat_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:name], x] }]
      currdata = data

      # Compute rates (conns, packets, bits) for each service group
      currdata.each do |name, curr|
        prev = prevdata[name]
        curr[:tot_conn_rate] = (curr[:tot_conns] - prev[:tot_conns]) / @query_sleep_sec
        curr[:req_pkt_rate]  = (curr[:req_pkts] - prev[:req_pkts]) / @query_sleep_sec
        curr[:resp_pkt_rate] = (curr[:resp_pkts] - prev[:resp_pkts]) / @query_sleep_sec
        curr[:req_bit_rate]  = 8 * (curr[:req_bytes] - prev[:req_bytes]) / @query_sleep_sec
        curr[:resp_bit_rate] = 8 * (curr[:resp_bytes] - prev[:resp_bytes]) / @query_sleep_sec
      end

      # Save the data
      @service_group_stats = currdata
    end
    @service_group_stats
  end

  # Get the network interface configs
  def get_network_interface_configs
    unless @network_interface_configs
      data = @api.get('network.interface.getAll')['interface_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:port_num], x] }]
      @network_interface_configs = data
    end
    @network_interface_configs
  end

  # Get the network interface stats
  def get_network_interface_stats
    unless @network_interface_stats
      # Fetch first set of data
      data = @api.get('network.interface.fetchAllStatistics')['interface_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:port_num], x] }]
      prevdata = data

      # Wait before fetching again
      sleep @query_sleep_sec

      # Fetch second set of data
      data = @api.get('network.interface.fetchAllStatistics')['interface_list']
      data = Utils.symbolize_json_keys(data)
      data = Hash[data.map { |x| [x[:port_num], x] }]
      currdata = data

      # Calculate additional fields and add them to currdata
      currdata.each do |port,curr|
        prev = prevdata[port]
        curr[:capacity]     = Utils.link_speed_to_capacity(curr[:speed])
        curr[:in_bit_rate]  = 8 * (curr[:in_bytes] - prev[:in_bytes]) / @query_sleep_sec
        curr[:out_bit_rate] = 8 * (curr[:out_bytes] - prev[:out_bytes]) / @query_sleep_sec
        curr[:in_usage]     = 100.0 * curr[:in_bit_rate] / curr[:capacity]
        curr[:out_usage]    = 100.0 * curr[:out_bit_rate] / curr[:capacity]
      end

      # Save the results
      @network_interface_stats = currdata
    end
    @network_interface_stats
  end
end
