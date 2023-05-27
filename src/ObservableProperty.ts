import type { PropertyChangeHandler, PropertySetHandler } from './types';

import { ModelBase } from './ModelBase.js';
import { isDefined } from './utilities/isDefined.js';
import { isFunction } from './utilities/isFunction.js';
import { parseToModel } from './utilities/parseToModel.js';

/**
 * Property wrapper that can be observed for changes.
 */
export class ObservableProperty<T> {

	/**
	 * The model type to parse the property value to. Allows for strongly typed runtime models.
	 */
	private _model: typeof ModelBase | undefined;

	/**
	 * The property value that is being observed.
	 */
	private _value: T | undefined;

	/**
	 * The list of subscribers who are observing the property.
	 */
	private _subscribers: PropertyChangeHandler[];

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
	constructor({ model }: { model?: typeof ModelBase}) {

		// Validate the property parameters.
		// n/a

		// Set default property values.
		this._model = model;
		this._value = undefined;
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
	get(): T | undefined {

		if (this._value === undefined) {
			return undefined;
		}

		return parseToModel<T>(this._value, this._model);
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
	set(valueOrFunction: T | PropertySetHandler | undefined): void {

		// Update the property value.
		if (valueOrFunction === undefined) {

			// If the new value is undefined, then unset the property value.
			this._value = undefined;

		} else if (isFunction(valueOrFunction)) {

			// If the property value is a function, then call it with a the current property value to allow the property values to be modified directly.
			const draft = this._value;

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			valueOrFunction(draft);

			this._value = parseToModel(draft, this._model);

		} else {

			// Otherwise, just set the property value, making a copy to prevent mutation of the property value by reference.
			this._value = parseToModel(valueOrFunction, this._model);
		}

		// Notify subscribers that the property value has changed.
		for (const subscriber of this._subscribers) {

			// Emit a frozen value to prevent mutation of the property value by reference.
			subscriber(parseToModel(this._value, this._model));
		}
	}

	/**
	 * Registers a subscriber to listen for property value changes.
	 * 
	 * @param handler - The function to call when the property value changes.
	 * 
	 * @returns Nothing.
	 */
	subscribe(handler: PropertyChangeHandler): void {

		this._subscribers.push(handler);
	}

	/**
	 * Removes a registers property value change subscriber.
	 * 
	 * @param handler - The function to call when the property value changes.
	 * 
	 * @returns Nothing.
	 */
	unsubscribe(handler: PropertyChangeHandler): void {

		this._subscribers = this._subscribers.filter(subscriber => subscriber !== handler);
	}
}