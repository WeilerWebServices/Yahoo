# cocoapods-blocklist

[![Build Status](https://travis-ci.org/yahoo/cocoapods-blocklist.svg?branch=main)](https://travis-ci.org/yahoo/cocoapods-blocklist)

A CocoaPods plugin used to check a project against a list of pods that you do not want included in your build. Security is the primary use, but keeping specific pods that have conflicting licenses is another possible use.

We use this in our continuous integration builds. If a security issue is found with a pod, we can update our `blocklist.json` file and builds will start to fail immediately. Developers don't always read the email about a new vulnerability. They definitely notice when the build fails. :smile:

## Installation

    $ gem install cocoapods-blocklist

## Usage

    $ pod blocklist [LOCKFILE] --config=BLOCKLIST_CONFIG

The `LOCKFILE` is optional, and `./Podfile.lock` is assumed if one is not explicitly passed in.

## Blocklist config file

The blocklist config file is a JSON file that has an array of pods, each one containing a hash with:

- name: the same string you would use to include a pod in a `Podfile`
- versions: a version string (or array of version strings) used to match the version
- reason: a string used to explain why a pod is blocked, will be printed out when a check fails

```
{
  "pods":[
    {
      "name":"FooKit",
      "reason":"FooKit 1.2.2 did not check passwords on Thursdays",
      "versions":"1.2.2"
    },
    {
      "name":"BananaKit",
      "reason":"Vulnerable to code injection with malformed BQL queries",
      "versions":[">=3.4.2", "<3.6.0"]
    }
  ]
}
```

## Contributors

- David Grandinetti ([@dbgrandi](https://twitter.com/dbgrandi))
- Samuel E. Giddins ([@segiddins](https://twitter.com/segiddins))

## License

Code licensed under the MIT license. See [LICENSE](https://github.com/yahoo/cocoapods-blocklist/blob/master/LICENSE) file for terms.
