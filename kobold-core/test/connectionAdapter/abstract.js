var ConnectionAdapter = require('../../').ConnectionAdapter;

var Promise = require('promise');

var expect = require('chai').expect;
var helper = require('../helper');

describe('Abstract', function () {

	describe('Initialization', function () {

		it('should have initialized values', function () {

			var options = {
					test:23
				},
				instance = new ConnectionAdapter(options);

			expect(instance.getOptions()).to.be.deep.equal(options);
			expect(instance.getPromise()).to.be.instanceOf(Promise);
		});
	});

	describe('Instance', function () {

		beforeEach(function () {
			this.instance = new ConnectionAdapter({});
		});

		it('should set and get Promise', function () {
			var promise = new Promise(function () {});
			this.instance.setPromise(promise);
			expect(this.instance.getPromise()).to.be.equal(promise);
		});

		it('should fail "getBuckets" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getBuckets();
			}.bind(this));
		});

		it('should fail "hasBucket" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.hasBucket();
			}.bind(this));
		});

		it('should fail "getBucketKeys" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getBucketKeys();
			}.bind(this));
		});

		it('should fail "hasBucketKey" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.hasBucketKey();
			}.bind(this));
		});

		it('should fail "getObject" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getObject();
			}.bind(this));
		});

		it('should fail "getObjectAsJSON" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.getObjectAsJSON();
			}.bind(this));
		});

		it('should fail "setObject" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.setObject();
			}.bind(this));
		});

		it('should fail "setObjectFromJSON" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.setObjectFromJSON();
			}.bind(this));
		});

		it('should fail "removeObject" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.removeObject();
			}.bind(this));
		});

		it('should fail "removeAllObjects" since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.removeAllObjects();
			}.bind(this));
		});
	});
});
