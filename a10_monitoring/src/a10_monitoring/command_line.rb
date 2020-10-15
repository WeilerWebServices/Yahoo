# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

require 'optparse'

#===============================================================================
# Command-line application argument parser and usage info
#===============================================================================

class CommandLine
  attr_accessor :appname, :synopsis, :description, :commands, :examples,
                :positional, :help

  # Initialize the CommandLine. Options include:
  #
  #   :description   Multi-line description of the application.
  #   :examples      Multi-line application usage examples.
  #
  def initialize(options = {})
    @appname     = File.basename($0)
    @synopsis    = []
    @description = []
    @commands    = []
    @examples    = []
    @options     = {}
    @parser = OptionParser.new do |opts|
      opts.summary_width = 10
      opts.banner = ''
      opts.on('-h', '--help', 'Display this help text.') do
        @help = true
      end
    end
    self.synopsis    = options[:synopsis]    if options[:synopsis]
    self.description = options[:description] if options[:description]
    self.commands    = options[:commands]    if options[:commands]
    self.examples    = options[:examples]    if options[:examples]
  end

  # Set the application synopsis
  def synopsis=(str)
    @synopsis = _parse_usage_string(str)
  end

  # Set the application description
  def description=(str)
    @description = _parse_usage_string(str)
  end

  # Set the list of commands
  def commands=(str)
    @commands = _parse_usage_string(str)
  end

  # Set the application usage examples
  def examples=(str)
    @examples = _parse_usage_string(str)
  end

  # Helper method to parse an input string, replace __APPNAME__ with the app name,
  # split into lines, and return an array of lines
  def _parse_usage_string(str)
    str.gsub('__APPNAME__', @appname).strip.split("\n").map { |s| "    #{s.rstrip}\n" }
  end

  # Add an option. Eg:
  #
  #     # Set the option, return the value to save
  #     args.option(:threshold, '-t', '--threshold VAL', 'A threshold value') do |v|
  #       Float(v)
  #     end
  #
  #     # For flags, no need to return the value 'true'
  #     args.option(:flag, '-f', '--flag', 'a flag')
  #
  #     # Grab the values after parsing
  #     args.threshold
  #     args.flag
  #
  def option(name, short, long, desc, default = nil, &block)
    # Save the option's default value and add the OptionParser logic
    @options[name] = default
    desc += " (default: #{default})" if default
    desc = desc.split("\n")
    @parser.on(short, long, *desc) do |v|
      @options[name] = (block_given? ? yield(v) : true)
    end
    # Widen the summary width if needed
    width = 2 + (short ? 4 : 0) + long.to_s.size
    @parser.summary_width = [@parser.summary_width, width].max
  end

  # Get the usage info string
  def usage
    str = "NAME\n"
    str += "    #@appname\n\n"
    unless @synopsis.empty?
      str += "SYNOPSIS\n"
      str += @synopsis.join + "\n"
    end
    unless @description.empty?
      str += "DESCRIPTION\n"
      str += @description.join + "\n"
    end
    unless @commands.empty?
      str += "COMMANDS\n"
      str += @commands.join + "\n"
    end
    str += "OPTIONS"
    str += @parser.to_s.rstrip + "\n\n"
    unless @examples.empty?
      str += "EXAMPLES\n"
      str += @examples.join + "\n"
    end
    str
  end

  # Parse an arguments array and return a new CommandLine object
  def self.parse(argv = ARGV)
    CommandLine.new.parse(argv)
  end

  # Parse an arguments array and populate this CommandLine object.
  # - Will print usage info and exit if help is requested.
  # - Will print an error message and abort if required inputs are missing.
  def parse(argv = ARGV)
    # Work off a copy of the arg array
    argv = argv.dup

    # Parse options and check for errors, or a help request
    print_usage_and_exit if argv.empty? && STDIN.tty?
    @parser.parse!(argv)
    @positional = argv
    print_usage_and_exit if self.help

    # Return self
    self
  end

  # Does what you think
  def print_usage_and_exit
    puts usage
    exit
  end

  # Look up an option's value and return it
  def method_missing(method_sym, *arguments, &block)
    return @options[method_sym] if @options.include?(method_sym)
    super
  end
end
