#!/usr/bin/ruby

require 'octokit'
require 'logger'
require 'fileutils'

# Class GithubSync
#
# This class contains library methods to sync repos
# from github.com to GHE (GitHub Enterprise)
class GithubSync
  attr_accessor :git_dir, :ghe_host, :ghe_token, :github_token, :github_client, :ghe_client, :logger

  def initialize(params = {})
    params.each { |key, value| instance_variable_set("@#{key}", value) }

    # Setup weekly rotating log file
    @logger = Logger.new('github_sync.log', 'weekly')

    # Setup github and ghe clients
    @github_client = Octokit::Client.new(access_token: @github_token)
    Octokit.api_endpoint = 'https://' + @ghe_host + '/api/v3/'
    @ghe_client = Octokit::Client.new(access_token: @ghe_token)
  end

  # rubocop:disable Metrics/AbcSize
  # rubocop:disable Metrics/CyclomaticComplexity
  # rubocop:disable Metrics/PerceivedComplexity
  def sync_repo(org, repo)
    full_repo_name = "#{org}/#{repo}"
    full_repo_path = "#{@git_dir}/#{org}/#{repo}"

    # check whether repo exists on github.com
    is_github_repo = @github_client.repository?(full_repo_name)

    # check whether repo previously cloned
    is_cloned = Dir.exist?(full_repo_path)

    # check whether repo exists on ghe host
    is_ghe_repo = @ghe_client.repository?(full_repo_name)

    if is_github_repo
      if is_cloned && is_ghe_repo
        fetch_repo(full_repo_path)
        push_repo(full_repo_path)
      elsif is_cloned && !is_ghe_repo
        create_repo(org, repo)
        fetch_repo(full_repo_path)
        push_repo(full_repo_path)
      elsif !is_cloned && is_ghe_repo
        @logger.error 'Repo already exists on ghe'
      else
        clone_repo(full_repo_name, full_repo_path)
        create_repo(org, repo)
        push_repo(full_repo_path)
      end
    else
      @logger.error "Repo doesn't exist on github.com"
    end
  end

  def clone_repo(full_repo_name, full_repo_path)
    FileUtils.mkdir_p(full_repo_path) unless Dir.exist?(full_repo_path)
    system("git clone --mirror https://github.com/#{full_repo_name}.git #{full_repo_path}")

    Dir.chdir("#{full_repo_path}") do
      system("git remote set-url --push origin git@#{@ghe_host}:#{full_repo_name}.git")
    end
  end

  def push_repo(full_repo_path)
    Dir.chdir("#{full_repo_path}") do
      system('git push origin --mirror')
    end
  end

  def fetch_repo(full_repo_path)
    Dir.chdir("#{full_repo_path}") do
      system('git fetch origin')
    end
  end

  def create_repo(org, repo)
    full_repo_name = "#{org}/#{repo}"

    if @ghe_client.organization(@org).nil?
      @logger.error "Organization not found. Please create an organization called: #{org}."
    else
      @logger.info "Found the organization: #{org}. Now checking for the repo: #{repo}."

      # check for the repo
      if @ghe_client.repository?(full_repo_name)
        @logger.info "The Repo: #{full_repo_name} exists."
      else
        @logger.info "The Repo: #{full_repo_name} not found. Creating a new one."
        # rubocop:disable Lint/UselessAssignment
        @ghe_client.create_repository(repo, options = { organization: org })
      end
    end
  rescue
    @logger.error "The repo: #{full_repo_name} creation failed."
  end
end
