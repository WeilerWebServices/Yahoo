from setuptools import setup

with open('README.md') as f:
  long_description = f.read()

setup(
  name='tensorflowonspark',
  packages=['tensorflowonspark'],
  version='2.2.1',
  description='Deep learning with TensorFlow on Apache Spark clusters',
  long_description=long_description,
  long_description_content_type='text/markdown',
  author='Yahoo, Inc.',
  url='https://github.com/yahoo/TensorFlowOnSpark',
  keywords=['tensorflowonspark', 'tensorflow', 'spark', 'machine learning', 'yahoo'],
  install_requires=['packaging'],
  license='Apache 2.0',
  classifiers=[
    'Intended Audience :: Developers',
    'Intended Audience :: Science/Research',
    'License :: OSI Approved :: Apache Software License',
    'Topic :: Software Development :: Libraries',
    'Programming Language :: Python :: 2',
    'Programming Language :: Python :: 2.7',
    'Programming Language :: Python :: 3',
    'Programming Language :: Python :: 3.5',
    'Programming Language :: Python :: 3.6'
  ]
)
