# A10 Monitoring

This repo contains alerting and metrics-collection scripts for A10 load balancers. Use it monitor your A10 SLBs via your Nagios-compatible monitoring system, and store A10 metrics to your Graphite-compatible metrics system.

## Repo Contents

```
bin/              Misc utilities
src/              Ruby source code
scripts/
    alerting/     Alerting scripts
    metrics/      Metrics-collection scripts
```

## A10 REST API

The `a10_monitoring` scripts use the A10 ACOS Application Programming Interface (aXAPI), a REST API, to query the A10 for information. All communication with the REST API is handled via the `A10RestApi` class.

API Documentation: [aXAPI Reference (pdf)](http://jorgetest.caliberdirect.com/a10/A10_Thunder_AX_DocCD_272-2014_06_16/references/A10_Thunder_aXAPI_Ref-v21-2014_05_16b.pdf)

## Alerting

Alerting scripts are compatible with Nagios / Icinga. They take a SLB hostname, as well as optional warning and critical thresholds, query the A10 REST API, and return the proper status. Eg:

```
$ ./check_a10_cpu.rb -s slb1.company.com
OK: A10 CPU usage ok (data: 67.7%, mgmt: 20.0%)
```

You can add the `--verbose` flag for additional output, including backtraces for debugging exceptions.

## Metrics

Metrics-collection scripts query the REST API for metrics and can send them either to stdout, or to a graphite-compatible backend. The metrics will be formatted in [Graphite plaintext protocol](http://graphite.readthedocs.org/en/latest/feeding-carbon.html#the-plaintext-protocol) format.

For example:

```
# Graphite plaintext protocol
production.us-west.slb1.memory_usage 34.5 1455761070
```

## Configuration

To use the `a10_monitoring` scripts, you simply need to add a set of A10 user credentials to a file. These credentials will be used to establish a session with the A10 SLB and query it for information.

The default file location is: `/etc/a10_monitoring/credentials.json`

Contents should look like:

```
{
  "user": "a10username",
  "pass": "supersecretpassword"
}
```

Please note:
- Make sure that the file is only readable by privileged users!
- I suggest you create a user with read-only access, and use that for monitoring.
- You do not need to use the default file location, but it's easier if you do.

## API Query Utility

I've included a useful utility for generic queries against the A10 REST API, located at `bin/query_a10_api.rb`. You can query any 'metric' exposed by the A10 API. For example:

```bash
$ ./query_a10_api.rb -s slb1.company.com -m system.device_info.get
{"device_information"=>
  {"cpu_count"=>20,
   "cpu_status"=>"ALL_OK",
   "cpu_temperature"=>{"temperature_C"=>47, "temperature_F"=>116},
   "disk_usage"=>{"used(KB)"=>39056976, "total(KB)"=>78148192},
   "disk_status"=>{"disk1"=>"stopped", "disk2"=>"stopped"},
   "fan_status"=>
    [{"id"=>1, "status"=>"OK-med/high"},
     {"id"=>2, "status"=>"OK-med/high"},
     ...
     {"id"=>12, "status"=>"OK-fixed/high"}],
   "power_supply"=>{"supply1"=>"on", "supply2"=>"on"},
   "memory_usage"=>{"used(KB)"=>19429520, "total(KB)"=>65169012}}}
```

Some queries require inputs. These inputs can be specified as command-line arguments of the form `key=value`. For example:

```bash
# Query data for network interface 2. Requires the 'port_num' input.
$ ./query_a10_api.rb -s slb1.company.com -m network.interface.get port_num=2
{"interface"=>
  {"port_num"=>2,
   "type"=>"ethernet",
   ...
```

For a list of useful metrics, run `./query_a10_api.rb --help`, or see the [aXAPI Reference](http://jorgetest.caliberdirect.com/a10/A10_Thunder_AX_DocCD_272-2014_06_16/references/A10_Thunder_aXAPI_Ref-v21-2014_05_16b.pdf)

## Ruby Code

You can reuse the existing Ruby code for your own programs and scripts. Code is located in `src/a10_monitoring`. Of particular import is the `a10RestApi` class, which actually queries the REST API. You would use it like so:

```ruby
api = A10RestApi.new('slb1.company.com')
data = api.get('system.device_info.cpu.current_usage.get')
pp data
```

-- Evan Kuhn
