/**
 * Determine if a given value is a function, i.e. not null or undefined.
 * 
 * @param {boolean} value - The value to check.
 * 
 * @returns {boolean} True if the value is a function, otherwise false.
 */
function isFunction(value) {

	return value && typeof value === 'function';
}

export {
	isFunction as default,
	isFunction
};