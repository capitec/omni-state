import { SyncStorage } from '../types/SyncStorage';

/**
 * Storage class that allows for persisting data as JSON values for the duration of a browser session.
 */
class SessionStorageImpl implements SyncStorage {

	/**
	 * Gets a value from storage for the given key.
	 * 
	 * @param key - The key under which the value is stored.
	 * 
	 * @returns The stored value parsed from JSON, or undefined if not set.
	 */
	get<T>(key: string): T | undefined {

		try {

			const result = window.sessionStorage.getItem(key);

			if (!result) {
				return undefined;
			}

			return JSON.parse(result) as T;

		} catch (err) {

			console.error(err);

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

		try {

			window.sessionStorage.setItem(key, JSON.stringify(value));

		} catch (err) {

			console.error(err);
		}
	}

	/**
	 * Removes a value from storage for the given key.
	 * 
	 * @param key - The key of the value to remove.
	 * 
	 * @returns Nothing.
	 */
	remove(key: string): void {

		try {

			window.sessionStorage.removeItem(key);

		} catch (err) {

			console.error(err);
		}
	}

	/**
	 * Removes all values from storage.
	 * 
	 * @returns Nothing.
	 */
	clear(): void {

		try {

			window.sessionStorage.clear();

		} catch (err) {

			console.error(err);
		}
	}

	/**
	 * Get the name of the key at a given index.
	 * 
	 * @param index - The index number to get the key name for.
	 * 
	 * @returns The name of the key at the index.
	 */
	key(index: number): string | undefined {

		return window.sessionStorage.key(index) || undefined;
	}

	/**
	 * Finds a list of all keys in storage.
	 * 
	 * @returns The list of keys in storage.
	 */
	keys(): string[] {

		return Object.keys(window.sessionStorage);
	}

	/**
	 * Get the number of items in storage.
	 * 
	 * @returns The storage item count.
	 */
	size(): number {

		return window.sessionStorage.length;
	}
}

export const SessionStorage = new SessionStorageImpl();