/**
 * Determine if a given value is set, i.e. not null or undefined.
 * 
 * @param value - The value to check.
 * 
 * @returns True if the value is set, otherwise false.
 */
export function isDefined(value?: any): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any

	return value !== null && value !== undefined;
}