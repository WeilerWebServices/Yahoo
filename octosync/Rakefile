require 'rspec/core/rake_task'
require 'rake/clean'
require 'rubocop/rake_task'

RuboCop::RakeTask.new(:rubocop) do |task|
  task.options = ['--display-cop-names']
end

RSpec::Core::RakeTask.new(:spec)

task default: [:rubocop, :spec]
