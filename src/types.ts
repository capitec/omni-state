/**
 * The subscriber function to call whenever the property value changes.
 * 
 * @param value - The new property value.
 * 
 * @returns Nothing.
 */
export type PropertyChangeHandler = <T>(value: T) => void;

/**
 * The function to call whenever a property value is set, allowing for modification of the current
 * property value instead of overriding it completely.
 * 
 * @callback PropertySetHandler
 * 
 * @param value - The current property value.
 * 
 * @returns Nothing.
 */
export type PropertySetHandler = <T>(value: T) => void;