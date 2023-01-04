import { ModelBase } from './ModelBase';
import { isDefined } from './utilities/isDefined';
import { isFunction } from './utilities/isFunction';
import { parseToModel } from './utilities/parseToModel';

/**
 * Property wrapper that can be observed for changes.
 * 
 * @template T
 */
class ObservableProperty {

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

	/**
	 * The subscriber function to call whenever the property value changes.
	 * 
	 * @callback PropertyChangeHandler
	 * 
	 * @param {T} value - The new property value.
	 * 
	 * @returns {void}
	 */

	/**
	 * The model type to parse the property value to. Allows for strongly typed runtime models.
	 * 
	 * @type {ModelBase}
	 */
	#model;

	/**
	 * The property value that is being observed.
	 * 
	 * @type {T?}
	 */
	#value;

	/**
	 * The list of subscribers who are observing the property.
	 * 
	 * @type {PropertyChangeHandler[]}
	 */
	#subscribers;

	// ----------
	// PROPERTIES
	// ----------

	// n/a

	// ------------
	// CONSTRUCTORS
	// ------------

	/**
	 * Initializes the property.
	 * 
	 * @param {object} args - The property arguments.
	 * @param {ModelBase} [args.model] - Optional, model type to parse the property value to. Allows for strongly typed runtime models.
	 */
	constructor({ model } = {}) {

		// Validate the property parameters.
		// n/a

		// Set default property values.
		this.#model = model;
		this.#value = null;
		this.#subscribers = [];
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Check if the property value is set.
	 * 
	 * @returns {boolean} True if the value is set, otherwise false.
	 */
	exists() {

		if (!isDefined(this.#value)) {
			return false;
		}

		return true;
	}

	/**
	 * Get the property value.
	 * 
	 * @returns {T} The stored value.
	 */
	get() {

		return parseToModel(this.#value, this.#model);
	}

	/**
	 * Sets the property value.
	 * 
	 * The value may either be:
	 * 1) a direct value matching the property type, or
	 * 2) a function that will be called with a template of the current property value, that may be modified and will replace the property value when complete
	 * 
	 * @param {PropertySetHandler} valueOrFunction - The value to set, or the function to call.
	 * 
	 * @returns {void}
	 */
	set(valueOrFunction) {

		// Update the property value.
		if (isFunction(valueOrFunction)) {

			// If the property value is a function, then call it with a the current property value to allow the property values to be modified directly.
			const draft = this.#value;

			valueOrFunction(draft);

			this.#value = parseToModel(draft, this.#model);

		} else {

			// Otherwise, just set the property value, making a copy to prevent mutation of the property value by reference.
			this.#value = parseToModel(valueOrFunction, this.#model);
		}

		// Notify subscribers that the property value has changed.
		for (const subscriber of this.#subscribers) {

			// Emit a frozen value to prevent mutation of the property value by reference.
			subscriber(parseToModel(this.#value, this.#model));
		}
	}

	/**
	 * Registers a subscriber to listen for property value changes.
	 * 
	 * @param {PropertyChangeHandler} handler - The function to call when the property value changes.
	 * 
	 * @returns {void}
	 */
	subscribe(handler) {

		this.#subscribers.push(handler);
	}

	/**
	 * Removes a registers property value change subscriber.
	 * 
	 * @param {PropertyChangeHandler} handler - The function to call when the property value changes.
	 * 
	 * @returns {void}
	 */
	unsubscribe(handler) {

		this.#subscribers = this.#subscribers.filter(subscriber => subscriber !== handler);
	}
}

export {
	ObservableProperty as default,
	ObservableProperty
};