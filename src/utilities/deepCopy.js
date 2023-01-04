// Check if the Structured Clone API is available in the browser.
let useStructuredClone = false;

if (window.structuredClone) {
	useStructuredClone = true;
}

/**
 * Makes a complete copy of a given serializable object, preventing any accidental modification by reference to the source object.
 * 
 * Based on this:
 *   - web.dev article - https://web.dev/structured-clone/
 *   - performance benchmark - https://surma.dev/things/deep-copy/index.html
 *
 * @param {object} object - The object to make a deep copy of.
 * 
 * @returns {object} The deep copy of the object.
 */
export function deepCopy(object) {

	// Just return the value if it is a primitive, i.e. not and object type.
	if (typeof object !== 'object' || object === null) {

		return object;
	}

	// Make a deep copy of the object using the new structuredClone API if available.
	if (useStructuredClone) {

		return structuredClone(object);
	}

	// Otherwise serialize the object to string and back into an new object.
	return JSON.parse(JSON.stringify(object));
}

export default {
	deepCopy
};

/*
// ALTERNATIVE TO JSON.parse + JSON.stringify

// Create an array or object to hold the result values.
const result = Array.isArray(object) ? [] : {};

// Recursively copy each of the nested object type properties on the object.
for (const key in object) {

	if (Object.prototype.hasOwnProperty.call(object, key)) {

		result[key] = deepCopy(object[key]);
	}
}

// Return the copied object.
return result;
*/