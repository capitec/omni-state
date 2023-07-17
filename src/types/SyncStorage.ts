/**
 * Interface to persist values to a synchronous storage mechanism.
 */
export interface SyncStorage {

	/**
	 * Gets a value from storage for the given key.
	 * 
	 * @param key - The key under which the value is stored.
	 * 
	 * @returns The stored value parsed from JSON, or null if not set.
	 */
	get<T>(key: string): T | undefined;

	/** 
	 * Sets a value in storage for the given key.
	 * 
	 * @param key - The key under which to store the value.
	 * @param value - The value to store.
	 * 
	 * @returns Nothing.
	 */
	set(key: string, value: unknown): void;

	/**
	 * Removes a value from storage for the given key.
	 * 
	 * @param key - The key of the value to remove.
	 * 
	 * @returns Nothing.
	 */
	remove(key: string): void;

	/**
	 * Removes all values from storage.
	 * 
	 * @returns Nothing.
	 */
	clear(): void;

	/**
	 * Get the name of the key at a given index.
	 * 
	 * @param index - The index number to get the key name for.
	 * 
	 * @returns The name of the key at the index.
	 */
	key(index: number): string | undefined;

	/**
	 * Finds a list of all keys in storage.
	 * 
	 * @returns The list of keys in storage.
	 */
	keys(): string[];

	/**
	 * Get the number of items in storage.
	 * 
	 * @returns The storage item count.
	 */
	size(): number;
}