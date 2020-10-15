# github_sync.rb
require 'github_sync'
require 'spec_helper'

describe GithubSync do
  let(:githubsync) do
    GithubSync.new(
      ghe_host: 'your.awesome.ghe.instance.com',
      git_dir: '/tmp',
      ghe_token: 'dummy ghe token',
      github_token: 'dummy github token')
  end

  let(:logger)  { double('Logger') }

  it 'initilizes the class' do
    expect(githubsync.ghe_host).to eq('your.awesome.ghe.instance.com')
    expect(githubsync.git_dir).to eq('/tmp')
    expect(githubsync.ghe_token).to eq('dummy ghe token')
    expect(githubsync.github_token).to eq('dummy github token')
  end

  it 'should throw an error if repo doesnt exists on github.com' do
    allow(githubsync.github_client).to receive(:repository).and_return(false)
    allow(githubsync.ghe_client).to receive(:repository).and_return(false)

    expect(githubsync.logger).to receive(:error).with("Repo doesn't exist on github.com")

    githubsync.sync_repo('test_org/test_repo', '/tmp/test_org')
  end

  it 'should call fetch and push' do
    allow(githubsync.github_client).to receive(:repository).and_return(true)
    allow(githubsync.ghe_client).to receive(:repository).and_return(true)
    allow(Dir).to receive(:exist?).and_return(true)
    allow(githubsync).to receive(:push_repo)
    allow(githubsync).to receive(:fetch_repo)

    expect(githubsync).to receive(:push_repo).once
    expect(githubsync).to receive(:fetch_repo).once

    githubsync.sync_repo('test_org', 'test_repo')
  end

  it 'should call create_repo, fetch and push' do
    allow(githubsync.github_client).to receive(:repository).and_return(true)
    allow(githubsync.ghe_client).to receive(:repository).and_return(false)
    allow(Dir).to receive(:exist?).and_return(true)
    allow(githubsync).to receive(:push_repo)
    allow(githubsync).to receive(:fetch_repo)
    allow(githubsync).to receive(:create_repo)

    expect(githubsync).to receive(:push_repo).once
    expect(githubsync).to receive(:fetch_repo).once
    expect(githubsync).to receive(:create_repo).once

    githubsync.sync_repo('test_org', 'test_repo')
  end

  it 'should throw an error if repo already exists' do
    allow(githubsync.github_client).to receive(:repository).and_return(true)
    allow(githubsync.ghe_client).to receive(:repository).and_return(true)
    allow(Dir).to receive(:exist?).and_return(false)
    allow(githubsync).to receive(:push_repo)
    allow(githubsync).to receive(:fetch_repo)
    allow(githubsync).to receive(:create_repo)

    expect(githubsync.logger).to receive(:error).with('Repo already exists on ghe')

    githubsync.sync_repo('test_org', 'test_repo')
  end

  it 'should call clone_repo, create_repo and push_repo' do
    allow(githubsync.github_client).to receive(:repository).and_return(true)
    allow(githubsync.ghe_client).to receive(:repository).and_return(false)
    allow(Dir).to receive(:exist?).and_return(false)
    allow(githubsync).to receive(:push_repo)
    allow(githubsync).to receive(:clone_repo)
    allow(githubsync).to receive(:create_repo)

    expect(githubsync).to receive(:push_repo).once
    expect(githubsync).to receive(:clone_repo).once
    expect(githubsync).to receive(:create_repo).once

    githubsync.sync_repo('test_org', 'test_repo')
  end

  it 'should call clone_repo' do
    allow(Dir).to receive(:exist?).and_return(false)
    allow(Dir).to receive(:mkdir).and_return('/tmp/test_org')
    allow(Dir).to receive(:chdir).with('/tmp/test_org').and_yield

    expect(githubsync).to receive(:system)
      .with('git clone --mirror https://github.com/test_org/test_repo.git /tmp/test_org')

    expect(githubsync).to receive(:system)
      .with('git remote set-url --push origin git@your.awesome.ghe.instance.com:test_org/test_repo.git')

    githubsync.clone_repo('test_org/test_repo', '/tmp/test_org')
  end

  it 'should call push_repo' do
    allow(Dir).to receive(:chdir).with('/tmp/test_org').and_yield

    expect(githubsync).to receive(:system)
      .with('git push origin --mirror')

    githubsync.push_repo('/tmp/test_org')
  end

  it 'should call fetch_repo' do
    allow(Dir).to receive(:chdir).with('/tmp/test_org').and_yield

    expect(githubsync).to receive(:system)
      .with('git fetch origin')

    githubsync.fetch_repo('/tmp/test_org')
  end

  it 'should throw an error if repo creation fails' do
    allow(githubsync.ghe_client).to receive(:organization).and_return(true)

    expect(githubsync.logger).to receive(:error).with('The repo: test_org/test_repo creation failed.')
    githubsync.create_repo('test_org', 'test_repo')
  end

  it 'should throw an error if orgnization does not exists' do
    allow(githubsync.ghe_client).to receive(:organization).and_return(nil)

    expect(githubsync.logger).to receive(:error).with('Organization not found. Please create an organization called: test_org.')

    githubsync.create_repo('test_org', 'test_repo')
  end

  it 'should log if repo exists' do
    allow(githubsync.ghe_client).to receive(:organization).and_return(true)
    allow(githubsync.ghe_client).to receive(:repository).and_return(true)

    expect(githubsync.logger).to receive(:info).with('Found the organization: test_org. Now checking for the repo: test_repo.')
    expect(githubsync.logger).to receive(:info).with('The Repo: test_org/test_repo exists.')

    githubsync.create_repo('test_org', 'test_repo')
  end

  it 'should check for the repo and create if it does not exists' do
    allow(githubsync.ghe_client).to receive(:organization).and_return(true)
    allow(githubsync.ghe_client).to receive(:repository).and_return(false)

    expect(githubsync.logger).to receive(:info).with('Found the organization: test_org. Now checking for the repo: test_repo.')
    expect(githubsync.logger).to receive(:info).with('The Repo: test_org/test_repo not found. Creating a new one.')

    githubsync.create_repo('test_org', 'test_repo')
  end
end
