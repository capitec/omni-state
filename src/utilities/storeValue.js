/**
 * Saves a value in storage, or remove it from storage if not set.
 * 
 * @template T
 * 
 * @param {Storage} storage - The storage mechanism to save the value in.
 * @param {string} key - The key to save the value under.
 * @param {T} [value] - The value to save.
 * @param {JSON} [encoder] - The string encoding function to apply to property values before saving it in storage.
 * 
 * @returns {void}
 */
export function storeValue(storage, key, value, encoder) {

	// Remove the value from storage if it is not set.
	if (value === undefined || value === null) {
		return storage.removeItem(key);
	}

	// Encode the property value with the provided encoder.
	let encodedValue = value;

	if (encoder) {
		encodedValue = encoder.stringify(value);
	}

	// Save the new value to storage.
	storage.setItem(key, encodedValue);
}

export default {
	storeValue
};