/**
 * Interface to persist values to an asynchronous storage mechanism.
 */
export interface AsyncStorage {

	/**
	 * The number of items in storage.
	 */
	readonly length: number;

	/**
	 * Gets a value from storage for the given key.
	 * 
	 * @param key - The key under which the value is stored.
	 * 
	 * @returns The stored value parsed from JSON, or null if not set.
	 */
	getItem<T>(key: string): Promise<T>;

	/** 
	 * Sets a value in storage for the given key.
	 * 
	 * @param key - The key under which to store the value.
	 * @param value - The value to store.
	 * 
	 * @returns Nothing.
	 */
	setItem<T>(key: string, value: T): Promise<void>;

	/**
	 * Removes a value from storage for the given key.
	 * 
	 * @param key - The key of the value to remove.
	 * 
	 * @returns Nothing.
	 */
	removeItem(key: string): Promise<void>;

	/**
	 * Removes all values from storage.
	 * 
	 * @returns Nothing.
	 */
	clear(): Promise<void>;

	/**
	 * Get the name of the key at a given index.
	 * 
	 * @param index - The index number to get the key name for.
	 * 
	 * @returns The name of the key at the index.
	 */
	key(index: number): string;

	/**
	 * Finds a list of all keys in storage.
	 * 
	 * @returns The list of keys in storage.
	 */
	keys(): Promise<string[]>;
}