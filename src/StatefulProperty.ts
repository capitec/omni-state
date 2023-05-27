import { ModelBase } from './ModelBase.js';
import { ObservableProperty } from './ObservableProperty.js';
import { PropertySetHandler } from './types.js';
import { isDefined } from './utilities/isDefined.js';
import { isFunction } from './utilities/isFunction.js';
import { isPromise } from './utilities/isPromise.js';
import { storeValue } from './utilities/storeValue.js';

/**
 * List of asynchronous storage read operations that are running.
 */
const _pendingPromises = new Map<string, Promise<string | void | null>>();

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
	private _storage: Storage;

	/**
	 * The key to save the value under.
	 */
	private _key: string

	/**
	 * JSON-like string encoding interface (i.e. parse, stringify) to apply to property values when saving to and reading from storage.
	 */
	private _encoder: JSON;

	// ------------
	// CONSTRUCTORS
	// ------------

	/**
	 * Initializes the property.
	 * 
	 * @param args - The property arguments.
	 */
	constructor({ storage, key, encoder, model }: { storage: Storage, key: string, encoder: JSON, model?: typeof ModelBase }) {

		super({ model });
		
		// Validate the property parameters.
		if (!storage) {
			throw new Error(`StatefulProperty - "${key}" requires a "storage" mechanism to be specified, e.g. localStorage, sessionStorage, or a similar interface.`);
		}

		if (!key) {
			throw new Error(`StatefulProperty - "${key}" requires a "key" to be specified, e.g. "my-property-name".`);
		}

		if (encoder && !isFunction(encoder.parse)) { // eslint-disable-line @typescript-eslint/unbound-method
			throw new Error(`StatefulProperty - "${key}" requires a "parse" function on the specified "encoder".`);
		}

		if (encoder && !isFunction(encoder.stringify)) { // eslint-disable-line @typescript-eslint/unbound-method
			throw new Error(`StatefulProperty - "${key}" requires a "stringify" function on the specified "encoder".`);
		}

		// Set default property values.
		this._storage = storage;
		this._key = key;
		this._encoder = encoder || JSON;

		// Restore the property value from storage.
		this._initFromStorage();
	}

	// ----------------
	// STATIC FUNCTIONS
	// ----------------

	/**
	 * Property that can be awaited to guarantee that all `StatefulProperty`'s have been initialized from storage. Required to enable async data stores.
	 * 
	 * @returns Nothing.
	 */
	static get allSettled(): Promise<Map<string, any>> {

		return new Promise((resolve, reject) => {

			const keys = Object.keys(_pendingPromises);

			// Wait for all of the pending storage read operations to finalize.
			void Promise.allSettled(_pendingPromises.values()).then(outcome => {

				// Report the value of each storage property read.
				const result = new Map<string, any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

				for (let i = 0; i < outcome.length; i++) {

					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					result.set(keys[i], outcome[i].value);
				}

				resolve(result);
			});
		});
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Sets the property value, and then persists the property value into the configured storage mechanism.
	 * 
	 * The value may either be:
	 *   1) a direct value matching the property model, or
	 *   2) a function that will be called with a template of the current property value, that may be modified and will replace the property value when complete
	 * 
	 * @param valueOrFunction - The value to set, or the function to call.
	 * 
	 * @returns Nothing.
	 */
	override set(valueOrFunction: T | PropertySetHandler | undefined): void {

		// Set the new property value.
		super.set(valueOrFunction);

		// Get the new property value in serializable form, i.e. not a function.
		let newValue = valueOrFunction;

		if (isFunction(valueOrFunction)) {

			newValue = super.get();
		}

		// Save the new property value in storage.
		storeValue(this._storage, this._key, newValue, this._encoder);
	}

	// -----------------
	// PRIVATE FUNCTIONS
	// -----------------

	/**
	 * Initializes the property value from storage, if available.
	 */
	_initFromStorage(): void {

		// Read the property value from storage.
		const storageValue = this._storage.getItem(this._key);

		if (isDefined(storageValue)) {

			// If the storage is async, then queue the value to be read, otherwise just set the storage value as the property's initial value.
			if (isPromise(storageValue)) {

				_pendingPromises.set(this._key, Promise.resolve(storageValue).then((value) => {

					// Parse the value set in storage using the set decoder.
					let decodedValue = value;

					if (this._encoder && value) {
						decodedValue = this._encoder.parse(value); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
					}

					// Set the decoded storage value as the initial property value.
					super.set(decodedValue as T || undefined);

					// Clean up, by removing the operation from read the queue.
					_pendingPromises.delete(this._key);

					return decodedValue;
				}));

			} else {

				// Parse the value set in storage using the set decoder.
				let decodedValue = storageValue;

				if (this._encoder && storageValue) {
					decodedValue = this._encoder.parse(storageValue); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
				}

				// Set the decoded storage value as the initial property value.
				super.set(decodedValue as T || undefined);
			}
		}
	}
}