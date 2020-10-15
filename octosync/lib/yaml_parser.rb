require 'yaml'

# Class YamlParser
#
# This class contains library methods to parse
# various values from a yaml file
class YamlParser
  attr_accessor :yaml_file

  def initialize(params = {})
    params.each { |key, value| instance_variable_set("@#{key}", value) }
    @yaml = YAML.load_file(@yaml_file)
  end

  def ghe_host
    @yaml['github']['settings']['ghe_host']
  end

  def ghe_token
    @yaml['github']['settings']['ghe_token']
  end

  def github_token
    @yaml['github']['settings']['github_token']
  end

  def git_dir
    @yaml['github']['settings']['git_dir']
  end

  def repo_list
    @yaml['github']['repos']
  end
end
