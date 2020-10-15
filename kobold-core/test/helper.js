module.exports = {

	/**
	 * Checks a promise by making the call-back function test-safe
	 *
	 * @param {Promise} promise
	 * @param {function} fn
	 * @param {function} done
	 */
	promiseCheck: function (promise, fn, done) {

		promise.then(function () {
			try {
				fn.apply(this, arguments);
				done();
			} catch(err) {
				done(err);
			}
		}, function (err) {
			done(err);
		});
	},

	/**
	 * Checks if an exception will be thrown when a function is called
	 *
	 * @param {function} fn
	 */
	checkForException: function (fn) {
		try {
			fn();
			throw new Error('No exception was thrown.');
		} catch (err) {
			// Do nothing - success
		}
	}

};
