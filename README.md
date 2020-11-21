# PostCSS Px2rem-media

> This project is inspired from [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)

[![Build Status](https://travis-ci.com/enhezzz/postcss-px2rem-media.svg?branch=main)](https://travis-ci.com/enhezzz/postcss-px2rem-media)
[![Coverage Status](https://coveralls.io/repos/github/enhezzz/postcss-px2rem-media/badge.svg?branch=main)](https://coveralls.io/github/enhezzz/postcss-px2rem-media?branch=main)
[![npm version](https://badge.fury.io/js/postcss-px2rem-media.svg)](https://badge.fury.io/js/postcss-px2rem-media)

[中文文档](README.CN.md)

[PostCSS] plugin for transforming px to rem only in media query block is target to adapt mobile ending. This project is insipred from [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem) and any options can found in the repo.As much as posible, this project is kept in sync with  [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)  API.

[PostCSS]: https://github.com/postcss/postcss

```css
// input
a { padding: 10px };
@media screen and (min-width: 900px) {
    article {
      padding: 10px;
    }
}
```

```css
// output
a { padding: 10px };
@media screen and (min-width: 900px) {
    article {
      padding: 0.625rem;
    }
}
```

## Usage

**Step 1:** Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 2:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-px2rem-media'),
    require('autoprefixer')
  ]
}
```

[official docs]: https://github.com/postcss/postcss#usage
