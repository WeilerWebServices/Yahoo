# Copyright 2016 Yahoo Inc.
# Licensed under the terms of the New-BSD license. Please see LICENSE file in
# the project root for terms.

#===============================================================================
# OVERVIEW:
#
#     The A10RestApi class provides a programmatic interface to the A10 ACOS
#     Application Programming Interface (aXAPI). We'll use this to query the A10
#     for metrics and monitoring purposes.
#
#     Credentials will be stored in file /etc/a10_monitoring/credentials.json
#
# API DOCUMENTATION:
#
#     http://jorgetest.caliberdirect.com/a10/A10_Thunder_AX_DocCD_272-2014_06_16/references/A10_Thunder_aXAPI_Ref-v21-2014_05_16b.pdf
#
# SAMPLE REQUESTS:
#
#     # Get the session ID:
#     curl -sv "slb1.company.com/services/rest/V2.1/?method=authenticate&username=$USER&password=$PASS&format=json"
#
#     # Fetch data:
#     curl -sv "slb1.company.com/services/rest/V2.1/?session_id=$SESSION_ID&format=json&method=$METHOD"
#
#     # Where METHOD can be a string such as:
#     network.interface.getAll
#     system.device_info.get
#     system.device_info.cpu.current_usage.get
#     slb.service_group.getAll
#     slb.virtual_server.getAll
#
#     # Errors are return with HTTP 200 response code. Example body:
#     {"response": {"status": "fail", "err": {"code": 1009, "msg": "Invalid session ID"}}}
#
#===============================================================================

require 'net/http'
require 'uri'
require 'json'
require 'openssl'

class A10RestApi
  DEFAULT_CREDS_FILE = '/etc/a10_monitoring/credentials.json'
  DEFAULT_HTTP_PORT  = 80
  HTTPS_PORT         = 443

  attr_accessor :host, :port, :user, :pass, :session_id

  # Initialize the A10RestApi object. Will raise on error.
  # Params:
  #     host          A10 hostname and, optionally, port. Format: "host[:port]".
  # Options:
  #     :creds_file   Path the to A10 credentials json file
  #     :use_ssl      Force the use of SSL. SSL is used by default for port 443.
  def initialize(host, options = {})
    @host, @port = host.split(':')
    @port        = @port ? Integer(@port) : DEFAULT_HTTP_PORT
    @use_ssl     = options[:use_ssl] || @port == HTTPS_PORT
    @user        = nil
    @pass        = nil
    @session_id  = nil
    @creds_file  = options[:creds_file] || DEFAULT_CREDS_FILE
    update_credentials

    # Setup an HTTPS client
    # Notes:
    # - The load balancer may require a certain SSL version. For available versions,
    #   run: ruby -e "require 'openssl'; puts OpenSSL::SSL::SSLContext::METHODS.inspect"
    @http = Net::HTTP.new(@host, @port)
    @http.open_timeout = 3
    @http.read_timeout = 10
    if @use_ssl
      @http.use_ssl = true
      @http.ssl_version = :TLSv1
      @http.verify_mode = ::OpenSSL::SSL::VERIFY_NONE  #TODO: this should be VERIFY_PEER!
      @http.ca_file = "/etc/ssl/certs/ca-certificates.crt"
    end
  end

  # Get data specified by the given method (eg: network.interface.getAll)
  # and optional hash of parameters.
  # Returns the parsed JSON response, as a hash, on success. Raises on error.
  def get(method, params = {})
    open_session
    api_get(method, params)
  end

  # Open a session with the A10, if not already open. Saves and returns the
  # session id.
  def open_session
    return if @session_id
    json = api_get('authenticate')
    @session_id = json['session_id'] or raise RuntimeError, "No session id returned"
  end

  # Close the existing session, if open
  def close_session
    return if @session_id.nil?
    api_get('session.close')
    @http.finish if @http.started?
    @session_id = nil
  end

  private

  # Read the A10 credentials from the specified file. Updates the @user and
  # @pass instance variables. Raises on error.
  def update_credentials
    json = JSON.parse(File.read(@creds_file))
    @user = json['user']
    @pass = json['pass']
  rescue => e
    raise RuntimeError, "Error reading credentials file: #{e.message}"
  end

  # Perform an HTTP get against the A10 API, with the given API method and
  # optional hash of parameters.
  # Returns the parsed JSON response, as a hash, on success. Raises on error.
  def api_get(method, params = {})
    # Build the url
    proto = (@use_ssl ? 'https' : 'http')
    safe_url = "#{proto}://#{@host}:#{@port}/services/rest/V2.1/?method=#{method}&format=json"
    params.each_pair { |k,v| safe_url += "&#{k}=#{v}" }
    url = safe_url + (@session_id ?
      "&session_id=#@session_id" :
      "&username=#@user&password=#@pass")
    uri = URI.parse(url)

    # Make the request and parse the response json
    request = Net::HTTP::Get.new(uri.request_uri)
    response = @http.request(request)
    json = JSON.parse(response.body)

    # If there is an error, throw an exception
    if json['response'] && json['response']['status'] == 'fail'
      msg  = json['response']['err']['msg']  rescue json.inspect
      code = json['response']['err']['code'] rescue ''
      raise RuntimeError, "Error fetching #{safe_url}: #{msg} (#{code})"
    end
    json
  end
end
