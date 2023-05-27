/*
 * IMPORTANT
 *
 * This is a property decorator. Decorators are currently a Stage 3 proposal at TC39 and thus not
 * yet a core part of the JavaScript language. However they have been commonly used since 2017
 * through implementations provided by Babel and Typescript.
 * 
 * Confusingly, there are multiple implementation standards, the most common of which are:
 *   1) Typescript (experimentalDecorators: true)
 *   2) Babel Legacy (version: "legacy")
 *   3) Babel Standard (version: "2018-09")
 * 
 * Babel additionally provides versions for "2021-12" and "2022-03", however TC39 recommends not
 * adopting these as the ultimate specifications may change. This decorator thus only aims to
 * support the 3 most common versions of the spec currently in use as above.
 * 
 * More info here:
 *   - TC39 Status = https://github.com/tc39/proposal-decorators
 *   - Stage 2 Proposal (aka Babel Standard) = https://github.com/tc39/proposal-decorators/blob/7fa580b40f2c19c561511ea2c978e307ae689a1b/METAPROGRAMMING.md
 *   - Babel Decorators Plugin = https://babeljs.io/docs/en/babel-plugin-proposal-decorators
 *   - TypeScript Experimental Decorators = https://www.typescriptlang.org/docs/handbook/decorators.html
*/

import { ObservableProperty } from '../ObservableProperty';
import { isDefined } from '../utilities/isDefined';
import { isFunction } from '../utilities/isFunction';
import { isObservable } from '../utilities/isObservable';
import { isPromise } from '../utilities/isPromise';
import { storeValue } from '../utilities/storeValue';

// -----------------------------
// OBSERVABLE PROPERTY DECORATOR
// -----------------------------

/**
 * Patch the set function of an ObservableProperty to save the property value into storage when the set function is called.
 * 
 * @param {Storage} storage - The storage mechanism to save the value in.
 * @param {string} key - The key to save the value under.
 * @param {ObservableProperty} observable - The observable property to patch.
 * @param {JSON} encoder - The string encoding function to apply to property values before saving it in storage.
 * 
 * @returns {void}
 */
function patchObservablePropertySet(storage, key, observable, encoder) {

	// Prevent the ObservableProperty.set function from being patch if it is already patched.
	if (observable['_state_set_patched']) { // eslint-disable-line dot-notation
		return;
	}

	// Get the property value get and set functions.
	const observablePrototype = Object.getPrototypeOf(observable);

	const propertyGetFunction = Object.getOwnPropertyDescriptor(observablePrototype, 'get').value;
	const propertySetFunction = Object.getOwnPropertyDescriptor(observablePrototype, 'set').value;

	// Override the ObservableProperty.set function to save the property value into storage when the set function is called.
	// Note: *this* is only available in shorthand functions, thus disabling the eslint rule. See https://stackoverflow.com/a/53767500
	Object.defineProperty(observable, 'set', { // eslint-disable-line object-shorthand
		kind: 'method',
		placement: 'own',
		value(...args) {

			// Call the original ObservableProperty.set function to set the value.
			propertySetFunction.apply(this, args);

			// Get the new property value in serializable form, i.e. not a function.
			let newValue = args[0];

			if (isFunction(newValue)) {

				newValue = propertyGetFunction.apply(this);
			}

			// Save the new property value in storage.
			storeValue(storage, key, newValue, encoder);
		},
		writable: true,
		enumerable: false,
		configurable: true
	});

	// Keep track that the ObservableProperty.set function has been patched.
	Object.defineProperty(observable, '_state_set_patched', {
		value: true
	});
}

// ------------------------
// DECORATOR IMPLEMENTATION
// ------------------------

/**
 * List of asynchronous storage read operations that are running.
 */
const _pendingPromises = {};

/**
 * Property decorator saves the value of a property into storage whenever the property value changes.
 * 
 * Support is provided for the following storage mechanisms:
 *   1) localStorage
 *   2) sessionStorage
 *   3) any storage mechanism that implements the Web Storage API interface, i.e. https://developer.mozilla.org/en-US/docs/Web/API/Storage
 * 
 * The decorator can be used in any of the following decorator implementations:
 *   1) Typescript (experimentalDecorators: true)
 *   2) Babel Legacy (version: "legacy"), and
 *   3) Babel Standard (version: "2018-09")
 * 
 * @param {object} args - The decorator arguments.
 * @param {localStorage|sessionStorage|unknown} args.storage - The storage mechanism to write property value changes to.
 * @param {string} args.key - The storage key to write property values under.
 * @param {JSON} [args.encoder] - Optional, a JSON-like string encoding interface (i.e. parse, stringify) to apply to property values when saving to and reading from storage. Defaults to JSON.
 * 
 * ```js
 * import { ObservableProperty } from '@capitec/omni-state';
 * 
 * class AppState {
 * 
 *   @state({ storage: sessionStorage, key: 'my-property' })
 *   myProperty = 'Hello World';
 * 
 *   @state({ storage: localStorage, key: 'settings' })
 *   appSettings = new ObservableProperty();
 * }
 * ```
 * 
 * @returns {object|void} The decorator property descriptor (Babel Standard) or nothing (TypeScript and Babel Legacy).
 */
function state({ storage, key, encoder } = {}) {

	return function(protoOrDescriptor, name) { // eslint-disable-line func-names

		// Ensure the required decorator attributes are supplied.
		if (!storage) {
			throw new Error(`The @state() decorated property "${protoOrDescriptor.key}" requires a "storage" mechanism to be specified, e.g. localStorage, sessionStorage, or a similar interface.`);
		}

		if (!key) {
			throw new Error(`The @state() decorated property "${protoOrDescriptor.key}" requires a "key" to be specified, e.g. "my-property-name".`);
		}

		if (encoder && !isFunction(encoder.parse)) {
			throw new Error(`The @state() decorated property "${protoOrDescriptor.key}" requires a "parse" function on the specified "encoder".`);
		}

		if (encoder && !isFunction(encoder.stringify)) {
			throw new Error(`The @state() decorated property "${protoOrDescriptor.key}" requires a "stringify" function on the specified "encoder".`);
		}

		// Ensure the decorator is attached to a class field.
		if (protoOrDescriptor.kind !== 'field') {
			throw new Error(`The @state() decorator can only be applied to class fields. Attempted to attach to '${protoOrDescriptor.kind}'${protoOrDescriptor.key ? ` named '${protoOrDescriptor.key}'` : ''}.`);
		}

		// Default the encoder to JSON.stringify if not set.
		if (encoder === undefined) {
			encoder = JSON;
		}

		// Initialize the default property value.
		let propertyValue = protoOrDescriptor.initializer ? protoOrDescriptor.initializer() : undefined;

		// Patch the property to sync from and to storage when it's value changes.
		const storageValue = storage.getItem(key);

		if (isPromise(storageValue)) {

			// When the storage system is async, complete the patching operation as an async task.
			_pendingPromises[key] = Promise.resolve(storageValue).then((value) => {

				// Restore the property value from storage, if no initializer was provided and a value is available in storage.
				if (!isDefined(propertyValue) || (isObservable(propertyValue) && !propertyValue.exists())) { // eslint-disable-line no-extra-parens

					if (isDefined(storageValue)) {

						// Parse the value set in storage using the provided encoder.
						let decodedValue = value;

						if (encoder) {
							decodedValue = encoder.parse(value);
						}

						// Set the decoded storage value as the initial property value.
						if (isObservable(propertyValue)) {
							propertyValue.set(decodedValue);
						} else {
							propertyValue = decodedValue;
						}
					}
				}

				// Patch the property to save value changes into storage.
				if (isObservable(propertyValue)) {

					// If the property is a ObservableProperty type, then patch the ObservableProperty.set function to store the property value when the set function is called.
					patchObservablePropertySet(storage, key, propertyValue, encoder);

				} else {

					// If the property is any other type, then just set the property value in storage directly.
					storeValue(storage, key, propertyValue, encoder);
				}

				// Clean up, by removing the async operation from read the queue.
				delete _pendingPromises[key];

				// Return the initialized property value.
				return propertyValue;
			});

		} else {

			// Parse the value set in storage using the provided encoder.
			let decodedValue = storageValue;

			if (encoder) {
				decodedValue = encoder.parse(storageValue);
			}

			// Set the decoded storage value as the initial property value.
			if (isObservable(propertyValue)) {
				propertyValue.set(decodedValue);
			} else {
				propertyValue = decodedValue;
			}

			// Patch the property to save value changes into storage.
			if (isObservable(propertyValue)) {

				// If the property is a ObservableProperty type, then patch the ObservableProperty.set function to store the property value when the set function is called.
				patchObservablePropertySet(storage, key, propertyValue, encoder);

			} else {

				// If the property is any other type, then just set the property value in storage directly.
				storeValue(storage, key, propertyValue, encoder);
			}
		}

		// Create the new property descriptor template that patches state behavior onto the property.
		const newDescriptor = { // eslint-disable-line object-shorthand
			get() {
				return propertyValue;
			},
			set(value) {

				// Save the new property value.
				propertyValue = value;

				// Patch the property to save value changes into storage.
				if (!isDefined(propertyValue)) {

					// Clear the value in storage if the property value is not set.
					storeValue(storage, key, null, encoder);

				} else if (isObservable(propertyValue)) {

					// If the property is a ObservableProperty type, then patch the ObservableProperty.set function to store the property value when the set function is called.
					patchObservablePropertySet(storage, key, propertyValue, encoder);

				} else {

					// If the property is any other type, then just set the property value in storage directly.
					storeValue(storage, key, propertyValue, encoder);
				}
			},
			enumerable: true,
			configurable: true
		};

		//
		// This adds support of decorators in the following modes:
		//   - TypeScript (experimentalDecorators: true)
		//   - Babel Legacy Decorators (version: "legacy")
		//

		if (name !== undefined) {

			Object.defineProperty(protoOrDescriptor, name, newDescriptor);

			return;
		}

		//
		// This adds support of decorators in the following modes:
		//   - Babel Standard Decorators (version: "2018-09")
		//

		return {
			kind: 'method',
			placement: 'prototype',
			key: protoOrDescriptor.key,
			descriptor: newDescriptor
		};
	};
}

// Polyfill Promise.allSettled if if does not exist in the browser.
Promise.allSettled = Promise.allSettled || ((promises) => Promise.all(promises.map(p => p
	.then(value => ({ status: 'fulfilled', value: value }))
	.catch(reason => ({ status: 'rejected', reason: reason })))));

// Attach an 'all settled' property to the decorator that can be awaited to guarantee that all
// decorated properties have been initialized from storage. Required to enable async data stores.
Object.defineProperty(state, 'allSettled', {
	get: async () => {

		const keys = Object.keys(_pendingPromises);

		// Wait for all of the pending storage read operations to finalize.
		const outcome = await Promise.allSettled(Object.values(_pendingPromises));

		// Report the value of each storage property read.
		const result = {};

		for (let i = 0; i < outcome.length; i++) {

			result[keys[i]] = outcome[i].value;
		}

		return result;
	}
});

export {
	state as default,
	state
};