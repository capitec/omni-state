<p align="center"><br><img src="./docs/logos/omni.png" width="128" height="128"/></p>

<h3 align="center">Omni State</h3>
<p align="center"><strong><code>@capitec/omni-state</code></strong></p>
<p align="center">Simple patterns to manage your web app state and storage</p>

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
<!--
<p align="center">
	<a href="https://twitter.com/capitecbank"><img src="https://img.shields.io/twitter/follow/capitecbank" /></a>
</p>
-->

<br/>

<p align="center">
	[<a href="#introduction">Introduction</a>]
	[<a href="#usage">Usage</a>]
	[<a href="#example-projects">Example Projects</a>]
	[<a href="#api-reference">API Reference</a>]
	[<a href="#contributors">Contributors</a>]
	[<a href="#license">License</a>]
</p>

<br/>

---

## Introduction

Omni State is a collection of utilities that makes it simple to manage the local state and data storage in web applications. The library is lightweight and comes with zero dependencies, minimizing bloat to your project.

Core features of the library include:
- **Web Components** - The router has been specifically built to route pages built using web components.
- **Lazy Loading** - Web component pages can be lazy loaded using ```import('...')```.
- **Route Guards** - Routes can be protected using guard functions that prevent routing based on your app logic, e.g. check if the user is logged in.
- **Animations** - Pages can be animated in and out of view when routing, e.g. fade, slide, pop, etc.
- **Browser History** - Integrates with the browser history API to push, pop, and replace paths.
- **Mobile Friendly** - Navigating back reverses the route load animation, allowing mobile-like user experiences e.g. sliding routes in and out.

Features:
- Observable property
- Stateful property
- Storage decorator
- Async storage support
- Support strongly typed runtime data models
- Immutable state, edit draft before persisting

## Usage

Install the library:

```bash
npm install @capitec/omni-state
```

Then, simply make use of any of the below patterns inside of your app's global state class to create individual properties for your app state.

```js
// e.g. my-app/AppState.js

import { ObservableProperty, StatefulProperty, state } from '@capitec/omni-state';
import { UserSession } from './models/UserSession';
import { KeyStore } from './stores/KeyStore';

class AppState {

    // State decorator on standard object, targeting a synchronous store.
    @state({ storage: localStorage, key: 'CapacitorStorage.userSession' })
    userSession;

    // State decorator on standard object, targetting an asynchronous store.
    @state({ storage: LocalStorage, key: 'userSession', encoder: null })
    userSession;

    // State decorator on an observable property, targeting a synchronous store.
    @state({ storage: localStorage, key: 'CapacitorStorage.userSession' })
    userSession = new ObservableProperty({ model: UserSession });

    // State decorator on an observable property, targetting an asynchronous store.
    @state({
		storage: LocalStorage,
		key: 'userSession',
		encoder: null
	})
    userSession = new ObservableProperty({ model: UserSession });

    // Stateful property, targeting a synchronous store.
    userSession = new StatefulProperty({
		storage: localStorage,
		key: 'CapacitorStorage.userSession',
		model: UserSession
	});

    // Stateful property, targetting an asynchronous store.
    userSession = new StatefulProperty({
		storage: LocalStorage,
		key: 'userSession',
		encoder: null,
		model: UserSession
	});

    static getInstance() {

        return this.instance || (this.instance = new SharedState());
    }

    async init() {

        // Ensure all state properties have been initialized from storage.
        await state.allSettled;
    }
}

export {
    AppState as default,
    AppState
}

```

In your app, make use of any of the below patterns to access and mutate the app state properties.

```js
// my-app/App.js

import { AppState } from './AppState';

class App {

    constructor() {

        const appState = AppState.getInstance();

        appState.userSession.set(draft => {

            draft.firstName = 'Hello';
            draft.lastName = 'World';
        });
    }
}
```
## Example Projects

Starter projects are available in the [examples directory](./examples) for the following decorator standards:

<div align="center">
	<table>
		<tbody>
			<tr>
				<td align="center">
					<a href="./examples/vanilla">
						<img src="./docs/logos/typescript.png" width="128" height="128" alt="Vanilla JS" />
						<br />
						<p><b>TypeScript</b><br><sub>Experimental Decorators</sub</p>
					</a>
				</td>
				<td align="center">
					<a href="./examples/lit">
						<img src="./docs/logos/babel.png" width="128" height="128" alt="Lit" />
						<br />
						<p><b>Babel</b><br><sub>Lecacy Decorators</sub</p>
					</a>
				</td>
				<td align="center">
					<a href="./examples/angular">
						<img src="./docs/logos/babel.png" width="128" height="128" alt="Lit" />
						<br />
						<p><b>Babel</b><br><sub>Standard (2018-09)</sub</p>
					</a>
				</td>
			</tr>
		</tbody>
	</table>
</div>

## API Reference

### ObservableProperty

todo

### StatefulProperty

todo

### ModelBase

todo

### decorators/state

todo

### utilities/deepCopy

todo

### utilities/deepFreeze

todo

### utilities/isDefined

todo

### utilities/isFunction

todo

### utilities/isObservable

todo

### utilities/isPromise

todo

### utilities/parseToModel

todo

### utilities/storeValue

todo

## Contributors

Made possible by these fantastic people. 💖

See the [`CONTRIBUTING.md`](./CONTRIBUTING.md) guide to get involved.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jn42lm1"><img src="https://avatars2.githubusercontent.com/u/54233338?v=4?s=100" width="100px;" alt="jn42lm1"/><br /><sub><b>jn42lm1</b></sub></a><br /><a href="https://github.com/capitec/omni-router/commits?author=jn42lm1" title="Code">💻</a> <a href="https://github.com/capitec/omni-router/commits?author=jn42lm1" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

Licensed under [MIT](LICENSE)