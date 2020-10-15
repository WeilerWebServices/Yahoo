module.exports = {

	/**
	 * Create a container stub
	 *
	 * @method createContainerStub
	 * @return {object}
	 */
	createContainerStub: function () {
		return {
			getAction: function () {},
			getTree: function () {},
			gatherTestOutcomes: function () {}
		};
	}
};
