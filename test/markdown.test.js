const { isHeadingAllowed, getFormattedMarkdownHeading } = require('../src/markdown.js')

describe('isHeadingAllowed', () => {
  test('Returns true when no filters', () => {
    const options = { include: null, exclude: null }
    expect(isHeadingAllowed('Any heading', options)).toBe(true)
  })

  test('Filters with include regex', () => {
    const options = { include: /test/i, exclude: null }
    expect(isHeadingAllowed('Test heading', options)).toBe(true)
    expect(isHeadingAllowed('Other heading', options)).toBe(false)
  })

  test('Filters with exclude regex', () => {
    const options = { include: null, exclude: /skip/i }
    expect(isHeadingAllowed('Skip this', options)).toBe(false)
    expect(isHeadingAllowed('Keep this', options)).toBe(true)
  })

  test('Include takes precedence over exclude', () => {
    const options = { include: /keep/, exclude: /keep/ }
    expect(isHeadingAllowed('keep this', options)).toBe(true)
  })

  test('Case sensitivity in regex', () => {
    const caseSensitive = { include: /Test/, exclude: null }
    expect(isHeadingAllowed('Test', caseSensitive)).toBe(true)
    expect(isHeadingAllowed('test', caseSensitive)).toBe(false)

    const caseInsensitive = { include: /test/i, exclude: null }
    expect(isHeadingAllowed('Test', caseInsensitive)).toBe(true)
    expect(isHeadingAllowed('test', caseInsensitive)).toBe(true)
  })

  test('Complex regex patterns', () => {
    const options = { include: /^(Chapter|Section) \d+/, exclude: null }
    expect(isHeadingAllowed('Chapter 1', options)).toBe(true)
    expect(isHeadingAllowed('Section 42', options)).toBe(true)
    expect(isHeadingAllowed('Part 1', options)).toBe(false)
  })
})

describe('getFormattedMarkdownHeading', () => {
  test('Returns plain text when includeLinks is false', () => {
    const options = { includeLinks: false }
    expect(getFormattedMarkdownHeading('My heading', options)).toBe('My heading')
  })

  test('Creates wikilink when includeLinks is true', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('My heading', options)
    expect(result).toBe('[[#My heading|My heading]]')
  })

  test('Strips bold markdown from text part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('**Bold text**', options)
    expect(result).toContain('|Bold text]]')
  })

  test('Strips italic markdown from text part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('_italic text_', options)
    expect(result).toContain('|italic text]]')
  })

  test('Strips code markdown from text part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('Some `code` here', options)
    expect(result).toContain('|Some code here]]')
  })

  test('Strips highlight markdown from text part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('==highlighted==', options)
    expect(result).toContain('|highlighted]]')
  })

  test('Strips strikethrough markdown from text part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('~~strikethrough~~', options)
    expect(result).toContain('|strikethrough]]')
  })

  test('Strips multiple markdown formatting types', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('**Bold** `code` ==highlight== ~~strike~~', options)
    expect(result).toContain('|Bold code highlight strike]]')
  })

  test('Strips markdown links from text part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('[Link text](https://url.com)', options)
    expect(result).toContain('|Link text]]')
  })

  test('Strips wikilinks with aliases from text part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('Link to [[other|file]]', options)
    expect(result).toContain('|Link to file]]')
  })

  test('Strips wikilinks without aliases from text part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('Link to [[other]]', options)
    expect(result).toContain('|Link to other]]')
  })

  test('Handles wikilinks with anchors in link part', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('Heading #with-tag', options)
    // The link part should preserve the tag structure but convert # to space
    expect(result).toMatch(/^\[\[#Heading\s+with-tag\|/)
    // The text part should show the tag
    expect(result).toContain('|Heading #with-tag]]')
  })

  test('Strips double square brackets from text', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('Text with [[brackets]]', options)
    expect(result).toContain('|Text with brackets]]')
  })

  test('Handles complex markdown combination', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('**Bold** with [[link|alias]] and `code`', options)
    expect(result).toContain('|Bold with alias and code]]')
  })

  test('Handles empty heading', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('', options)
    expect(result).toBe('[[#|]]')
  })

  test('Handles heading with only markdown formatting (strips to empty)', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('****', options)
    // Bold markers without content remain in the link part
    expect(result).toBe('[[#****|]]')
  })

  test('Preserves spaces in heading', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('Heading with   multiple   spaces', options)
    expect(result).toContain('|Heading with   multiple   spaces]]')
  })

  test('Handles special characters', () => {
    const options = { includeLinks: true }
    const result = getFormattedMarkdownHeading('Heading with special chars: !@#$%', options)
    expect(result).toContain('|Heading with special chars: !@#$%]]')
  })

  test('Returns original text unchanged when includeLinks is false', () => {
    const options = { includeLinks: false }
    expect(getFormattedMarkdownHeading('**Bold** `code`', options)).toBe('**Bold** `code`')
    expect(getFormattedMarkdownHeading('[[link]]', options)).toBe('[[link]]')
  })
})
