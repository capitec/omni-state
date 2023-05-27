/**
 * Base class for strongly typed runtime data models.
 */
export class ModelBase {

	/**
	 * Initializes the model.
	 * 
	 * @param _options - Parameters to initialize the model with.
	 */
	constructor(_options?: any) { // eslint-disable-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any

		// Do nothing!
	}

	/**
	 * Parses a given object to an instance of the model.
	 * 
	 * @param obj - The object to parse.
	 * 
	 * @returns The new instance of the model, or null if an invalid object was provided.
	 */
	static parse(obj: any): ModelBase | undefined { // eslint-disable-line @typescript-eslint/no-explicit-any

		if (!obj) {
			return undefined;
		}

		return new this(obj);
	}

	/**
	 * Parses a given array of objects to a list of instances of the model.
	 * 
	 * @param arr - The array of objects to parse.
	 * 
	 * @returns The list of instances of the model, or null if an invalid array was provided.
	 */
	static parseAll(arr: any[]): ModelBase[] | undefined { // eslint-disable-line @typescript-eslint/no-explicit-any

		if (!arr) {
			return undefined;
		}

		const result: ModelBase[] = [];

		for (const obj of arr) {

			const model = this.parse(obj);

			if(model) {
				result.push(model);
			}
		}

		return result;
	}
}