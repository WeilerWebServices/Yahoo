var StorageAdapter = require('../../').StorageAdapter;

var Promise = require('promise');

var expect = require('chai').expect;
var helper = require('../helper');

describe('Abstract', function () {

	describe('Initialization', function () {

		it('should have initialized values', function () {

			var build = 24,
				options = {
					test:23
				},
				instance = new StorageAdapter(build, options);

			expect(instance.getBuild()).to.be.equal(build);
			expect(instance.getOptions()).to.be.deep.equal(options);
			expect(instance.getPromise()).to.be.instanceOf(Promise);
		});
	});

	describe('Instance', function () {

		beforeEach(function () {
			this.instance = new StorageAdapter(24, {});
		});

		it('should set and get build', function () {
			this.instance.setBuild(43);
			expect(this.instance.getBuild()).to.be.equal(43);
		});

		it('should set and get Promise', function () {
			var promise = new Promise(function () {});
			this.instance.setPromise(promise);
			expect(this.instance.getPromise()).to.be.equal(promise);
		});

		it('should fail "getCurrentApprovedScreenNames" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getCurrentApprovedScreenNames();
			}.bind(this));
		});

		it('should fail "getCurrentApprovedScreen" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getCurrentApprovedScreen();
			}.bind(this));
		});

		it('should fail "archiveCurrentApprovedScreen" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.archiveCurrentApprovedScreen();
			}.bind(this));
		});

		it('should fail "getApprovedScreenNames" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getApprovedScreenNames();
			}.bind(this));
		});

		it('should fail "getApprovedScreen" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getApprovedScreen();
			}.bind(this));
		});

		it('should fail "archiveApprovedScreen" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.archiveApprovedScreen();
			}.bind(this));
		});

		it('should fail "getBuildScreenNames" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getBuildScreenNames();
			}.bind(this));
		});

		it('should fail "getBuildScreen" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getBuildScreen();
			}.bind(this));
		});

		it('should fail "archiveBuildScreen" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.archiveBuildScreen();
			}.bind(this));
		});

		it('should fail "getHighlightScreenNames" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getHighlightScreenNames();
			}.bind(this));
		});

		it('should fail "getHighlightScreen" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getHighlightScreen();
			}.bind(this));
		});

		it('should fail "archiveHighlightScreen" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.archiveHighlightScreen();
			}.bind(this));
		});

		it('should fail "getScreenConfig" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getScreenConfig();
			}.bind(this));
		});
	});
});
