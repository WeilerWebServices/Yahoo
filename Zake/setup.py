#!/usr/bin/env python

# -*- coding: utf-8 -*-

# vim: tabstop=4 shiftwidth=4 softtabstop=4

#    Copyright (C) 2013 Yahoo! Inc. All Rights Reserved.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

from setuptools import find_packages
from setuptools import setup

with open("README.rst", "r") as readme:
    long_description = readme.read()

setup(
    name='zake',
    version='0.2.2',
    description='A python package that works to provide a nice set of '
                'testing utilities for the kazoo library.',
    author="Joshua Harlow",
    author_email='harlowja@yahoo-inc.com',
    url='https://github.com/yahoo/Zake',
    license="ASL 2.0",
    install_requires=[
        'kazoo>=1.3.1,!=2.1',
        'six',
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Topic :: Utilities",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: POSIX :: Linux",
        "Programming Language :: Python",
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 2.6",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.4",
    ],
    keywords="kazoo testing zookeeper",
    packages=find_packages(),
    long_description=long_description,
)
