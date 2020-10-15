var ComparisonAdapter = require('../../').ComparisonAdapter;

var expect = require('chai').expect;
var helper = require('../helper');

/**
 * Creates an image to be set
 *
 * Note:
 * This actually returns a random object since there is nothing specific about the image-object.
 *
 * @method createImage
 * @return {PNGImage}
 */
function createImage() {
	return {
		randomProperties: 'is here'
	};
}

describe('Abstract', function () {

	describe('Initialization', function () {

		it('should have initialized values', function () {

			var options = {
					test:23
				},
				instance = new ComparisonAdapter(options);

			expect(instance.getOptions()).to.be.deep.equal(options);
		});
	});

	describe('Instance', function () {

		beforeEach(function () {
			this.image = createImage();
			this.instance = new ComparisonAdapter();
		});

		it('should set and get image-a', function () {
			this.instance.setImageA(this.image);
			expect(this.instance.getImageA()).to.be.deep.equal(this.image);
		});

		it('should set and get image-b', function () {
			this.instance.setImageB(this.image);
			expect(this.instance.getImageB()).to.be.deep.equal(this.image);
		});

		it('should set and get result-image', function () {
			this.instance.setResultImage(this.image);
			expect(this.instance.getResultImage()).to.be.deep.equal(this.image);
		});

		it('should fail run since it is abstract', function () {
			helper.checkForException(function () {
				this.instance.run();
			}.bind(this));
		});
	});
});
