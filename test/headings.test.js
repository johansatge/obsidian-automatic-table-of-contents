const { getMarkdownFromHeadings, parseOptionsFromSourceText } = require('../main.js')

const testStandardHeadings = [
  { heading: 'Title 1 level 1', level: 1 },
  { heading: 'Title 1 level 2', level: 2 },
  { heading: 'Title 1 level 3', level: 3 },
  { heading: '', level: 3 },
  { heading: 'Title 2 level 1', level: 1 },
  { heading: 'Title 3 level 1', level: 1 },
  { heading: 'Title 3 level 2', level: 2 },
]

const testHeadingsWithoutFirstLevel = [
  { heading: 'Title 1 level 2', level: 2 },
  { heading: 'Title 1 level 3', level: 3 },
  { heading: 'Title 1 level 4', level: 4 },
  { heading: 'Title 2 level 2', level: 2 },
  { heading: 'Title 3 level 2', level: 2 },
  { heading: 'Title 3 level 3', level: 3 },
]

const testHeadingsWithSpecialChars = [
  {
    heading:
      'Title 1 `level 1` {with special chars}, **bold**, _italic_, #a-tag, ==highlighted== and ~~strikethrough~~ text',
    level: 1,
  },
  { heading: 'Title 1 level 2 <em style="color: black">with HTML</em>', level: 2 },
  {
    heading: 'Title 1 level 2 [[wikilink1]] [[wikilink2|wikitext2]] [mdlink](https://mdurl)',
    level: 2,
  },
  { heading: 'Title 1 level 2 [[malformedlink a pi|pe | and [other chars]', level: 2 },
]

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

  test('Returns indented list with links', () => {
    const options = parseOptionsFromSourceText('')
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
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

  test('Returns indented list with links if no first level', () => {
    const options = parseOptionsFromSourceText('')
    const md = getMarkdownFromHeadings(testHeadingsWithoutFirstLevel, options)
    const expectedMd = sanitizeMd(`
- [[#Title 1 level 2|Title 1 level 2]]
  - [[#Title 1 level 3|Title 1 level 3]]
    - [[#Title 1 level 4|Title 1 level 4]]
- [[#Title 2 level 2|Title 2 level 2]]
- [[#Title 3 level 2|Title 3 level 2]]
  - [[#Title 3 level 3|Title 3 level 3]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented ordered list with links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'nestedOrderedList'
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
1. [[#Title 1 level 1|Title 1 level 1]]
  1. [[#Title 1 level 2|Title 1 level 2]]
    1. [[#Title 1 level 3|Title 1 level 3]]
1. [[#Title 2 level 1|Title 2 level 1]]
1. [[#Title 3 level 1|Title 3 level 1]]
  1. [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented list with min level', () => {
    const options = parseOptionsFromSourceText('')
    options.minLevel = 2
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
- [[#Title 1 level 2|Title 1 level 2]]
  - [[#Title 1 level 3|Title 1 level 3]]
- [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented list with max level', () => {
    const options = parseOptionsFromSourceText('')
    options.maxLevel = 2
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
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
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
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

  test('Returns indented list with title', () => {
    const options = parseOptionsFromSourceText('')
    options.title = '# My TOC'
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
# My TOC
- [[#Title 1 level 1|Title 1 level 1]]
  - [[#Title 1 level 2|Title 1 level 2]]
    - [[#Title 1 level 3|Title 1 level 3]]
- [[#Title 2 level 1|Title 2 level 1]]
- [[#Title 3 level 1|Title 3 level 1]]
  - [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented list with sanitized links from special chars', () => {
    const options = parseOptionsFromSourceText('')
    const md = getMarkdownFromHeadings(testHeadingsWithSpecialChars, options)
    const expectedMd = sanitizeMd(`
- [[#Title 1 \`level 1\` {with special chars}, **bold**, _italic_, a-tag, ==highlighted== and ~~strikethrough~~ text|Title 1 level 1 {with special chars}, bold, italic, #a-tag, highlighted and strikethrough text]]
  - [[#Title 1 level 2 <em style="color: black">with HTML</em>|Title 1 level 2 <em style="color: black">with HTML</em>]]
  - [[#Title 1 level 2 wikilink1 wikilink2 wikitext2 [mdlink](https://mdurl)|Title 1 level 2 wikilink1 wikitext2 mdlink]]
  - [[#Title 1 level 2 malformedlink a pi pe and [other chars]|Title 1 level 2 malformedlink a pi-pe - and [other chars]]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented list without links from special chars', () => {
    const options = parseOptionsFromSourceText('')
    options.includeLinks = false
    const md = getMarkdownFromHeadings(testHeadingsWithSpecialChars, options)
    const expectedMd = sanitizeMd(`
- Title 1 \`level 1\` {with special chars}, **bold**, _italic_, #a-tag, ==highlighted== and ~~strikethrough~~ text
  - Title 1 level 2 <em style="color: black">with HTML</em>
  - Title 1 level 2 [[wikilink1]] [[wikilink2|wikitext2]] [mdlink](https://mdurl)
  - Title 1 level 2 [[malformedlink a pi|pe | and [other chars]
`)
    expect(md).toEqual(expectedMd)
  })

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

function sanitizeMd(md) {
  return md.replaceAll('  ', '\t').replace(/^\n/, '').replace(/\n$/, '')
}
