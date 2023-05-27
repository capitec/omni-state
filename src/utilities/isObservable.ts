import { ObservableProperty } from '../ObservableProperty.js';

/**
 * Determine if a given value is an observable.
 * 
 * @param value - The value to check.
 * 
 * @returns True if the value is an observable, otherwise false.
 */
export function isObservable(value: any): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any

	return value instanceof ObservableProperty;
}