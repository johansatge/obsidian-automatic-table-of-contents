const {
  getMarkdownFromHeadings,
  parseOptionsFromSourceText,
} = require('../main.js')

const testHeadings = [
  { heading: 'Title 1 level 1', level: 1 },
  { heading: 'Title 1 level 2', level: 2 },
  { heading: 'Title 1 level 3', level: 3 },
  { heading: 'Title 2 level 1', level: 1 },
  { heading: 'Title 3 level 1', level: 1 },
  { heading: 'Title 3 level 2', level: 2 },
]

describe('Headings', () => {
  test('Returns indented list with links', () => {
    const options = parseOptionsFromSourceText('')
    const md = getMarkdownFromHeadings(testHeadings, options)
    const expectedMd = sanitizeMd(`
- [[#Title 1 level 1|Title 1 level 1]]
  - [[#Title 1 level 2|Title 1 level 2]]
    - [[#Title 1 level 3|Title 1 level 3]]
- [[#Title 2 level 1|Title 2 level 1]]
- [[#Title 3 level 1|Title 3 level 1]]
  - [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented list with max level', () => {
    const options = parseOptionsFromSourceText('')
    options.maxLevel = 2
    const md = getMarkdownFromHeadings(testHeadings, options)
    const expectedMd = sanitizeMd(`
- [[#Title 1 level 1|Title 1 level 1]]
  - [[#Title 1 level 2|Title 1 level 2]]
- [[#Title 2 level 1|Title 2 level 1]]
- [[#Title 3 level 1|Title 3 level 1]]
  - [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented list without links', () => {
    const options = parseOptionsFromSourceText('')
    options.includeLinks = false
    const md = getMarkdownFromHeadings(testHeadings, options)
    const expectedMd = sanitizeMd(`
- Title 1 level 1
  - Title 1 level 2
    - Title 1 level 3
- Title 2 level 1
- Title 3 level 1
  - Title 3 level 2
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat first-level list with links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    const md = getMarkdownFromHeadings(testHeadings, options)
    const expectedMd = sanitizeMd(`
[[#Title 1 level 1|Title 1 level 1]] | [[#Title 2 level 1|Title 2 level 1]] | [[#Title 3 level 1|Title 3 level 1]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat first-level list without links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.includeLinks = false
    const md = getMarkdownFromHeadings(testHeadings, options)
    const expectedMd = sanitizeMd(`
Title 1 level 1 | Title 2 level 1 | Title 3 level 1
`)
    expect(md).toEqual(expectedMd)
  })
})

function sanitizeMd(md) {
  return md.replaceAll('  ', '\t').replace(/^\n/, '').replace(/\n$/, '')
}