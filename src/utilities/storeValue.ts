import { AsyncStorage } from '../types/AsyncStorage';
import { SyncStorage } from '../types/SyncStorage';

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
export function storeValue(storage: SyncStorage | AsyncStorage, key: string, value?: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any

	// Remove the value from storage if it is not set.
	if (value === undefined || value === null) {
		void storage.remove(key);
		return;
	}

	// Save the new value to storage.
	void storage.set(key, value);
}