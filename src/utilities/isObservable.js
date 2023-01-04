import ObservableProperty from '../ObservableProperty';

/**
 * Determine if a given value is an observable.
 * 
 * @param {boolean} value - The value to check.
 * 
 * @returns {boolean} True if the value is an observable, otherwise false.
 */
function isObservable(value) {

	return value instanceof ObservableProperty;
}

export {
	isObservable as default,
	isObservable
};