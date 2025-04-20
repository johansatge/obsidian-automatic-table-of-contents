const { getMarkdownFromHeadings } = require('../src/headings.js')
const { parseOptionsFromSourceText } = require('../src/options.js')

describe('Headings', () => {
  test('Returns default message if no headings', () => {
    const options = parseOptionsFromSourceText('')
    const md = getMarkdownFromHeadings([], options)
    expect(md).toContain('no headings found')
  })

  test('Returns empty TOC if no headings & option enabled', () => {
    const options = parseOptionsFromSourceText('')
    options.hideWhenEmpty = true
    const md = getMarkdownFromHeadings([], options)
    expect(md).toEqual('')
  })
})
