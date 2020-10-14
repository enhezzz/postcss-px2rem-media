const postcss = require('postcss')

const plugin = require('./')

async function run (input, output, opts = { }) {
  let result = await postcss([plugin(opts)]).process(input, { from: 'example.css' })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}



it('transform px to rem only in media block', async () => {
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
