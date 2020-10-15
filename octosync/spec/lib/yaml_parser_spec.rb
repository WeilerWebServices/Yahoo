# yaml_parser.rb
require 'yaml_parser'
require 'spec_helper'

describe YamlParser do
  let(:yaml_parser) do
    YamlParser.new(yaml_file: './spec/mock_files/config.yml')
  end

  it 'initilizes the class' do
    expect(yaml_parser.yaml_file).to eq('./spec/mock_files/config.yml')
  end

  it 'should return ghe_host from the config.yaml' do
    expect(yaml_parser.ghe_host).to eq('opensource.git.corp.yahoo.com')
  end

  it 'should return ghe_token from the config.yaml' do
    expect(yaml_parser.ghe_token).to eq('dummy ghe token')
  end

  it 'should return github_token from the config.yaml' do
    expect(yaml_parser.github_token).to eq('dummy github token')
  end

  it 'should return git_dir from the config.yaml' do
    expect(yaml_parser.git_dir).to eq('/tmp')
  end

  it 'should return list of repos from the config.yaml' do
    expect(yaml_parser.repo_list).to eq(['git/git', 'resque/resque'])
  end
end
