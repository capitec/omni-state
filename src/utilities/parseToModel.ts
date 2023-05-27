import { ModelBase } from '../ModelBase.js';
import { deepCopy } from './deepCopy.js';

/**
 * Parses a given object to an immutable model class instance of the object.
 * 
 * @param value - The value to parse to a model.
 * @param model - The model type to parse the value to.
 * 
 * @returns The parse model class.
 */
export function parseToModel<T>(value: any, model: typeof ModelBase | undefined): T | undefined { // eslint-disable-line @typescript-eslint/no-explicit-any

	// Parse the object to a model if the property is a strongly typed data model.
	if (model?.parse) {
		return model.parse(deepCopy(value)) as T;
	}

	// Otherwise just return an immutable copy of the object.
	return deepCopy(value) as T;
}