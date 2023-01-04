/**
 * Determine if a given value is a promise.
 * 
 * @param {boolean} value - The value to check.
 * 
 * @returns {boolean} True if the value is a promise, otherwise false.
 */
function isPromise(value) {

	return value && typeof value.then === 'function';
}

export {
	isPromise as default,
	isPromise
};