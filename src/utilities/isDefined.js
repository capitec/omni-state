/**
 * Determine if a given value is set, i.e. not null or undefined.
 * 
 * @param {boolean} value - The value to check.
 * 
 * @returns {boolean} True if the value is set, otherwise false.
 */
function isDefined(value) {

	return value !== null && value !== undefined;
}

export {
	isDefined as default,
	isDefined
};