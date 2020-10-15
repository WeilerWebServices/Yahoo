# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

#===============================================================================
# Utility functions
#===============================================================================

module Utils
  BITS_PER_GBIT = 1024 * 1024 * 1024

  # Given an amount of data, and a type (:bits, :bytes), convert to a an array
  # of [count, units], where 'count' is a float, and 'units' is a string. Eg:
  #
  #     data_to_units(123456, :bytes) => [123.456, :MB]
  #     data_to_units(123456, :bits)  => [123.456, :Mb]
  #     data_to_units(42, :bits)      => [42, :bits]
  #
  def self.data_to_units(amount, type)
    raise ArgumentError, "Invalid type #{type}" unless [:bits, :bytes].include? type
    units = (type == :bits ? %w[bits Kb Mb Gb Tb] : %w[bytes KB MB GB TB])
    count = amount.to_f
    unit = units.shift
    until count < 1000 || units.empty?
      count /= 1024
      unit = units.shift
    end
    [count, unit]
  end

  # Given an amount of data, and a type (:bits, :bytes), convert to a pretty size
  # string. Eg:
  #
  #     pretty_size(123456, :bytes) => "123.5 MB"
  #     pretty_size(123456, :bits)  => "123.5 Mb"
  #     pretty_size(42, :bits)      => "42 bits"
  #
  def self.pretty_size(amount, type)
    raise ArgumentError, "Invalid type #{type}" unless [:bits, :bytes].include? type
    size, unit = data_to_units(amount, type)
    size = sprintf("%0.1f", size)
    size.sub!(/\.0+$/, '')
    "#{size} #{unit}"
  end

  # Given a rate of data per second, and a type (:bits, :bytes), convert to a
  # pretty rate string. Eg:
  #
  #     pretty_rate(123456, :bytes) => "123.456 MB/s"
  #     pretty_rate(123456, :bits)  => "123.456 Mb/s"
  #     pretty_rate(42, :bits)      => "42 bits/s"
  #
  # - 12.3 MBps  (megabytes per sec)
  # - 1.4 Gbps   (gigabits per sec)
  def self.pretty_rate(rate, type)
    raise ArgumentError, "Invalid type #{type}" unless [:bits, :bytes].include? type
    pretty_size(rate, type) + '/s'
  end

  # Print an exception's type, error message, and backtrace
  def self.print_backtrace(e)
    puts Utils.pretty_backtrace(e)
  end

  # Print an exception's type, error message, and backtrace
  def self.pretty_backtrace(e)
    ["#{e.class.name}: #{e.message}", *e.backtrace].join("\n    ")
  end

  # Given an array of values, calculate and return the average as a float
  def self.average(values)
    values.inject(:+) / values.count.to_f
  end

  # Duplicate the given json data structure, but convert all hash keys to
  # symbols. Handles nested hashes of any depth.
  def self.symbolize_json_keys(obj)
    if obj.is_a? Array
      obj.map { |x| symbolize_json_keys(x) }
    elsif obj.is_a? Hash
      obj.inject({}) do |memo,(k,v)|
        memo[k.to_sym] = symbolize_json_keys(v)
        memo
      end
    else
      obj
    end
  end

  # Convert a link speed string such as '10G' to a number of bits
  def self.link_speed_to_capacity(speed)
    case speed
    when '1G'  then BITS_PER_GBIT
    when '10G' then BITS_PER_GBIT * 10
    when '40G' then BITS_PER_GBIT * 40
    else "Unsupported link speed '#{speed}'"
    end
  end

  # Get a string timestamp
  def self.timestamp
    #"%0.2f" % Time.now.to_f
    now = Time.now
    now.strftime("%F %T.") + (now.to_f * 100 % 100).to_i.to_s
  end
end
