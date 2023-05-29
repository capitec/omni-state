import { SyncStorage } from '../types/SyncStorage.js';

/**
 * Simple wrapper around the browser `localStorage` that simplifies storing values across browser sessions.
 * 
 * Values are persisted to storage as JSON strings, and can be read back as typed objects.
 */
class LocalStorageImpl implements SyncStorage {

	/**
	 * Gets a value from storage for the given key.
	 * 
	 * @param key - The key under which the value is stored.
	 * 
	 * @returns The stored value parsed from JSON, or null if not set.
	 */
	get<T>(key: string): T | undefined {

		try {

			const result = window.localStorage.getItem(key);

			if (!result) {
				return undefined;
			}

			return JSON.parse(result) as T;

		} catch (err) {

			return undefined;
		}
	}

	/** 
	 * Sets a value in storage for the given key.
	 * 
	 * @param key - The key under which to store the value.
	 * @param value - The value to store.
	 * 
	 * @returns Nothing.
	 */
	set(key: string, value: unknown): void {

		window.localStorage.setItem(key, JSON.stringify(value));
	}

	/**
	 * Removes a value from storage for the given key.
	 * 
	 * @param key - The key of the value to remove.
	 * 
	 * @returns Nothing.
	 */
	remove(key: string): void {

		window.localStorage.removeItem(key);
	}

	/**
	 * Removes all values from storage.
	 * 
	 * @returns Nothing.
	 */
	clear(): void {

		window.localStorage.clear();
	}

	/**
	 * Get the name of the key at a given index.
	 * 
	 * @param index - The index number to get the key name for.
	 * 
	 * @returns The name of the key at the index.
	 */
	key(index: number): string | undefined {

		return window.localStorage.key(index) || undefined;
	}

	/**
	 * Finds a list of all keys in storage.
	 * 
	 * @returns The list of keys in storage.
	 */
	keys(): string[] {

		return Object.keys(window.localStorage);
	}

	/**
	 * Get the number of items in storage.
	 * 
	 * @returns The storage item count.
	 */
	size(): number {

		return window.localStorage.length;
	}
}

export const LocalStorage = new LocalStorageImpl();