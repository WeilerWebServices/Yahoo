# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

#===============================================================================
# 'device' command class. Shows device info. For raw API output, use:
#
#     sudo ./bin/query_a10_api.rb -s $SLB -m system.device_info.get
#     sudo ./bin/query_a10_api.rb -s $SLB -m system.device_info.cpu.current_usage.get
#
#===============================================================================

require 'yaml'

module A10CLI
module Commands

class Device
  # Run the 'device' command
  def self.run(cli)
    slb = A10LoadBalancer.new(cli.slb)
    results = {
      'device_info' => {
        'cpu' => {
          'data_cpu_count' => slb.cpu_count,
          'data_cpu_usage' => slb.data_cpu_avg.round.to_s + '%',
          'mgmt_cpu_usage' => slb.mgmt_cpu_avg.round.to_s + '%',
          'temperature_C'  => slb.cpu_temp_c,
          'temperature_F'  => slb.cpu_temp_f,
        },
        'memory' => {
          'mb_used'  => slb.memory_bytes_used / 1_000_000,
          'mb_total' => slb.memory_bytes_total / 1_000_000,
          'pct_used' => slb.memory_percent_used.round.to_s + '%',
        },
        'disk' => {
          'mb_used'  => slb.disk_bytes_used / 1_000_000,
          'mb_total' => slb.disk_bytes_total / 1_000_000,
          'pct_used' => slb.disk_percent_used.round.to_s + '%',
        },
        'power' => {
          'supply1' => slb.power_status[0],
          'supply2' => slb.power_status[1],
        },
      }
    }
    puts results.to_yaml
  end
end

end
end
