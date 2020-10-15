python_shebang Description
==========================

[![Build Status](https://travis-ci.org/yahoo/python_shebang.svg?branch=master)](https://travis-ci.org/yahoo/python_shebang)

This package provides a command that can be run from /usr/bin/env on the
shebang line of a script that will find an appropriate python interpreter
to run it.

Unlike plain /usr/bin/env this script allows specifying the version of python
and python modules that are required.


Supported Operating Systems
===========================
This script is designed to operate on Unix operating systems.  It is of no
value on Windows which does not use shebang.


Dependencies
============
python_shebang is written to be able to run under any python version 2.6 or
higher using only modules in the python standard library.


Examples
========

Here is a shebang line that will run the script with a python2.6 interpreter
that has both the foo and bar modules:

```#!/usr/bin/env python_shebang version:2.6 module:foo module:bar```


This shebang line will run the script with a python 3 interpreter that has
the paramiko module:

```#!/usr/bin/env python_shebang version:3 module:paramiko```


Running the command directly will give a python shell that meets the
requirements (the asyncio module was added in python 3.4):

```
$ python_shebang module:asyncio
Python 3.4.0 (v3.4.0:04f714765c13, Mar 15 2014, 23:02:41)
[GCC 4.2.1 (Apple Inc. build 5666) (dot 3)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>>
```


If a compatible interpreter cannot be found it will generate an exception (the
asyncio module was added in python 3.4)

```
$ python_shebang module:asyncio version:3.3
Traceback (most recent call last):
  File "/usr/bin/python_shebang", line 173, in <module>
    version, modules, python_interpreters=python_interpreters
  File "/usr/bin/python_shebang", line 139, in __search_for_interpreters
    raise PythonNotFound('No usable python interpreters found')
__main__.PythonNotFound: No usable python interpreters found
```
