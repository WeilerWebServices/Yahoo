// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Base = require('preceptor-core').Base;

/**
 * Abstract comparison adapter
 *
 * @class ComparisonAdapter
 * @extends Base
 * @property {object} _options
 * @property {PNGImage} _imageA
 * @property {PNGImage} _imageB
 * @property {PNGImage} _result
 */
var ComparisonAdapter = Base.extend(

	/**
	 * Comparison adapter constructor
	 *
	 * @constructor
	 * @param {object} [options]
	 */
	function (options) {
		this.__super();

		this._options = options || {};

		this.initialize();
	},

	/** @lends ComparisonAdapter.prototype */
	{
		/**
		 * Initializes the source-adapter
		 *
		 * @method initialize
		 */
		initialize: function () {
			// Nothing by default
		},


		/**
		 * Gets the options supplied on initialization
		 *
		 * @method getOptions
		 * @return {object}
		 */
		getOptions: function () {
			return this._options;
		},


		/**
		 * Gets the set first image for comparison
		 *
		 * @method getImageA
		 * @return {PNGImage}
		 */
		getImageA: function () {
			return this._imageA;
		},

		/**
		 * Sets the first image for comparison
		 *
		 * @method setImageA
		 * @param {PNGImage} imageA
		 */
		setImageA: function (imageA) {
			this._imageA = imageA;
		},


		/**
		 * Gets the set second image for comparison
		 *
		 * @method getImageB
		 * @return {PNGImage}
		 */
		getImageB: function () {
			return this._imageB;
		},

		/**
		 * Sets the second image for comparison
		 *
		 * @method setImageB
		 * @param {PNGImage} imageB
		 */
		setImageB: function (imageB) {
			this._imageB = imageB;
		},


		/**
		 * Gets the result of comparison in an image
		 *
		 * @method getResultImage
		 * @return {PNGImage}
		 */
		getResultImage: function () {
			return this._result;
		},

		/**
		 * Sets the result image of comparison
		 *
		 * @method setResultImage
		 * @param {PNGImage} image
		 */
		setResultImage: function(image) {
			this._result = image;
		},


		/**
		 * Runs the comparison
		 *
		 * @return {Promise} With {boolean} for success/failure
		 */
		run : function () {
			throw new Error('Unimplemented adapter function "run".');
		}
	},

	{
		/**
		 * Type of class
		 *
		 * @property TYPE
		 * @type string
		 */
		TYPE: 'ComparisonAdapter'
	});

module.exports = ComparisonAdapter;
