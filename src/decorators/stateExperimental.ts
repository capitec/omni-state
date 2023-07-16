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
 * Recently, typescript 5.0 was released with support for the Stage 3 decorators proposal, the will
 * likely become the standard going forward, at which point we will release a new version of this
 * decorator without the 'experimental' moniker.
 * 
 * More info here:
 *   - TC39 Status = https://github.com/tc39/proposal-decorators
 *   - Stage 2 Proposal (aka Babel Standard) = https://github.com/tc39/proposal-decorators/blob/7fa580b40f2c19c561511ea2c978e307ae689a1b/METAPROGRAMMING.md
 *   - Babel Decorators Plugin = https://babeljs.io/docs/en/babel-plugin-proposal-decorators
 *   - TypeScript Experimental Decorators = https://www.typescriptlang.org/docs/handbook/decorators.html
 *   - TypeScript 5 Decorators = https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators
*/

import { ObservableProperty } from '../ObservableProperty.js';
import { StateManager } from '../StateManager.js';
import { AsyncStorage } from '../types/AsyncStorage.js';
import { SyncStorage } from '../types/SyncStorage.js';
import { isDefined } from '../utilities/isDefined.js';
import { isFunction } from '../utilities/isFunction.js';
import { isPromise } from '../utilities/isPromise.js';
import { storeValue } from '../utilities/storeValue.js';

// -----------------------------
// OBSERVABLE PROPERTY DECORATOR
// -----------------------------

type GetterDescriptor = () => void;
type SetterDescriptor = () => void;

/**
 * Patch the set function of an ObservableProperty to save the property value into storage when the set function is called.
 * 
 * @param storage - The storage mechanism to save the value in.
 * @param key - The key to save the value under.
 * @param observable - The observable property to patch.
 * 
 * @returns Nothing.
 */
function patchObservablePropertySet<T>(storage: SyncStorage | AsyncStorage, key: string, observable: ObservableProperty<T>): void {

	// Prevent the ObservableProperty.set function from being patch if it is already patched.

	if (Reflect.has(observable, '_state_set_patched')) {
		return;
	}

	// Get the property value get and set functions.
	const observablePrototype: unknown = Object.getPrototypeOf(observable);

	const propertyGetFunction: GetterDescriptor = Object.getOwnPropertyDescriptor(observablePrototype, 'get')?.value as GetterDescriptor;
	const propertySetFunction: SetterDescriptor = Object.getOwnPropertyDescriptor(observablePrototype, 'set')?.value as SetterDescriptor;

	// Override the ObservableProperty.set function to save the property value into storage when the set function is called.
	// Note: *this* is only available in shorthand functions, thus disabling the eslint rule. See https://stackoverflow.com/a/53767500
	Object.defineProperty(observable, 'set', { // eslint-disable-line object-shorthand
		// kind: 'method',
		// placement: 'own',
		value(...args: unknown[]) {

			// Call the original ObservableProperty.set function to set the value.
			propertySetFunction.apply(this, args as []);

			// Get the new property value in serializable form, i.e. not a function.
			let newValue: unknown = args[0];

			if (isFunction(newValue)) {
				newValue = propertyGetFunction.apply(this);
			}

			// Save the new property value in storage.
			storeValue(storage, key, newValue);
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
 * Property decorator saves the value of a property into storage whenever the property value changes.
 * 
 * Support is provided for both synchronous and asynchronous storage mechanisms, including:
 *   1) LocalStorage
 *   2) SessionStorage
 *   3) custom storage implementations based of the SyncStorage or AsyncStorage classes.
 * 
 * The decorator can be used in any of the following decorator implementations:
 *   1) Typescript (experimentalDecorators: true)
 *   2) Babel Legacy (version: "legacy"), and
 *   3) Babel Standard (version: "2018-09")
 * 
 * @param args - The decorator arguments.
 * - storage: The storage mechanism to write property value changes to.
 * - key: The storage key to write property values under.
 * 
 * ```js
 * import { ObservableProperty } from '@capitec/omni-state';
 * 
 * class AppState {
 * 
 *   @state({ storage: SessionStorage, key: 'my-property' })
 *   myProperty = 'Hello World';
 * 
 *   @state({ storage: LocalStorage, key: 'settings' })
 *   appSettings = new ObservableProperty();
 * }
 * ```
 * 
 * @returns The decorator property descriptor (Babel Standard) or nothing (TypeScript and Babel Legacy).
 */
export function stateExperimental({ storage, key }: {
	storage: SyncStorage | AsyncStorage,
	key: string
}): (target: any, propertyKey: string) => void {

	return function <T>(target: any, propertyKey: PropertyKey): void {

		// Initialize the default property value.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		let propertyValue = target.value as T | undefined;

		// Patch the property to sync from and to storage when it's value changes.
		const storageValue = storage.get<T>(key);

		if (isPromise(storageValue)) {

			// When the storage system is async, complete the patching operation as an async task.
			StateManager.enqueue(key, Promise.resolve(storageValue).then((value) => {

				// Restore the property value from storage, if no initializer was provided and a value is available in storage.
				if (!isDefined(propertyValue) || (propertyValue instanceof ObservableProperty && !propertyValue.exists())) { // eslint-disable-line no-extra-parens

					if (isDefined(storageValue)) {

						// Parse the value set in storage using the provided encoder.
						const decodedValue = value as T;

						// Set the decoded storage value as the initial property value.
						if (propertyValue instanceof ObservableProperty) {
							propertyValue.set(decodedValue);
						} else {
							propertyValue = decodedValue;
						}
					}
				}

				// Patch the property to save value changes into storage.
				if (propertyValue instanceof ObservableProperty) {

					// If the property is a ObservableProperty type, then patch the ObservableProperty.set function to store the property value when the set function is called.
					patchObservablePropertySet(storage, key, propertyValue);

				} else {

					// If the property is any other type, then just set the property value in storage directly.
					storeValue(storage, key, propertyValue);
				}

				// Clean up, by removing the async operation from the read queue.
				StateManager.dequeue(key);

				// Return the initialized property value.
				return propertyValue;
			}));

		} else {

			// Parse the value set in storage using the provided encoder.
			const decodedValue = storageValue;

			// Set the decoded storage value as the initial property value.
			if (propertyValue instanceof ObservableProperty) {
				propertyValue.set(decodedValue);
			} else {
				propertyValue = decodedValue as T | undefined;
			}

			// Patch the property to save value changes into storage.
			if (propertyValue instanceof ObservableProperty) {

				// If the property is a ObservableProperty type, then patch the ObservableProperty.set function to store the property value when the set function is called.
				patchObservablePropertySet(storage, key, propertyValue);

			} else {

				// If the property is any other type, then just set the property value in storage directly.
				storeValue(storage, key, propertyValue);
			}
		}

		// Create the new property descriptor template that patches state behavior onto the property.
		const get = function (): unknown {
			return propertyValue;
		};

		const set = function (value: T | undefined): void {

			// Save the new property value.
			propertyValue = value;

			// Patch the property to save value changes into storage.
			if (!isDefined(propertyValue)) {

				// Clear the value in storage if the property value is not set.
				storeValue(storage, key, null);

			} else if (propertyValue instanceof ObservableProperty) {

				// If the property is a ObservableProperty type, then patch the ObservableProperty.set function to store the property value when the set function is called.
				patchObservablePropertySet(storage, key, propertyValue);

			} else {

				// If the property is any other type, then just set the property value in storage directly.
				storeValue(storage, key, propertyValue);
			}
		};

		const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);

		if (!descriptor) {

			Object.defineProperty(target, propertyKey, {
				get,
				set,
				enumerable: true,
				configurable: true,
			});

		} else if (descriptor && descriptor.configurable) {

			Object.defineProperty(target, propertyKey, { ...descriptor, get, set });
		}
	};
}