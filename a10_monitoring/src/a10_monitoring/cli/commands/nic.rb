# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

#===============================================================================
# 'nic' command class. Shows network interface info. For raw API output, use:
#
#     sudo ./bin/query_a10_api.rb -s $SLB -m network.interface.getAll
#     sudo ./bin/query_a10_api.rb -s $SLB -m network.interface.fetchAllStatistics
#
#===============================================================================

module A10CLI
module Commands

class NIC
  # Run the 'nic' command
  def self.run(cli)
    slb = A10LoadBalancer.new(cli.slb, sleep_sec: 1)
    arg = cli.positional.first

    if cli.full
      results = get_full_results(slb)
      results = results[arg.to_i] if arg
      puts results.to_yaml
    else
      slb.network_interface_configs.each do |port,data|
        puts "%2d: %s" % [port, data[:mac_addr]]
      end
    end
  end

  # Get full results, as a hash
  def self.get_full_results(slb)
    results = {}
    slb.network_interface_stats.each do |port_num,data|
      results[port_num] = {
        'port_num'     => port_num,
        'mac_addr'     => data[:mac_address],
        'mtu'          => data[:mtu],
        'speed'        => data[:speed],
        'capacity'     => Utils.pretty_rate(data[:capacity], :bits),
        'in_bit_rate'  => Utils.pretty_rate(data[:in_bit_rate], :bits),
        'out_bit_rate' => Utils.pretty_rate(data[:out_bit_rate], :bits),
        'in_usage'     => '%.1f%%' % data[:in_usage],
        'out_usage'    => '%.1f%%' % data[:out_usage],
      }
    end
    results
  end
end

end
end
