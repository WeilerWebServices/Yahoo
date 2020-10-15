#! /usr/bin/env ruby

# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

#===============================================================================
# Application class for a10cli utility. Handles usage info, argument parsing,
# and running the proper command.
#===============================================================================

module A10CLI

class Application
  SYNOPSIS = <<-STR
__APPNAME__ -s <slb>[:port] <command> [options] [args]
STR

  DESCRIPTION = <<-STR
Command line interface for querying basic info from an A10 load balancer. By default
this will print a list of items. Use the --full option to print additional info.
STR

  COMMANDS = <<-STR
device        Show device info: cpu, disk, memory, power
group         List service groups, or hosts in a group
nic           List network interfaces
vserver       List vservers, or host groups behind a vserver
STR

  EXAMPLES = <<-STR
__APPNAME__ -s slb1.foo.com device          # List device info
__APPNAME__ -s slb1.foo.com group           # List all service groups
__APPNAME__ -s slb1.foo.com group NAME      # List hosts in service group
__APPNAME__ -s slb1.foo.com nic             # List all NICs
__APPNAME__ -s slb1.foo.com vserver         # List all vservers
__APPNAME__ -s slb1.foo.com vserver NAME    # List host groups backing a vserver
STR

  def initialize
    @cli = CommandLine.new(
      :synopsis => SYNOPSIS, :description => DESCRIPTION,
      :commands => COMMANDS, :examples => EXAMPLES)

    @cli.option(:slb, '-s', '--slb HOST[:PORT]', "SLB host and port. Assumes port 80 if not specified.") do |v|
      v
    end
    @cli.option(:full, '-f', '--full', "Print full info instead of a simple list of items.") do |v|
      true
    end
    @cli.option(:verbose, '-v', '--verbose', "Enable verbose output, including backtraces.") do
      true
    end
    @cli.option(:version, nil, '--version', "Print the version string and exit.") do
      puts A10_MONITORING_VERSION_MESSAGE
      exit
    end
  end

  def run
    begin
      # Parse command-line arguments
      @cli.parse
      raise ArgumentError, 'please specify the SLB host:port via -s' unless @cli.slb
      command = (@cli.positional.shift or raise ArgumentError, "no command specified").downcase

      # Run the proper command
      case command
      when 'device'  then A10CLI::Commands::Device.run(@cli)
      when 'group'   then A10CLI::Commands::Group.run(@cli)
      when 'nic'     then A10CLI::Commands::NIC.run(@cli)
      when 'vserver' then A10CLI::Commands::VServer.run(@cli)
      else           abort "a10cli: Unknown command '#{command}'"
      end

    rescue Errno::EPIPE
      # If piping output to another command (eg. 'head'), that command may exit
      # before this one does. In such cases, just exit silently.
    rescue => e
      puts (@cli.verbose ? Utils.pretty_backtrace(e) : "a10cli: #{e.class.name}: #{e.message}")
    end
  end
end

end
