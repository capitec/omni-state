/**
 * Base class for strongly typed runtime data models.
 */
class ModelBase {

	/**
	 * Initializes the model.
	 * 
	 * @param {object} [options] - Parameters to initialize the model with.
	 */
	constructor(options) {

	}

	/**
	 * Parses a given object to an instance of the model.
	 * 
	 * @param {object} obj - The object to parse.
	 * @returns {this} The new instance of the model, or null if an invalid object was provided.
	 */
	static parse(obj) {

		if (!obj) {
			return null;
		}

		return new this(obj);
	}

	/**
	 * Parses a given array of objects to a list of instances of the model.
	 * 
	 * @param {object[]} arr - The array of objects to parse.
	 * @returns {this[]} The list of instances of the model, or null if an invalid array was provided.
	 */
	static parseAll(arr) {

		if (!arr) {
			return null;
		}

		const result = [];

		for (const obj of arr) {
			result.push(this.parse(obj));
		}

		return result;
	}
}

export {
	ModelBase as default,
	ModelBase
};