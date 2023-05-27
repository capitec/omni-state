/**
 * Saves a value in storage, or remove it from storage if not set.
 * 
 * @param storage - The storage mechanism to save the value in.
 * @param key - The key to save the value under.
 * @param value - The value to save.
 * @param encoder - The string encoding function to apply to property values before saving it in storage.
 * 
 * @returns Nothing.
 */
export function storeValue(storage: Storage, key: string, value?: any, encoder?: JSON): void { // eslint-disable-line @typescript-eslint/no-explicit-any

	// Remove the value from storage if it is not set.
	if (value === undefined || value === null) {
		return storage.removeItem(key);
	}

	// Encode the property value with the provided encoder.
	let encodedValue = value; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

	if (encoder) {
		encodedValue = encoder.stringify(value);
	}

	// Save the new value to storage.
	storage.setItem(key, encodedValue); // eslint-disable-line @typescript-eslint/no-unsafe-argument
}