const postcss = require('postcss');

const plugin = require('./');

async function run (input, output, opts = { }) {
  let result = await postcss([plugin(opts)]).process(input, { from: 'example.css' })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}



it('normal transform', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 10px;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 0.5rem;
        }
      }`, { propList: ['padding'], rootValue: 20})
})

it('no options', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (max-width: 900px) {
        .mobile {
          font: 16px;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (max-width: 900px) {
        .mobile {
          font: 1rem;
        }
      }`)
})

it('transform media param', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 10px;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (min-width: 90rem) {
        .mobile {
          padding: 1rem;
        }
      }`,
      {
        propList: ['padding'],
        rootValue: 10,
        mediaQuery: true
      })
})

it('not transform media param in non-px format', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (max-width: 10rem) {
        .mobile {
          padding: 10px;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (max-width: 10rem) {
        .mobile {
          padding: 10px;
        }
      }`,
      {
        propList: ['padding'],
        rootValue: 10,
        mediaQuery: true
      })
})

it('test exclude option in string format', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 10px;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 10px;
        }
      }`,
      {
        exclude: 'example.css',
        rootValue: 10
      })
})

it('test exclude option in func format', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 10px;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 10px;
        }
      }`,
      {
        exclude: function (file) {
          return file.indexOf('example.css') !== -1
        },
        rootValue: 10
      })
})

it('not transfrom if rem unit already exist', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 20px;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 2rem;
        }
      }`,
      {
        rootValue: 10,
        propList: ['*']
      })
})

it('set replace option', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 20px;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 20px;
          padding: 2rem;
        }
      }`,
      {
        rootValue: 10,
        propList: ['*'],
        replace: false
      })
})

it('rem unit already exists', async () => {
  await run(
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 20px;
          padding: 2rem;
        }
      }`,
    `.pc { padding: 10px };
      @media screen and (min-width: 900px) {
        .mobile {
          padding: 20px;
          padding: 2rem;
        }
      }`,
      {
        rootValue: 10,
        propList: ['*'],
        replace: false
      })
})

describe("rootValue", function() {
  it("should replace using different root values with different files", async function() {
    const css1 = " @media screen and (min-width: 900px) {.rule { font-size: 15px }}";
    const css2 = " @media screen and (min-width: 900px) {.rule { font-size: 20px }}";
    const expected = " @media screen and (min-width: 900px) {.rule { font-size: 1rem }}";
    const options = {
      rootValue: function(input) {
        if (input.from.indexOf("basic.css") !== -1) {
          return 15;
        }
        return 20;
      }
    };
    const {css: processed1} = await postcss([plugin(options)]).process(css1, {
      from: "/tmp/basic.css"
    });
    const {css: processed2} = await postcss([plugin(options)]).process(css2, {
      from: "/tmp/whatever.css"
    });

    expect(processed1).toBe(expected);
    expect(processed2).toBe(expected);
  });
})

describe('blacklistedSelector', () => {
  it("should ignore selectors with string type in the selector black list", async () => {
    var rules = "@media screen and (min-width: 900px) {.rule { font-size: 15px } .rule2 { font-size: 15px }}";
    var expected = "@media screen and (min-width: 900px) {.rule { font-size: 0.9375rem } .rule2 { font-size: 15px }}";
    var options = {
      selectorBlackList: [".rule2"]
    };
    var {css: processed} = await postcss([plugin(options)]).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  });
  it('should ignore selectors with regexp type in the selector black list', async () => {
    var rules = "@media screen and (min-width: 900px) {.rule { font-size: 15px } .rule2 { font-size: 15px }}";
    var expected = "@media screen and (min-width: 900px) {.rule { font-size: 0.9375rem } .rule2 { font-size: 15px }}";
    var options = {
      selectorBlackList: [/\.rule2/]
    };
    var {css: processed} = await postcss([plugin(options)]).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  })
})

describe('createPxReplace', () => {
  it('should not replace values in `url()`', async () => {
    var options = {
      propList: ["*"]
    };
    var rules = "@media screen and (min-width: 900px) {.rule { background: url(16px.jpg); font-size: 16px; }}";
    var expected = "@media screen and (min-width: 900px) {.rule { background: url(16px.jpg); font-size: 1rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  })
})

describe("minPixelValue", function() {
  it("should not replace values below minPixelValue", async function() {
    var options = {
      propList: ['*'],
      minPixelValue: 2
    };
    var rules =
      "@media screen and (min-width: 900px) {.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { border: 1px solid #000; font-size: 1rem; margin: 1px 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  });
});

describe('legacy option', () => {
  it('should not convert when option is `non-object` type', async () => {
    var options = ''
    var rules =
      "@media screen and (min-width: 900px) {.rule { font-size: 16px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { font-size: 1rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  })
  it('should set `propList` value of ["*"] and del correspending option when set  `propWhiteList` legacy option value of `[]`', async () => {
    var options = {
      propWhiteList: []
    };
    var rules =
      "@media screen and (min-width: 900px) {.rule { font-size: 16px; margin: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { font-size: 1rem; margin: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  })

  it('should set `propList` value of ["*"] and del correspending option when set `prop_white_list` legacy option value of `[]`', async () => {
    var options = {
      prop_white_list: []
    };
    var rules =
      "@media screen and (min-width: 900px) {.rule { font-size: 16px; margin: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { font-size: 1rem; margin: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  })

  it('should convert `prop_white_list` to `propList` with same value', async () => {
    var options = {
      prop_white_list: ['*']
    };
    var rules =
      "@media screen and (min-width: 900px) {.rule { font-size: 16px; margin: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { font-size: 1rem; margin: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  })
})

describe('propList match rule', () => {
  it('should find "exact" matches from propList', async function() {
    var propList = [
      "font-size",
      "margin",
      "!padding",
      "*border*",
      "*",
      "*y"
    ];
    var options = {
      propList
    };
    var rules =
      "@media screen and (min-width: 900px) {.rule { font-size: 16px; margin: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { font-size: 1rem; margin: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  });

  it('should find "contain" matches from propList and reduce to string', async function() {
    var propList = [
      "*margin*",
      "!padding",
      "*border*",
      "*y",
    ];
    var options = {
      propList
    };
    var rules =
      "@media screen and (min-width: 900px) {.rule {  margin: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule {  margin: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  });

  it('should find "start" matches from propList and reduce to string', async function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "border*",
      "*",
      "*y"
    ];
    var options = {
      propList
    };
    var rules =
      "@media screen and (min-width: 900px) {.rule { font-size: 16px; margin: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { font-size: 1rem; margin: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  });

  it('should find "startWith" matches from propList and reduce to string', async function() {
    var propList = [
      "border*"
    ];
    var options = {
      propList
    };
    var rules =
      "@media screen and (min-width: 900px) {.rule { border: 16px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { border: 1rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  });

  it('should find "not contain" matches from propList and reduce to string', async function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "border*",
      "*",
      "*y",
      "!*font*"
    ];
    var options = {
      propList
    };
    var rules =
    "@media screen and (min-width: 900px) {.rule { margin: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { margin: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  });

  it('should find "not start" matches from propList and reduce to string', async function() {
    var propList = [
      "!margin*",
      '*'
    ];
    var options = {
      propList
    };
    var rules =
    "@media screen and (min-width: 900px) {.rule { right: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { right: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
  });

  it('should find "end" matches from propList and reduce to string', async function() {
    var propList = [
      "*margin",
    ];
    var options = {
      propList
    };
    var rules =
    "@media screen and (min-width: 900px) {.rule { margin: 10px; }}";
    var expected =
      "@media screen and (min-width: 900px) {.rule { margin: 0.625rem; }}";
    var {css: processed} = await postcss(plugin(options)).process(rules, {
      from: "/tmp/basic.css"
    });
    expect(processed).toBe(expected);
})

it('should find "not end" matches from propList and reduce to string', async function() {
  var propList = [
    "!*margin",
    '*'
  ];
  var options = {
    propList
  };
  var rules =
  "@media screen and (min-width: 900px) {.rule { margin-right: 10px; }}";
  var expected =
    "@media screen and (min-width: 900px) {.rule { margin-right: 0.625rem; }}";
  var {css: processed} = await postcss(plugin(options)).process(rules, {
    from: "/tmp/basic.css"
  });
  expect(processed).toBe(expected);
})
})
