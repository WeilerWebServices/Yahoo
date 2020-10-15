# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

#===============================================================================
# 'group' command class. Shows service group info. For raw API output, use:
#
#     sudo ./bin/query_a10_api.rb -s $SLB -m slb.service_group.getAll
#     sudo ./bin/query_a10_api.rb -s $SLB -m slb.service_group.fetchAllStatistics
#
#===============================================================================

module A10CLI
module Commands

class Group
  # Run the 'group' command
  def self.run(cli)
    begin
      slb = A10LoadBalancer.new(cli.slb, sleep_sec: 1)
      arg = cli.positional.first

      if cli.full
        results = get_full_results(slb)
        raise RuntimeError, "group not found: #{arg}" if arg && !results[arg]
        results = results[arg] if arg
        puts results.to_yaml
      else
        if arg
          puts get_hosts_in_group(slb, arg)
        else
          puts slb.service_group_names.sort.join("\n")
        end
      end
    rescue RuntimeError => e
      abort "a10cli: " + e.message
    end
  end

  # Convert service group status to string
  def self.group_status_str(code)
    case code
    when 0 then 'Disabled'
    when 1 then 'All_up'
    when 2 then 'Partial_up'
    when 3 then 'Func_up'
    when 4 then 'Down'
    else        'Unknown'
    end
  end

  # Convert host status to string
  def self.host_status_str(code)
    case code
    when 1 then 'Up'
    when 4 then 'Down'
    else        'Unknown'
    end
  end

  # Get full results, as a hash
  def self.get_full_results(slb)
    results = {}

    slb.service_group_stats.each do |name,data|
      # Gather host data
      hosts = []
      data[:member_stat_list].each do |host|
        hosts << {
          'server'    => host[:server],
          'port'      => host[:port],
          'status'    => '%d (%s)' % [host[:status], host_status_str(host[:status])],
          'cur_conns' => host[:cur_conns],
        }
      end

      # Construct results hash
      results[name] = {
        'name'      => name,
        'status'    => '%d (%s)' % [data[:status], group_status_str(data[:status])],
        'cur_conns' => data[:cur_conns],
        'conn_rate' => '%d conns/s' % data[:tot_conn_rate],
        'req_rate'  => Utils.pretty_rate(data[:req_bit_rate], :bits),
        'resp_rate' => Utils.pretty_rate(data[:resp_bit_rate], :bits),
        'members'   => hosts,
      }
    end
    results
  end

  # Get the list of hosts in a service group, as an array
  def self.get_hosts_in_group(slb, name)
    results = []
    groups = slb.service_group_configs
    raise RuntimeError, "group not found: #{name}" unless groups[name]
    groups[name][:member_list].each do |m|
      results << '%s:%d' % [m[:server], m[:port]]
    end
    results
  end
end

end
end
