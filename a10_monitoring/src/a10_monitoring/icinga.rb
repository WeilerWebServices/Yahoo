# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

#===============================================================================
# Utilities for writing Icinga check scripts in Ruby
#===============================================================================

module Icinga
  # Icinga status codes
  OK       = 0
  WARNING  = 1
  CRITICAL = 2
  UNKNOWN  = 3

  # Convert a status code to its string value
  def self.status_code_to_string(code)
    return 'OK'       if code == OK
    return 'WARNING'  if code == WARNING
    return 'CRITICAL' if code == CRITICAL
    'UNKNOWN'
  end

  # Exit with a certain value, and print a message in Icinga's standard format
  def self.quit(status, message)
    puts "#{status_code_to_string(status)}: #{message}"
    exit status
  end
end
