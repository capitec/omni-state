import { ObservableProperty } from './ObservableProperty.js';
import { StateManager } from './StateManager.js';
import { PropertySetHandler } from './types.js';
import { AsyncStorage } from './types/AsyncStorage.js';
import { SyncStorage } from './types/SyncStorage.js';
import { isDefined } from './utilities/isDefined.js';
import { isPromise } from './utilities/isPromise.js';

/**
 * Property wrapper that can be observed for changes.
 */
export class StatefulProperty<T> extends ObservableProperty<T> {

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * The storage mechanism to save the value in.
	 */
	private _storage: SyncStorage | AsyncStorage;

	/**
	 * The key to save the value under.
	 */
	private _key: string;

	// ------------
	// CONSTRUCTORS
	// ------------

	/**
	 * Initializes the property.
	 * 
	 * @param args - The property arguments.
	 */
	constructor({ storage, key }: { storage: SyncStorage | AsyncStorage, key: string }) {

		super();

		// Validate the property parameters.
		if (!storage) {
			throw new Error(`StatefulProperty - "${key}" requires a "storage" mechanism to be specified, e.g. LocalStorage, SessionStorage, or a similar interface.`);
		}

		if (!key) {
			throw new Error(`StatefulProperty - "${key}" requires a "key" to be specified, e.g. "my-property-name".`);
		}

		// Set default property values.
		this._storage = storage;
		this._key = key;

		// Restore the property value from storage.
		this._initFromStorage();
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Sets the property value, and then persists the property value into the configured storage mechanism.
	 * 
	 * The value may either be:
	 *   1) a direct value matching the property type, or
	 *   2) a function that will be called with a template of the current property value, that may be modified and will replace the property value when complete
	 * 
	 * @param valueOrFunction - The value to set, or the function to call.
	 * 
	 * @returns Nothing.
	 */
	override set(valueOrFunction: T | PropertySetHandler<T>): void {

		// Set the new property value.
		super.set(valueOrFunction);

		// Get the new property value in serializable form, i.e. not a function.
		const newValue = super.get();

		// Save / remove the property value in storage.
		if (newValue === undefined || newValue === null) {
			void this._storage.remove(this._key);
		} else {
			void this._storage.set(this._key, newValue);
		}
	}

	// -----------------
	// PRIVATE FUNCTIONS
	// -----------------

	/**
	 * Initializes the property value from storage, if available.
	 */
	_initFromStorage(): void {

		// Read the property value from storage.
		const storageValue = this._storage.get<T>(this._key);

		if (isDefined(storageValue)) {

			// If the storage is async, then queue the value to be read, otherwise just set the storage value as the property's initial value.
			if (isPromise(storageValue)) {

				StateManager.enqueue(this._key, Promise.resolve(storageValue).then((value) => {

					// Initialize the property with the value read from storage.
					super.set(value as T);

					// Clean up, by removing the operation from read the queue.
					StateManager.dequeue(this._key);

					return value;
				}));

			} else {

				// Initialize the property with the value read from storage.
				super.set(storageValue as T);
			}
		}
	}
}