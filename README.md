# generator-xtext

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]

[npm-image]: https://badge.fury.io/js/generator-xtext.svg
[npm-url]: https://npmjs.org/package/generator-xtext
[travis-image]: https://travis-ci.org/itemis/generator-xtext.svg?branch=master
[travis-url]: https://travis-ci.org/itemis/generator-xtext
[daviddm-image]: https://david-dm.org/itemis/generator-xtext.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/itemis/generator-xtext


## Installation

First, install [Yeoman](http://yeoman.io) and generator-xtext using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/) v6 or higher).

```bash
npm install -g yo
npm install -g generator-xtext
```

Then generate your new project:

```bash
yo xtext
```

## Developers

### Release process

In order to create a release, the version needs to be increased and tagged. This is done easily using `npm version`, for example:

```
npm version minor
```

After the commit and tag is pushed Travis will automatically deploy the tagged version.