/**
 * Freezes a given object, preventing any changes to be made to it's properties or any nested values.
 * 
 * Based on the MDN Object.freeze documentation, available here:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 * 
 * @param {object} object - The value to freeze.
 * 
 * @returns {object} - The frozen object.
 */
export function deepFreeze(object) {

	// Just return the value if it is a primitive, i.e. not and object type.
	if (typeof object !== 'object' || object === null) {

		return object;
	}

	// Lookup the property names set on the object.
	const propertyNames = Reflect.ownKeys(object);

	// Recursively freeze the each of nested object type properties on the object.
	for (const name of propertyNames) {

		const value = object[name];

		if (value) {

			if (typeof value === 'object' || typeof value === 'function') {

				deepFreeze(value);
			}
		}
	}

	// Freeze the object itself and return it.
	return Object.freeze(object);
}

export default {
	deepFreeze
};