# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

Dir.glob(File.join(File.dirname(__FILE__), 'a10_monitoring/**/*.rb')).each do |file|
  require file
end
