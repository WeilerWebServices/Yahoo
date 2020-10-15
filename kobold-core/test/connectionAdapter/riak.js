var RiakConnectionAdapter = require('../../').connectionAdapters.riak;

var Promise = require('promise');
var expect = require('chai').expect;
var sinon = require('sinon');
var promiseCheck = require('../helper').promiseCheck;

describe('Riak', function () {

	describe('Initialization', function () {

		it('should have default values', function () {

			var instance = new RiakConnectionAdapter();

			expect(instance._schema).to.be.equal('http');
			expect(instance._host).to.be.equal('localhost');
			expect(instance._port).to.be.equal(8098);
		});

		it('should have initialized values', function () {

			var instance = new RiakConnectionAdapter({
				schema: 'https',
				host: '127.0.0.1',
				port: 2345
			});

			expect(instance._schema).to.be.equal('https');
			expect(instance._host).to.be.equal('127.0.0.1');
			expect(instance._port).to.be.equal(2345);
		});
	});

	describe('Instance', function () {

		beforeEach(function () {
			this.instance = new RiakConnectionAdapter();
		});

		it('should get the url', function () {
			expect(this.instance._getUrlWithPath('/test/path')).to.be.equal('http://localhost:8098/test/path');
		});

		describe('Buckets', function () {

			beforeEach(function () {
				this.sandbox = sinon.sandbox.create();

				this.request = this.sandbox.stub(this.instance, '_request', function (options) {
					expect(options.method).to.be.equal('GET');
					return Promise.resolve({ body: JSON.stringify({ "buckets": ["test1", "test2", "test12", "test11", "test22"] }) });
				});
			});

			afterEach(function () {
				this.sandbox.restore();
			});

			describe('getBuckets', function () {

				it('should first process all pending promises', function (done) {

					var processed = false;

					this.instance.setPromise(this.instance.getPromise().then(function () {
						processed = true;
					}));

					promiseCheck(this.instance.getBuckets(), function () {
						expect(processed).to.be.true;
					}.bind(this), done);
				});

				it('should request from the correct url', function (done) {
					this.pathSpy = this.sandbox.spy(this.instance, '_getUrlWithPath');

					promiseCheck(this.instance.getBuckets(), function () {
						expect(this.pathSpy.lastCall.args.length).to.be.equal(1);
						expect(this.pathSpy.lastCall.args[0]).to.be.equal('/buckets?buckets=true');
					}.bind(this), done);
				});

				it('should get all buckets', function (done) {

					promiseCheck(this.instance.getBuckets(), function (buckets) {
						expect(buckets).to.be.deep.equal(["test1", "test2", "test12", "test11", "test22"]);
					}, done);
				});

				it('should filter buckets', function (done) {

					promiseCheck(this.instance.getBuckets(function (bucket) {
						return (bucket.substr(0, 5) !== "test1");
					}), function (buckets) {
						expect(buckets).to.be.deep.equal(["test2", "test22"]);
					}, done);
				});
			});

			describe('hasBuckets', function () {

				it('should have bucket', function (done) {

					promiseCheck(this.instance.hasBucket('test2'), function (hasIt) {
						expect(hasIt).to.be.true;
					}.bind(this), done);
				});

				it('should have bucket with filter', function (done) {

					promiseCheck(this.instance.hasBucket('test2', function (bucket) {
						return (bucket.substr(0, 5) !== "test1");
					}), function (hasIt) {
						expect(hasIt).to.be.true;
					}.bind(this), done);
				});

				it('should not have bucket with filter', function (done) {

					promiseCheck(this.instance.hasBucket('test11', function (bucket) {
						return (bucket.substr(0, 5) !== "test1");
					}), function (hasIt) {
						expect(hasIt).to.be.false;
					}.bind(this), done);
				});
			});
		});

		describe('Bucket Keys', function () {

			beforeEach(function () {
				this.sandbox = sinon.sandbox.create();

				this.request = this.sandbox.stub(this.instance, '_request', function (options) {
					expect(options.method).to.be.equal('GET');
					return Promise.resolve({ body: JSON.stringify({ "keys": ["test1", "test2", "test12", "test11", "test22"] }) });
				});
			});

			afterEach(function () {
				this.sandbox.restore();
			});

			describe('getBucketKeys', function () {

				it('should first process all pending promises', function (done) {

					var processed = false;

					this.instance.setPromise(this.instance.getPromise().then(function () {
						processed = true;
					}));

					promiseCheck(this.instance.getBucketKeys(), function () {
						expect(processed).to.be.true;
					}.bind(this), done);
				});

				it('should request from the correct url', function (done) {
					this.pathSpy = this.sandbox.spy(this.instance, '_getUrlWithPath');

					promiseCheck(this.instance.getBucketKeys("test#$bucket"), function () {
						expect(this.pathSpy.lastCall.args.length).to.be.equal(1);
						expect(this.pathSpy.lastCall.args[0]).to.be.equal('/buckets/test%23%24bucket/keys?keys=true');
					}.bind(this), done);
				});

				it('should get all buckets', function (done) {

					promiseCheck(this.instance.getBucketKeys("test#$bucket"), function (buckets) {
						expect(buckets).to.be.deep.equal(["test1", "test2", "test12", "test11", "test22"]);
					}, done);
				});

				it('should filter buckets', function (done) {

					promiseCheck(this.instance.getBucketKeys("test#$bucket", function (bucket) {
						return (bucket.substr(0, 5) !== "test1");
					}), function (buckets) {
						expect(buckets).to.be.deep.equal(["test2", "test22"]);
					}, done);
				});
			});

			describe('hasBucketKey', function () {

				it('should have bucket', function (done) {

					promiseCheck(this.instance.hasBucketKey("test#$bucket", 'test2'), function (hasIt) {
						expect(hasIt).to.be.true;
					}.bind(this), done);
				});

				it('should have bucket with filter', function (done) {

					promiseCheck(this.instance.hasBucketKey("test#$bucket", 'test2', function (bucket) {
						return (bucket.substr(0, 5) !== "test1");
					}), function (hasIt) {
						expect(hasIt).to.be.true;
					}.bind(this), done);
				});

				it('should not have bucket with filter', function (done) {

					promiseCheck(this.instance.hasBucketKey("test#$bucket", 'test11', function (bucket) {
						return (bucket.substr(0, 5) !== "test1");
					}), function (hasIt) {
						expect(hasIt).to.be.false;
					}.bind(this), done);
				});
			});
		});


		describe('Object', function () {

			beforeEach(function () {

				this.sandbox = sinon.sandbox.create();

				this.object = [];
				this.object[0] = 11;
				this.object[1] = 12;
				this.object[2] = 13;

				this.instance.__data = this.object;

				this.request = this.sandbox.stub(this.instance, '_request', function (options) {
					if (options.method === 'GET') {
						return Promise.resolve({ body: this.__data });
					} else if (options.method === 'PUT') {
						this.__data = options.body;
						this.__headers = options.headers;
						return Promise.resolve();
					} else if (options.method === 'DELETE') {
						return Promise.resolve();
					}
				});
			});

			afterEach(function () {
				this.sandbox.restore();
			});

			describe('getObject', function () {

				it('should first process all pending promises', function (done) {

					var processed = false;

					this.instance.setPromise(this.instance.getPromise().then(function () {
						processed = true;
					}));

					promiseCheck(this.instance.getObject("test#$bucket", "test#$key"), function () {
						expect(processed).to.be.true;
					}.bind(this), done);
				});

				it('should request from the correct url', function (done) {
					this.pathSpy = this.sandbox.spy(this.instance, '_getUrlWithPath');

					promiseCheck(this.instance.getObject("test#$bucket", "test#$key"), function () {
						expect(this.pathSpy.lastCall.args.length).to.be.equal(1);
						expect(this.pathSpy.lastCall.args[0]).to.be.equal('/buckets/test%23%24bucket/keys/test%23%24key');
					}.bind(this), done);
				});

				it('should get object', function (done) {

					promiseCheck(this.instance.getObject("test#$bucket", "test#$key"), function (obj) {
						expect(JSON.stringify(obj)).to.be.equal("[11,12,13]");
					}, done);
				});

				it('should get object as JSON', function (done) {

					var expected = {
						test: 23,
						sub: {
							hello: "world"
						}
					};
					this.instance.__data = JSON.stringify(expected);

					promiseCheck(this.instance.getObjectAsJSON("test#$bucket", "test#$key"), function (jsonObj) {
						expect(jsonObj).to.be.deep.equal(expected);
					}, done);
				});
			});

			describe('setObject', function () {

				it('should first process all pending promises', function (done) {

					var processed = false;

					this.instance.setPromise(this.instance.getPromise().then(function () {
						processed = true;
					}));

					promiseCheck(this.instance.setObject("test#$bucket", "test#$key", this.object), function () {
						expect(processed).to.be.true;
					}.bind(this), done);
				});

				it('should request from the correct url', function (done) {
					this.pathSpy = this.sandbox.spy(this.instance, '_getUrlWithPath');

					promiseCheck(this.instance.setObject("test#$bucket", "test#$key", this.object), function () {
						expect(this.pathSpy.lastCall.args.length).to.be.equal(1);
						expect(this.pathSpy.lastCall.args[0]).to.be.equal('/buckets/test%23%24bucket/keys/test%23%24key');
					}.bind(this), done);
				});

				it('should set object', function (done) {

					promiseCheck(this.instance.setObject("test#$bucket", "test#$key", this.object), function () {
						expect(JSON.stringify(this.instance.__data)).to.be.equal("[11,12,13]");
						expect(this.instance.__headers['Content-Type']).to.be.equal("application/octet-stream");
					}.bind(this), done);
				});

				it('should set object with custom mime-type', function (done) {

					promiseCheck(this.instance.setObject("test#$bucket", "test#$key", this.object, "test/mime"), function () {
						expect(this.instance.__headers['Content-Type']).to.be.equal("test/mime");
					}.bind(this), done);
				});

				it('should set object with JSON', function (done) {

					var expected = {
						test: 23,
						sub: {
							hello: "world"
						}
					};

					promiseCheck(this.instance.setObjectFromJSON("test#$bucket", "test#$key", expected), function () {
						expect(JSON.parse(this.instance.__data)).to.be.deep.equal(expected);
						expect(this.instance.__headers['Content-Type']).to.be.equal("application/json");
					}.bind(this), done);
				});
			});

			describe('removeObject', function () {

				it('should first process all pending promises', function (done) {

					var processed = false;

					this.instance.setPromise(this.instance.getPromise().then(function () {
						processed = true;
					}));

					promiseCheck(this.instance.removeObject("test#$bucket", "test#$key", this.object), function () {
						expect(processed).to.be.true;
					}.bind(this), done);
				});

				it('should request from the correct url', function (done) {
					this.pathSpy = this.sandbox.spy(this.instance, '_getUrlWithPath');

					promiseCheck(this.instance.removeObject("test#$bucket", "test#$key", this.object), function () {
						expect(this.pathSpy.lastCall.args.length).to.be.equal(1);
						expect(this.pathSpy.lastCall.args[0]).to.be.equal('/buckets/test%23%24bucket/keys/test%23%24key');
					}.bind(this), done);
				});

				it('should remove object', function (done) {
					promiseCheck(this.instance.removeObject("test#$bucket", "test#$key", this.object), function () {}, done);
				});

				it('should remove all objects', function (done) {

					var removeObjectStub = this.sandbox.stub(this.instance, "removeObject", function () {
						return Promise.resolve();
					});

					this.instance.__data = JSON.stringify({ keys:[ "test1", "test2" ] });

					promiseCheck(this.instance.removeAllObjects("test#$bucket"), function () {

						expect(removeObjectStub.callCount).to.be.equal(2);

						expect(removeObjectStub.getCall(0).args.length).to.be.equal(2);
						expect(removeObjectStub.getCall(0).args[0]).to.be.equal("test#$bucket");
						expect(removeObjectStub.getCall(0).args[1]).to.be.equal("test1");

						expect(removeObjectStub.getCall(1).args.length).to.be.equal(2);
						expect(removeObjectStub.getCall(1).args[0]).to.be.equal("test#$bucket");
						expect(removeObjectStub.getCall(1).args[1]).to.be.equal("test2");

					}.bind(this), done);
				});
			});
		});
	});
});
