const {
  sanitizeMd,
  testStandardHeadings,
  testHeadingsWithoutFirstLevel,
  testHeadingsWithSpecialChars,
} = require('./utils.js')
const { getMarkdownFromHeadings } = require('../src/headings.js')
const { parseOptionsFromSourceText } = require('../src/options.js')

describe('Nested headings', () => {
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

  test('Returns indented detailed ordered list with links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'nestedDetailedOrderedList'
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
1. [[#Title 1 level 1|Title 1 level 1]]
  1.1. [[#Title 1 level 2|Title 1 level 2]]
    1.1.1. [[#Title 1 level 3|Title 1 level 3]]
2. [[#Title 2 level 1|Title 2 level 1]]
3. [[#Title 3 level 1|Title 3 level 1]]
  3.1. [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented detailed ordered list without links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'nestedDetailedOrderedList'
    options.includeLinks = false
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
1. Title 1 level 1
  1.1. Title 1 level 2
    1.1.1. Title 1 level 3
2. Title 2 level 1
3. Title 3 level 1
  3.1. Title 3 level 2
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented detailed ordered list with min level', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'nestedDetailedOrderedList'
    options.minLevel = 2
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
1. [[#Title 1 level 2|Title 1 level 2]]
  1.1. [[#Title 1 level 3|Title 1 level 3]]
2. [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented detailed ordered list with max level', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'nestedDetailedOrderedList'
    options.maxLevel = 2
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
1. [[#Title 1 level 1|Title 1 level 1]]
  1.1. [[#Title 1 level 2|Title 1 level 2]]
2. [[#Title 2 level 1|Title 2 level 1]]
3. [[#Title 3 level 1|Title 3 level 1]]
  3.1. [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented detailed ordered list with title', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'nestedDetailedOrderedList'
    options.title = '## Contents'
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
## Contents
1. [[#Title 1 level 1|Title 1 level 1]]
  1.1. [[#Title 1 level 2|Title 1 level 2]]
    1.1.1. [[#Title 1 level 3|Title 1 level 3]]
2. [[#Title 2 level 1|Title 2 level 1]]
3. [[#Title 3 level 1|Title 3 level 1]]
  3.1. [[#Title 3 level 2|Title 3 level 2]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented detailed ordered list if no first level', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'nestedDetailedOrderedList'
    const md = getMarkdownFromHeadings(testHeadingsWithoutFirstLevel, options)
    const expectedMd = sanitizeMd(`
1. [[#Title 1 level 2|Title 1 level 2]]
  1.1. [[#Title 1 level 3|Title 1 level 3]]
    1.1.1. [[#Title 1 level 4|Title 1 level 4]]
2. [[#Title 2 level 2|Title 2 level 2]]
3. [[#Title 3 level 2|Title 3 level 2]]
  3.1. [[#Title 3 level 3|Title 3 level 3]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented detailed ordered list with special chars', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'nestedDetailedOrderedList'
    const md = getMarkdownFromHeadings(testHeadingsWithSpecialChars, options)
    const expectedMd = sanitizeMd(`
1. [[#Title 1 \`level 1\` {with special chars}, **bold**, _some_italic_, a-tag, ==highlighted== and ~~strikethrough~~ text|Title 1 level 1 {with special chars}, bold, some_italic,#a-tag, highlighted and strikethrough text]]
  1.1. [[#Title 1 level 2 <em style="color: black">with HTML</em>|Title 1 level 2 <em style="color: black">with HTML</em>]]
  1.2. [[#Title 1 level 2 wikilink1 wikilink2 wikitext2 [mdlink](https://mdurl)|Title 1 level 2 wikilink1 wikitext2 mdlink]]
  1.3. [[#Title 1 level 2 malformedlink a pi pe and [other chars]|Title 1 level 2 malformedlink a pi-pe - and [other chars]]]
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
- [[#Title 1 \`level 1\` {with special chars}, **bold**, _some_italic_, a-tag, ==highlighted== and ~~strikethrough~~ text|Title 1 level 1 {with special chars}, bold, some_italic,#a-tag, highlighted and strikethrough text]]
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
- Title 1 \`level 1\` {with special chars}, **bold**, _some_italic_,#a-tag, ==highlighted== and ~~strikethrough~~ text
  - Title 1 level 2 <em style="color: black">with HTML</em>
  - Title 1 level 2 [[wikilink1]] [[wikilink2|wikitext2]] [mdlink](https://mdurl)
  - Title 1 level 2 [[malformedlink a pi|pe | and [other chars]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented list with includes', () => {
    const options = parseOptionsFromSourceText('')
    options.includeLinks = false
    options.include = /(title [23])/i
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
- Title 2 level 1
- Title 3 level 1
  - Title 3 level 2
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns indented list with excludes', () => {
    const options = parseOptionsFromSourceText('')
    options.includeLinks = false
    options.exclude = /(Title 1 level 1|Title 3 level 2)/
    const md = getMarkdownFromHeadings(testStandardHeadings, options)
    const expectedMd = sanitizeMd(`
- Title 2 level 1
- Title 3 level 1
`)
    expect(md).toEqual(expectedMd)
  })
})
