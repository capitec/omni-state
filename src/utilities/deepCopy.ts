// Check if the Structured Clone API is available in the browser.
let useStructuredClone = false;

if (window['structuredClone']) {
	useStructuredClone = true;
}

/**
 * Makes a complete copy of a given serializable object, preventing any accidental modification by reference to the source object.
 *
 * @param object - The object to make a deep copy of.
 * 
 * @returns The deep copy of the object.
 */
export function deepCopy(object: any): any { // eslint-disable-line @typescript-eslint/no-explicit-any

	// Implementation based on:
	// 1) web.dev article - https://web.dev/structured-clone/
	// 2) performance benchmark - https://surma.dev/things/deep-copy/index.html

	// Just return the value if it is a primitive, i.e. not and object type.
	if (typeof object !== 'object' || object === null || object === undefined) {
		return object;
	}

	// Make a deep copy of the object using the new structuredClone API if available.
	if (useStructuredClone) {
		return structuredClone(object) as object;
	}

	// Otherwise serialize the object to string and back into an new object.
	return JSON.parse(JSON.stringify(object)) as object;
}