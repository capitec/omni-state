import type { PropertyChangeHandler, PropertySetHandler } from './types';

import { isDefined } from './utilities/isDefined.js';
import { isFunction } from './utilities/isFunction.js';
import { deepCopy } from './utilities/deepCopy';

/**
 * Property wrapper that can be observed for changes.
 */
export class ObservableProperty<T> {

	/**
	 * The property value that is being observed.
	 */
	private _value!: T;

	/**
	 * The list of subscribers who are observing the property.
	 */
	private _subscribers: PropertyChangeHandler<T>[];

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
	 * @param args - The property arguments.
	 */
	constructor() {

		// Validate the property parameters.
		// n/a

		// Set default property values.
		this._subscribers = [];
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Check if the property value is set.
	 * 
	 * @returns True if the value is set, otherwise false.
	 */
	exists(): boolean {

		if (!isDefined(this._value)) {
			return false;
		}

		return true;
	}

	/**
	 * Get the property value.
	 * 
	 * @returns The stored value.
	 */
	get(): T {

		return this._value;
	}

	/**
	 * Sets the property value.
	 * 
	 * The value may either be:
	 * 1) a direct value matching the property type, or
	 * 2) a function that will be called with a template of the current property value, that may be modified and will replace the property value when complete
	 * 
	 * @param valueOrFunction - The value to set, or the function to call.
	 * 
	 * @returns Nothing.
	 */
	set(valueOrFunction: T | PropertySetHandler<T>): void {

		// Update the property value.
		if (valueOrFunction === undefined) {

			// If the new value is undefined, then unset the property value.
			this._value = valueOrFunction;

		} else if (isFunction(valueOrFunction)) {

			// If the property value is a function, then call it with a the current property value to allow the property values to be modified directly.
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			valueOrFunction(this._value); // ?? {} as T);

			this._value = deepCopy(this._value) as T;

		} else {

			// Otherwise, just set the property value, making a copy to prevent mutation of the property value by reference.
			this._value = deepCopy(valueOrFunction) as T;
		}

		// Notify subscribers that the property value has changed.
		for (const subscriber of this._subscribers) {

			// Emit a frozen value to prevent mutation of the property value by reference.
			subscriber(deepCopy(valueOrFunction) as T);
		}
	}

	/**
	 * Registers a subscriber to listen for property value changes.
	 * 
	 * @param handler - The function to call when the property value changes.
	 * 
	 * @returns Nothing.
	 */
	subscribe(handler: PropertyChangeHandler<T>): void {

		this._subscribers.push(handler);
	}

	/**
	 * Removes a registers property value change subscriber.
	 * 
	 * @param handler - The function to call when the property value changes.
	 * 
	 * @returns Nothing.
	 */
	unsubscribe(handler: PropertyChangeHandler<T>): void {

		this._subscribers = this._subscribers.filter(subscriber => subscriber !== handler);
	}
}