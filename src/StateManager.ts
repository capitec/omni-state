
// Polyfill Promise.allSettled if if does not exist in the browser.
function patchAllSettled(promises: Promise<unknown>[]): Promise<({ status: string; reason: unknown })[]> {

	return Promise.all(
		promises.map(p => p
			.then(value => ({ status: 'fulfilled', value: value }))
			.catch((reason: unknown) => ({ status: 'rejected', reason: reason }))
		)
	) as Promise<({ status: string; reason: unknown })[]>;
}

// eslint-disable-next-line @typescript-eslint/unbound-method
Promise.allSettled = Promise.allSettled || patchAllSettled;

/**
 * List of asynchronous storage read operations that are running.
 */
const _pendingPromises = new Map<string, Promise<unknown>>();

/**
 * Utility to load and refresh state.
 */
export class StateManager {

	/**
	 * Add a property to the read from state queue.
	 * 
	 * @param key - The property key.
	 * @param value - The loading promise.
	 * 
	 * @returns Nothing.
	 */
	static enqueue(key: string, value: Promise<unknown>): void {

		_pendingPromises.set(key, value);
	}

	/**
	 * Add a property from the read from state queue.
	 * 
	 * @param key - The property key.
	 * 
	 * @returns Nothing.
	 */
	static dequeue(key: string): void {

		_pendingPromises.delete(key);
	}

	/**
	 * Property that can be awaited to guarantee that all `StatefulProperty`'s have been initialized from storage. Required to enable async data stores.
	 * 
	 * @returns Nothing.
	 */
	static get allSettled(): Promise<Map<string, any>> {

		return new Promise((resolve, reject) => {

			const keys = Array.from(_pendingPromises.keys());

			// Wait for all of the pending storage read operations to finalize.
			void Promise.allSettled(Array.from(_pendingPromises.values())).then(outcome => {

				const data = outcome as { status: 'fulfilled' | 'rejected', value: unknown }[];

				// Report the value of each storage property read.
				const result = new Map<string, unknown>();

				for (let i = 0; i < data.length; i++) {
					result.set(keys[i], data[i].value);
				}

				resolve(result);
			});
		});
	}
}