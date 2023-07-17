/**
 * Determine if a given value is a promise.
 * 
 * @param value - The value to check.
 * 
 * @returns True if the value is a promise, otherwise false.
 */
export function isPromise(value: any): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any

	return value && typeof value.then === 'function'; // eslint-disable-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
}