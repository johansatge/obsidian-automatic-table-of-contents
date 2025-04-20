const { sanitizeMd, testStandardHeadings, testHeadingsWithoutFirstLevel } = require('./utils.js')
const { getMarkdownFromHeadings } = require('../src/headings.js')
const { parseOptionsFromSourceText } = require('../src/options.js')

describe('First-level headings', () => {
  test('Returns flat first-level list with links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
[[#Title 1 level 1|Title 1 level 1]] | [[#Title 2 level 1|Title 2 level 1]] | [[#Title 3 level 1|Title 3 level 1]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat first-level list without links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.includeLinks = false
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
Title 1 level 1 | Title 2 level 1 | Title 3 level 1
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat list with custom level', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.includeLinks = false
    options.minLevel = 3
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
Title 1 level 3
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat list with default level', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.includeLinks = false
    const md = getMarkdownFromHeadings(testHeadingsWithoutFirstLevel, options)
    const expectedMd = sanitizeMd(`
Title 1 level 2 | Title 2 level 2 | Title 3 level 2
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat list with title', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.title = 'Some title:'
    options.includeLinks = false
    const md = getMarkdownFromHeadings(testHeadingsWithoutFirstLevel, options)
    const expectedMd = sanitizeMd(`
Some title: Title 1 level 2 | Title 2 level 2 | Title 3 level 2
`)
    expect(md).toEqual(expectedMd)
  })
})
