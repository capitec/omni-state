import { deepCopy } from './deepCopy';

/**
 * Parses a given object to an immutable model class instance of the object.
 * 
 * @param {object} value - The value to parse to a model.
 * @param {ModelBase} model - The model type to parse the value to.
 * 
 * @returns {ModelBase} The parse model class.
 */
function parseToModel(value, model) {

	// Parse the object to a model if the property is a strongly typed data model.
	if (model?.parse) {
		return model.parse(deepCopy(value));
	}

	// Otherwise just return an immutable copy of the object.
	return deepCopy(value);
}

export {
	parseToModel as default,
	parseToModel
};