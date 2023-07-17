/**
 * Determine if a given value is a function, i.e. not null or undefined.
 * 
 * @param value - The value to check.
 * 
 * @returns True if the value is a function, otherwise false.
 */
export function isFunction(value: any): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any

	return value && typeof value === 'function'; // eslint-disable-line @typescript-eslint/no-unsafe-return
}