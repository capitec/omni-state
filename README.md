<p align="center"><br><img src="./docs/logos/omni.png" width="128" height="128"/></p>

<h3 align="center">Omni State</h3>
<p align="center"><strong><code>@capitec/omni-state</code></strong></p>
<p align="center">Simple web app state and storage management</p>

<br />

<p align="center">
	<a href="https://npmcharts.com/compare/@capitec/omni-state?minimal=true"><img alt="Downloads per week" src="https://img.shields.io/npm/dw/@capitec/omni-state.svg" height="20"/></a>
	<a href="https://www.npmjs.com/package/@capitec/omni-state"><img alt="NPM Version" src="https://img.shields.io/npm/v/@capitec/omni-state.svg" height="20"/></a>
	<a href="https://github.com/capitec/omni-state/actions/workflows/build.yml"><img alt="GitHub Build" src="https://github.com/capitec/omni-state/actions/workflows/build.yml/badge.svg" height="20"/></a>
	<a href="https://github.com/capitec/omni-state/blob/develop/LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/capitec/omni-state" height="20"/></a>
</p>
<p align="center">
	<a href="https://capitec.github.io/open-source/?repo=omni-state"><img alt="Docs" src="https://img.shields.io/static/v1?label=docs&message=capitec.github.io/open-source&color=blue&style=flat-square" /></a>
</p>

<br/>

<p align="center">
	[<a href="#introduction">Introduction</a>]
	[<a href="#usage">Usage</a>]
	[<a href="#contributors">Contributors</a>]
	[<a href="#license">License</a>]
</p>

<br>

---

<br>

## Introduction

Omni State is a collection of utilities that makes it simple to manage the local state and data storage in web applications. The library is lightweight and comes with zero runtime dependencies, minimizing bloat to your project.

Core features of the library include:
- **ObservableProperty** - Provides an observable property that enables immutable editing of state using a draft before persisting model.
- **StatefulProperty** - An extension of the ObservableProperty that persists the state data to a provided store when set, e.g. local storage, session storage, or a custom store.
- **Storage decorator** - A decorator that allows you to annotate any class property to persist its value to storage when set.
- **Local & Session Data Stores** - Default implementation are provided to persist data to the browse local storage and session storage.
- **Custom Data Stores** - Custom data stores can be created by implementing either the SyncStorage or AsyncStorage interfaces, enabling you to e.g. persist data online when a property is set.

<br>

## Usage

1️⃣ &nbsp; Install the library in your project.

```bash
npm install @capitec/omni-state
```

2️⃣ &nbsp; Use any of the example property patterns below where you implement state management in your app. Here we provide an example using global singleton to manage the state of an app.

```ts
// e.g. my-app/AppState.ts

import { LocalStorage, ObservableProperty, SessionStorage, StatefulProperty, stateExperimental } from '@capitec/omni-state';
import { MyCustomStore } from './stores/MyCustomStore';

export type Person = {
    firstName: string;
    lastName: string;
}

export class AppState {

    // OBSERVABLE PROPERTY

    // A simple in-memory property that can be observed for changes, e.g.:
    simpleObservable = new ObservableProperty<Person>();

    // STATEFUL PROPERTY

    // An observable property that is persisted to SessionStorage when set, e.g.:
    statefulSessionObservable = new StatefulProperty({ storage: SessionStorage, key: 'statefulSessionObservable' });

    // An observable property that is persisted to LocalStorage when set, e.g.:
    statefulLocalObservable = new StatefulProperty({ storage: LocalStorage, key: 'statefulLocalObservable' });

    // An observable property that is persisted to a custom async store when set, e.g.:
    statefulCustomObservable = new StatefulProperty({ storage: MyCustomStore, key: 'statefulCustomObservable' });

    // STATE DECORATOR - using Typescript "experimentalDecorators": true

    // A simple property that is persisted to SessionStorage when set, e.g.:
    @stateExperimental({ storage: SessionStorage, key: 'decoratorSession' })
    decoratorSession?: string;

    // A simple property that is persisted to LocalStorage when set, e.g.:
    @stateExperimental({ storage: LocalStorage, key: 'decoratorSession' })
    decoratorLocal?: string;

    // A simple property that is persisted to a custom async store when set, e.g.:
    @stateExperimental({ storage: MyCustomStore, key: 'decoratorCustom' })
    decoratorCustom?: string;

    // OBSERVABLE PROPERTY + STATE DECORATOR = STATEFUL PROPERTY

    // A simple property that is persisted to SessionStorage when set, e.g.:
    @stateExperimental({ storage: SessionStorage, key: 'observableSession' })
    observableSession = new ObservableProperty<string>();

    // A simple property that is persisted to LocalStorage when set, e.g.:
    @stateExperimental({ storage: LocalStorage, key: 'observableLocal' })
    observableLocal = new ObservableProperty<string>();

    // A simple property that is persisted to a custom async store when set, e.g.:
    @stateExperimental({ storage: MyCustomStore, key: 'observableCustom' })
    observableCustom = new ObservableProperty<string>();

    /**
     * Get an instance of the shared state.
     * 
     * @returns The shared state instance.
     */
    static getInstance() {

        if (!AppState.instance) {
            AppState.instance = new SharedState();
        }

        return AppState.instance;
    }

    /**
     * Initialize App global state, read persisted settings.
     * 
     * Note: Only to be called once by the app entrypoint.
     * 
     * @returns Nothing.
     */
    async init() {

        // Ensure all state properties have been initialized from storage.
        await StateManager.allSettled;
    }
}
```

3️⃣ &nbsp; Make use of any of the below patterns to access and mutate the app state properties. Note both ObservableProperty and StatefulProperty implement the observable pattern, allowing you to .get(), .set(), and .subscribe() to the property. Decorated properties are implemented as standard properties, thus they can be get and set like any other primitive or object.

```ts
// my-app/App.ts

import { AppState } from './AppState';

class App {

    private appState: AppState;

    constructor() {

        this.appState = AppState.getInstance();
    }

    async init(): void {

        // Ensure all app state values are loaded from storage.
        await appState.init();

        // USING OBSERVABLE OR STATEFUL PROPERTIES

        // Initializing an observable (or stateful) property.
        appState.simpleObservable.set({
            firstName: 'Hello',
            lastName: 'World';
        });

        // Subscribing to value changes on an observable (or stateful) property.
        appState.simpleObservable.subscribe(value => {
            console.log(value);
        });

        // Editing specific values on an observable (or stateful) property.
        appState.simpleObservable.set(draft => {
            draft.firstName = 'Test';
        });

        // USING STATE DECORATOR PROPERTIES

        // Setting a decorated property.
        this.decoratorLocal = 'Test';

        // Getting a decorated property
        console.log(this.decoratorLocal);
    }
}

await new App().init();
```

4️⃣ &nbsp; Omni State exposes implementations for [LocalStorage](./src/stores/LocalStorage.ts) and [SessionStorage](./src/stores/SessionStorage.ts) stores. However, you can implement a custom store by creating an implementation of either the [SyncStorage](./src/types/SyncStorage.ts) or [AsyncStorage](./src/types/AsyncStorage.ts) interfaces.

The SyncStorage interface is used to implement the LocalStorage and SessionStorage stores, while the AsyncStorage interface allows you to build a custom storage implementation that can persist data to environments that have to be contacted asynchronously, e.g. saving values to an online service.

```ts
// my-app/stores/MyCustomStore.ts

import { SyncStorage } from '@capitec/omni-state';

/**
 * Simple wrapper around the browser `localStorage` that simplifies storing values across browser sessions.
 * 
 * Values are persisted to storage as JSON strings, and can be read back as typed objects.
 */
class MyCustomStoreImpl implements SyncStorage {

    /**
     * Gets a value from storage for the given key.
     * 
     * @param key - The key under which the value is stored.
     * 
     * @returns The stored value parsed from JSON, or null if not set.
     */
    get<T>(key: string): T | undefined {

        try {

            const result = window.localStorage.getItem(key);

            console.log(`Reading Key: ${key}`, result);

            if (!result) {
                return undefined;
            }

            return JSON.parse(result) as T;

        } catch (err) {

            return undefined;
        }
    }

    /** 
     * Sets a value in storage for the given key.
     * 
     * @param key - The key under which to store the value.
     * @param value - The value to store.
     * 
     * @returns Nothing.
     */
    set(key: string, value: unknown): void {

        console.log(`Writing Key: ${key}`, value);

        window.localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Removes a value from storage for the given key.
     * 
     * @param key - The key of the value to remove.
     * 
     * @returns Nothing.
     */
    remove(key: string): void {

        console.log(`Removing Key: ${key}`);

        window.localStorage.removeItem(key);
    }

    /**
     * Removes all values from storage.
     * 
     * @returns Nothing.
     */
    clear(): void {

        console.log(`Clearing all keys`);

        window.localStorage.clear();
    }

    /**
     * Get the name of the key at a given index.
     * 
     * @param index - The index number to get the key name for.
     * 
     * @returns The name of the key at the index.
     */
    key(index: number): string | undefined {

        return window.localStorage.key(index) || undefined;
    }

    /**
     * Finds a list of all keys in storage.
     * 
     * @returns The list of keys in storage.
     */
    keys(): string[] {

        return Object.keys(window.localStorage);
    }

    /**
     * Get the number of items in storage.
     * 
     * @returns The storage item count.
     */
    size(): number {

        return window.localStorage.length;
    }
}

export const MyCustomStore = new MyCustomStoreImpl();
```

5️⃣ &nbsp; To make use of the experimental decorators, ensure your environment configurations includes the following:

### TypeScript

If using TypeScript, include this in your ```tsconfig.json```:
```json
{
    "experimentalDecorators": true
}
```
### Babel

If using Babel, include this in your ```.babelrc```:
```json
{
    "plugins": [
        [
            "@babel/plugin-proposal-decorators",
            {
                "version": "2018-09",
                "decoratorsBeforeExport": true
            }
        ]
    ]
}
```
### Webpack

If using Webpack, include this in your ```webpack.build.js```:
```js
export default {
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                exclude: /node_modules[\\/](?!(omni-components|omni-router|omni-state)[\\/]).*/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: [
                                ['@babel/transform-runtime'],
                                [
                                    '@babel/plugin-proposal-decorators', {
                                        version: '2018-09',
                                        decoratorsBeforeExport: true
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        ]
    }
};
```

<br>

## Contributors

Made possible by these fantastic people. 💖

See the [`CONTRIBUTING.md`](./CONTRIBUTING.md) guide to get involved.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jn42lm1"><img src="https://avatars2.githubusercontent.com/u/54233338?v=4?s=100" width="100px;" alt="jn42lm1"/><br /><sub><b>jn42lm1</b></sub></a><br /><a href="https://github.com/capitec/omni-state/commits?author=jn42lm1" title="Code">💻</a> <a href="https://github.com/capitec/omni-state/commits?author=jn42lm1" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<br>

## License

Licensed under [MIT](LICENSE)

<br>
<br>
<hr>
<br>
<br>
<br>
<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./docs/logos/capitec-logo-white.svg">
        <img alt="Capitec Logo" src="./docs/logos/capitec-logo-color.svg" height="28">
    </picture>
</p>
<p align="center">We are hiring 🤝 Join us! 🇿🇦</p>
<p align="center">
    <a href="https://www.capitecbank.co.za/about-us/careers">https://www.capitecbank.co.za/about-us/careers</a>
</p>

<br>
<br>