import { ModelBase } from './ModelBase';
import { ObservableProperty } from './ObservableProperty';
import { isDefined } from './utilities/isDefined';
import { isFunction } from './utilities/isFunction';
import { isPromise } from './utilities/isPromise';
import { storeValue } from './utilities/storeValue';

/**
 * List of asynchronous storage read operations that are running.
 */
const _pendingPromises = {};

/**
 * Property wrapper that can be observed for changes.
 * 
 * @template T
 */
class StatefulProperty extends ObservableProperty {

	/**
	 * The function to call whenever a property value is set, allowing for modification of the current
	 * property value instead of overriding it completely.
	 * 
	 * @callback PropertySetHandler
	 * 
	 * @param {T} value - The current property value.
	 * 
	 * @returns {void}
	 */

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * The storage mechanism to save the value in.
	 * 
	 * @type {Storage}
	 */
	#storage;

	/**
	 * The key to save the value under.
	 * 
	 * @type {Storage}
	 */
	#key;

	/**
	 * The string encoding function to apply to property values before saving it in storage.
	 * 
	 * @type {Storage}
	 */
	#encoder;

	// ------------
	// CONSTRUCTORS
	// ------------

	/**
	 * Initializes the property.
	 * 
	 * @param {object} args - The property arguments.
	 * @param {Storage} args.storage - The storage mechanism to save the value in.
	 * @param {string} args.key - The key to save the value under.
	 * @param {JSON} [args.encoder] - Optional, a JSON-like string encoding interface (i.e. parse, stringify) to apply to property values when saving to and reading from storage. Defaults to JSON.
	 * @param {ModelBase} [args.model] - Optional, model type to parse the property value to. Allows for strongly typed runtime models.
	 */
	constructor({ storage, key, encoder = JSON, model } = {}) {

		super({ model });

		// Validate the property parameters.
		if (!storage) {
			throw new Error(`StatefulProperty - "${key}" requires a "storage" mechanism to be specified, e.g. localStorage, sessionStorage, or a similar interface.`);
		}

		if (!key) {
			throw new Error(`StatefulProperty - "${key}" requires a "key" to be specified, e.g. "my-property-name".`);
		}

		if (encoder && !isFunction(encoder.parse)) {
			throw new Error(`StatefulProperty - "${key}" requires a "parse" function on the specified "encoder".`);
		}

		if (encoder && !isFunction(encoder.stringify)) {
			throw new Error(`StatefulProperty - "${key}" requires a "stringify" function on the specified "encoder".`);
		}

		// Set default property values.
		this.#storage = storage;
		this.#key = key;
		this.#encoder = encoder;

		// Restore the property value from storage.
		this.#initFromStorage();
	}

	// ----------------
	// STATIC FUNCTIONS
	// ----------------

	/**
	 * Property that can be awaited to guarantee that all ```StatefulProperty```'s have been initialized from storage. Required to enable async data stores.
	 * 
	 * @type {Promise<any>}
	 */
	static get allSettled() {

		return new Promise((resolve, reject) => {

			const keys = Object.keys(_pendingPromises);

			// Wait for all of the pending storage read operations to finalize.
			Promise.allSettled(Object.values(_pendingPromises)).then(outcome => {

				// Report the value of each storage property read.
				const result = {};

				for (let i = 0; i < outcome.length; i++) {

					result[keys[i]] = outcome[i].value;
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
	 * @param {T|PropertySetHandler} valueOrFunction - The value to set, or the function to call.
	 * 
	 * @returns {void}
	 */
	set(valueOrFunction) {

		// Set the new property value.
		super.set(valueOrFunction);

		// Get the new property value in serializable form, i.e. not a function.
		let newValue = valueOrFunction;

		if (isFunction(valueOrFunction)) {

			newValue = super.get();
		}

		// Save the new property value in storage.
		storeValue(this.#storage, this.#key, newValue, this.#encoder);
	}

	// -----------------
	// PRIVATE FUNCTIONS
	// -----------------

	/**
	 * Initializes the property value from storage, if available.
	 * 
	 * @returns {void}
	 */
	#initFromStorage() {

		// Read the property value from storage.
		const storageValue = this.#storage.getItem(this.#key);

		if (isDefined(storageValue)) {

			// If the storage is async, then queue the value to be read, otherwise just set the storage value as the property's initial value.
			if (isPromise(storageValue)) {

				_pendingPromises[this.#key] = Promise.resolve(storageValue).then((value) => {

					// Parse the value set in storage using the set decoder.
					let decodedValue = value;

					if (this.#encoder) {
						decodedValue = this.#encoder.parse(value);
					}

					// Set the decoded storage value as the initial property value.
					super.set(decodedValue);

					// Clean up, by removing the operation from read the queue.
					delete _pendingPromises[this.#key];

					return decodedValue;
				});

			} else {

				// Parse the value set in storage using the set decoder.
				let decodedValue = storageValue;

				if (this.#encoder) {
					decodedValue = this.#encoder.parse(storageValue);
				}

				// Set the decoded storage value as the initial property value.
				super.set(decodedValue);
			}
		}
	}
}

export {
	StatefulProperty as default,
	StatefulProperty
};