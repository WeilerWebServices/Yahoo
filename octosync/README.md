<pre align=center>
 ██████╗  ██████╗████████╗ ██████╗ ███████╗██╗   ██╗███╗   ██╗ ██████╗
██╔═══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
██║   ██║██║        ██║   ██║   ██║███████╗ ╚████╔╝ ██╔██╗ ██║██║     
██║   ██║██║        ██║   ██║   ██║╚════██║  ╚██╔╝  ██║╚██╗██║██║     
╚██████╔╝╚██████╗   ██║   ╚██████╔╝███████║   ██║   ██║ ╚████║╚██████╗
 ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝
                                                                      
</pre>
OctoSync
========

A ruby gem to sync repos from github.com to github enterprise (GHE).

Quick Start
===========

Install via <a href="https://rubygems.org/">Rubygems</a> or add to your Gemfile 
<pre>
<code>gem "octosync", "~> 1.0"</code>
</pre>
 
Configuration
=============
Create a `config.yml` file as follows:
<pre>
github:
  settings:
    ghe_host: 'Your Github Enterprise Hostname'
    ghe_token: 'GHE Access Token'
    github_token: 'github.com Access Token'
    git_dir: 'Path to clone/fetch git repos'
      
  # Specify list of repos to be synced
  repos:
    - Orgname1/Reponame1
    - Orgname2/Reponame2
</pre>

Usage
=====

To sync between github.com to GHE, run following command

`github_to_ghe_sync <path to config.yml>`


Note
====

Current version do not support automatic org creation. 

Make sure on your GHE instance you create appropriate org and add a user to it.

"Code licensed under the BSD license. See LICENSE.md file for terms."