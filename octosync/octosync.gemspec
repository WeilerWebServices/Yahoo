Gem::Specification.new do |s|
  s.name        = 'octosync'
  s.version     = '1.0'
  s.date        = '03-24-2015'
  s.summary     = 'Github to GitHub Enterprise (GHE) repo sync'
  s.description = 'A ruby gem to sync repos from github.com to github enterprise (GHE).'
  s.authors     = ['Niral Trivedi']
  s.email       = 'niralntrivedi@yahoo.com'
  s.files       = ['lib/github_sync.rb', 'lib/yaml_parser.rb']
  s.executables << 'github_to_ghe_sync'
  s.homepage    = 'http://rubygems.org/gems/octosync'
  s.license     = 'BSD'
  s.add_runtime_dependency 'octokit', '~> 3.7'
end
