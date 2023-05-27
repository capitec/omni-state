/**
 * Freezes a given object, preventing any changes to be made to it's properties or any nested values.
 * 
 * @param object - The value to freeze.
 * 
 * @returns The frozen object.
 */
export function deepFreeze(object: object): object {

	// Implementation based on the MDN Object.freeze documentation, available here:
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze

	// Just return the value if it is a primitive, i.e. not and object type.
	if (typeof object !== 'object' || object === null || object === undefined) {

		return object;
	}

	// Recursively freeze the each of nested object type properties on the object.
	Object.entries(object).forEach(([key, value]) => { // eslint-disable-line @typescript-eslint/no-unused-vars
		
		if (value) {

			if (typeof value === 'object' || typeof value === 'function') {
				deepFreeze(value); // eslint-disable-line @typescript-eslint/no-unsafe-argument
			}
		}
	});

	// Freeze the object itself and return it.
	return Object.freeze(object);
}