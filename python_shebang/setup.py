import os
import json
from setuptools import setup
import shutil


METADATA_FILENAME = 'pythonenv/package_metadata.json'
BASEPATH = os.path.dirname(os.path.abspath(__file__))


def readme():
    """
    Get the contents of the README file
    :return:
    """
    possible_filenames = ['README.rst', 'README.md', 'README.txt']
    filename = None
    data = ''
    for filename in possible_filenames:
        if os.path.exists(filename):
            break
    if filename:
        with open(filename) as file_handle:
            data = file_handle.read()
    return data


def add_scripts_to_package(setup_args):
    """
    Update the "scripts" parameter of the setup_arguments with any scripts
    found in the "scripts" directory.
    :return:
    """
    if os.path.isdir('scripts'):
        setup_args['scripts'] = [
            os.path.join('scripts', f) for f in os.listdir('scripts')
        ]


class Git(object):
    """
    Simple wrapper class to the git command line tools
    """
    version_list = ['0', '0', '0']

    def __init__(self, version=None):
        if version:
            self.version_list = version.split('.')

    @property
    def version(self):
        """
        Generate a Unique version value from the git information
        :return:
        """
        git_rev = len(os.popen('git rev-list HEAD').readlines())
        if git_rev != 0:
            self.version_list[-1] = '%d' % git_rev
        version = '.'.join(self.version_list)
        return version

    @property
    def branch(self):
        """
        Get the current git branch
        :return:
        """
        return os.popen('git rev-parse --abbrev-ref HEAD').read().strip()

    @property
    def hash(self):
        """
        Return the git hash for the current build
        :return:
        """
        return os.popen('git rev-parse HEAD').read().strip()

    @property
    def origin(self):
        """
        Return the fetch url for the git origin
        :return:
        """
        for item in os.popen('git remote -v'):
            split_item = item.strip().split()
            if split_item[0] == 'origin' and split_item[-1] == '(push)':
                return split_item[1]


def get_and_update_package_metadata(setup_args):
    """
    Update the package metadata for this package if we are building the package.
    :return:metadata - Dictionary of metadata information
    """
    global setup_arguments
    global METADATA_FILENAME

    if not os.path.exists('.git') and os.path.exists(METADATA_FILENAME):
        with open(METADATA_FILENAME) as fh:
            metadata = json.load(fh)
            return metadata

    metadata = {
        'version': setup_args['version'],
        'long_description': readme(),
        'git_hash': 'None',
        'git_origin': 'None',
        'git_branch': 'None'
    }

    if os.path.exists('.git'):
        git = Git(version=setup_arguments['version'])
        metadata = {
            'version': git.version,
            'long_description': readme(),
            'git_hash': git.hash,
            'git_origin': git.origin,
            'git_branch': git.branch
        }

    version_info = metadata['version'].split('.')

    if 'BUILD_NUMBER' in os.environ.keys():
        version_info[-1] = os.environ['BUILD_NUMBER']
        metadata['ci_build_number'] = os.environ['BUILD_NUMBER']
        metadata['ci_version'] = '.'.join(version_info)
        metadata['version'] = metadata['ci_version']

    with open(METADATA_FILENAME, 'w') as file_handle:
        json.dump(metadata, file_handle)

    return metadata


# Create a dictionary of our arguments, this way this script can be imported
#  without running setup() to allow external scripts to see the setup settings.
args = {
    'name': 'pythonenv',
    'version': '0.0.3',
    'author': 'dhubbard',
    'author_email': 'dhubbard@yahoo-inc.com',
    'classifiers': [
        "Topic :: Utilities",
    ],
    'url': 'https://github.com/yahoo/python_shebang',
    'license': 'Apache V2',
    'packages': ['pythonenv'],
    'long_description': readme(),
    'description': 'find a compatible python interpreter for a script',
    'install_requires': [],
    'keywords': "shebang hashbang ",
    'package_data': {
        'pythonenv': ['package_metadata.json']
    },
    'include_package_data': True,
}
setup_arguments = args


if __name__ == '__main__':
    # We're being run from the command line so call setup with our arguments
    add_scripts_to_package(setup_arguments)
    metadata = get_and_update_package_metadata(setup_arguments)
    setup_arguments['version'] = metadata['version']
    setup(**setup_arguments)
