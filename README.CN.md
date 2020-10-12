# PostCSS Px2rem-media

> 这个项目灵感来自于 [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)

[英文文档](https://github.com/cuth/postcss-pxtorem/README.md)

只对媒体查询块进行px转rem的[PostCSS] 插件，面向移动端适配。这个项目灵感来自于[postcss-pxtorem](https://github.com/cuth/postcss-pxtorem) 并且任何参数可以从此仓库中查找到.这个项目将尽可能得和[postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)  API保持同步。

[PostCSS]: https://github.com/postcss/postcss

```css
// 输入
a { padding: 10px };
@media screen and (min-width: 900px) {
    article {
      padding: 10px;
    }
}
```

```css
// 输出
a { padding: 10px };
@media screen and (min-width: 900px) {
    article {
      padding: 0.625rem;
    }
}
```

## 用法

**步骤 1:**  在你的项目中检查已存在的PostCSS 配置: 在项目根目录中的`postcss.config.js`, 在`package.json`的`"postcss"` 字段中或者打包配置很中的postcss。

如果你没有使用PostCSS,根据[官方文档]添加它并在设置中设置这个插件。

**步骤 2:** 添加插件到插件列表中:

```diff
module.exports = {
  plugins: [
+   require('postcss-px2rem-media'),
    require('autoprefixer')
  ]
}
```

[官方文档]: https://github.com/postcss/postcss#usage
