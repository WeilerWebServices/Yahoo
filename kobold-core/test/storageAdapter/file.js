var FileStorageAdapter = require('../../').storageAdapters.file;

var Promise = require('promise');
var expect = require('chai').expect;
var sinon = require('sinon');
var promiseCheck = require('../helper').promiseCheck;
var path = require('path');

describe('File', function () {

	beforeEach(function () {
		this.sandbox = sinon.sandbox.create();
		this.prepareFolderStub = this.sandbox.stub(FileStorageAdapter.prototype, "_prepareFolder", function () {});
	});

	afterEach(function () {
		this.sandbox.restore();
	});

	describe('Initialization', function () {

		it('should prepare folder', function (done) {
			var instance = new FileStorageAdapter("build1", { path:"test-path" });
			promiseCheck(instance.getPromise(), function () {
				expect(this.prepareFolderStub.callCount).to.be.equal(1);
			}.bind(this), done);
		});

		it('should have build value', function () {
			var instance = new FileStorageAdapter("build1", { path:"test-path" });
			expect(instance.getBuild()).to.be.equal('build1');
		});

		it('should change build value', function () {
			var instance = new FileStorageAdapter("build1", { path:"test-path" });
			instance.setBuild("build2");
			expect(instance.getBuild()).to.be.equal('build2');
		});

		it('should have default values', function () {

			var instance = new FileStorageAdapter("build1", { path:"test-path" });

			expect(instance._path).to.be.equal('test-path');
			expect(instance._approvedFolderName).to.be.equal('approved');
			expect(instance._buildFolderName).to.be.equal('build');
			expect(instance._highlightFolderName).to.be.equal('highlight');
		});

		it('should have initialized values', function () {

			var instance = new FileStorageAdapter("build1", {
				path: "test-path",
				approvedFolderName: 'folder1',
				buildFolderName: 'folder2',
				highlightFolderName: 'folder3'
			});

			expect(instance._approvedFolderName).to.be.equal('folder1');
			expect(instance._buildFolderName).to.be.equal('folder2');
			expect(instance._highlightFolderName).to.be.equal('folder3');
		});

		it('should combine paths', function () {

			var basePath = path.join(__dirname, "test-path"),
				approvedPath = path.join(basePath, "folder1"),
				buildPath = "/folder2",
				highlightPath = path.join(basePath, "folder3"),
				configPath = path.join(basePath, "folder4"),
				instance;

			instance = new FileStorageAdapter("build1", {
				path: basePath,
				approvedFolderName: 'folder1',
				buildFolderName: '/folder2',
				highlightFolderName: 'folder3',
				configFolderName: 'folder4'
			});

			expect(instance._getPath()).to.be.equal(basePath);
			expect(instance._getApprovedPath()).to.be.equal(approvedPath);
			expect(instance._getBuildPath()).to.be.equal(buildPath);
			expect(instance._getHighlightPath()).to.be.equal(highlightPath);
			expect(instance._getConfigPath()).to.be.equal(configPath);
		});
	});

	describe('Instance', function () {

		beforeEach(function () {
			this.instance = new FileStorageAdapter("build1", { path: "test-path" });

			this.readDirStub = this.sandbox.stub(this.instance, "_readDir", function (currentPath) {
				return "test1.png,test2.png,test3.txt,test4.png".replace('test', path.basename(currentPath)).split(',');
			});
			this.readImageStub = this.sandbox.stub(this.instance, "_readImage", function (file) {
				return Promise.resolve(file);
			});
			this.writeImageStub = this.sandbox.stub(this.instance, "_writeImage", function (file) {
				return Promise.resolve(file);
			});
		});

		describe('Read-Dir', function () {

			describe('Filter', function () {

				it('should filter PNG files', function () {
					expect(this.instance._pngFilter("test.png")).to.be.true;
				});

				it('should not filter non-PNG files', function () {
					expect(this.instance._pngFilter("test.dat")).to.be.false;
				});
			});

			it('should filter PNG files', function () {
				var files = this.instance._readDirAndFilter(path.join("dir", "test"));
				expect(files).to.be.deep.equal(["test1", "test2", "test4"]);
			});
		});

		describe('Current-Approved', function () {

			it('should list all files', function () {
				promiseCheck(this.instance.getCurrentApprovedScreenNames(), function (files) {
					expect(files).to.be.deep.equal(["approved1", "approved2", "approved4"]);
				});
			});

			it('should load a file', function (done) {
				var filePath = path.join(__dirname, 'test-path', 'approved', 'approved2.png');

				promiseCheck(this.instance.getCurrentApprovedScreen('approved2'), function (filePath) {
					expect(this.readImageStub.callCount).to.be.equal(1);
					expect(filePath).to.be.equal(filePath);
				}.bind(this), done);
			});

			it('should return a promise on archiving', function () {
				expect(this.instance.archiveCurrentApprovedScreen()).to.be.instanceof(Promise);
			});
		});

		describe('Approved', function () {

			it('should not list a file', function () {
				promiseCheck(this.instance.getApprovedScreenNames(), function (files) {
					expect(files).to.be.deep.equal([]);
				});
			});

			it('should not load a file', function (done) {
				promiseCheck(this.instance.getApprovedScreen('approved2'), function (value) {
					expect(value).to.be.undefined;
				}.bind(this), done);
			});

			it('should return a promise on archiving', function () {
				expect(this.instance.archiveApprovedScreen()).to.be.instanceof(Promise);
			});
		});

		describe('Build', function () {

			it('should list all files', function () {
				promiseCheck(this.instance.getBuildScreenNames(), function (files) {
					expect(files).to.be.deep.equal(["build1", "build2", "build4"]);
				});
			});

			it('should load a file', function (done) {
				var filePath = path.join(__dirname, 'test-path', 'build', 'build2.png');

				promiseCheck(this.instance.getBuildScreen('build2'), function (filePath) {
					expect(this.readImageStub.callCount).to.be.equal(1);
					expect(filePath).to.be.equal(filePath);
				}.bind(this), done);
			});

			it('should return a promise on archiving', function () {
				expect(this.instance.archiveBuildScreen()).to.be.instanceof(Promise);
			});
		});

		describe('Highlight', function () {

			it('should list all files', function () {
				promiseCheck(this.instance.getHighlightScreenNames(), function (files) {
					expect(files).to.be.deep.equal(["highlight1", "highlight2", "highlight4"]);
				});
			});

			it('should load a file', function (done) {
				var filePath = path.join(__dirname, 'test-path', 'highlight', 'highlight2.png');

				promiseCheck(this.instance.getHighlightScreen('highlight2'), function (filePath) {
					expect(this.readImageStub.callCount).to.be.equal(1);
					expect(filePath).to.be.equal(filePath);
				}.bind(this), done);
			});

			it('should return a promise on archiving', function () {
				expect(this.instance.archiveHighlightScreen()).to.be.instanceof(Promise);
			});
		});
	});
});
