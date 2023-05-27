import { AsyncStorage } from './types/AsyncStorage';

export class TestStore implements AsyncStorage {

	get length(): number {

		return 0;
	}

	getItem<T>(key: string): Promise<T> {

		return Promise.resolve('' as T);
	}

	setItem<T>(key: string, value: T): Promise<void> {

		return Promise.resolve();
	}

	removeItem(key: string): Promise<void> {

		return Promise.resolve();
	}

	clear(): Promise<void> {

		return Promise.resolve();
	}

	key(index: number): string {

		return '';
	}

	keys(): Promise<string[]> {

		return Promise.resolve([]);
	}
}