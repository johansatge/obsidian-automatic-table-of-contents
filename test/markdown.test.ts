import { describe, expect, test } from '@jest/globals'
import type { TableOfContentsOptions } from '../src/defaults.js'
import { getFormattedMarkdownHeading, isHeadingAllowed } from '../src/markdown.js'

describe('isHeadingAllowed', () => {
  test('Returns true when no filters', () => {
    const options = { include: null, exclude: null } as Partial<TableOfContentsOptions>
    expect(isHeadingAllowed('Any heading', options as TableOfContentsOptions)).toBe(true)
  })

  test('Filters with include regex', () => {
    const options = { include: /test/i, exclude: null } as Partial<TableOfContentsOptions>
    expect(isHeadingAllowed('Test heading', options as TableOfContentsOptions)).toBe(true)
    expect(isHeadingAllowed('Other heading', options as TableOfContentsOptions)).toBe(false)
  })

  test('Filters with exclude regex', () => {
    const options = { include: null, exclude: /skip/i } as Partial<TableOfContentsOptions>
    expect(isHeadingAllowed('Skip this', options as TableOfContentsOptions)).toBe(false)
    expect(isHeadingAllowed('Keep this', options as TableOfContentsOptions)).toBe(true)
  })

  test('Include takes precedence over exclude', () => {
    const options = { include: /keep/, exclude: /keep/ } as Partial<TableOfContentsOptions>
    expect(isHeadingAllowed('keep this', options as TableOfContentsOptions)).toBe(true)
  })

  test('Case sensitivity in regex', () => {
    const caseSensitive = { include: /Test/, exclude: null } as Partial<TableOfContentsOptions>
    expect(isHeadingAllowed('Test', caseSensitive as TableOfContentsOptions)).toBe(true)
    expect(isHeadingAllowed('test', caseSensitive as TableOfContentsOptions)).toBe(false)

    const caseInsensitive = { include: /test/i, exclude: null } as Partial<TableOfContentsOptions>
    expect(isHeadingAllowed('Test', caseInsensitive as TableOfContentsOptions)).toBe(true)
    expect(isHeadingAllowed('test', caseInsensitive as TableOfContentsOptions)).toBe(true)
  })

  test('Complex regex patterns', () => {
    const options = {
      include: /^(Chapter|Section) \d+/,
      exclude: null,
    } as Partial<TableOfContentsOptions>
    expect(isHeadingAllowed('Chapter 1', options as TableOfContentsOptions)).toBe(true)
    expect(isHeadingAllowed('Section 42', options as TableOfContentsOptions)).toBe(true)
    expect(isHeadingAllowed('Part 1', options as TableOfContentsOptions)).toBe(false)
  })
})

describe('getFormattedMarkdownHeading', () => {
  test('Returns plain text when includeLinks is false', () => {
    const options = { includeLinks: false } as Partial<TableOfContentsOptions>
    expect(getFormattedMarkdownHeading('My heading', options as TableOfContentsOptions)).toBe(
      'My heading',
    )
  })

  test('Creates wikilink when includeLinks is true', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading('My heading', options as TableOfContentsOptions)
    expect(result).toBe('[[#My heading|My heading]]')
  })

  test('Strips bold markdown from text part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading('**Bold text**', options as TableOfContentsOptions)
    expect(result).toContain('|Bold text]]')
  })

  test('Strips italic markdown from text part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading('_italic text_', options as TableOfContentsOptions)
    expect(result).toContain('|italic text]]')
  })

  test('Strips code markdown from text part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      'Some `code` here',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Some code here]]')
  })

  test('Strips highlight markdown from text part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading('==highlighted==', options as TableOfContentsOptions)
    expect(result).toContain('|highlighted]]')
  })

  test('Strips strikethrough markdown from text part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      '~~strikethrough~~',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|strikethrough]]')
  })

  test('Strips multiple markdown formatting types', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      '**Bold** `code` ==highlight== ~~strike~~',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Bold code highlight strike]]')
  })

  test('Strips markdown links from text part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      '[Link text](https://url.com)',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Link text]]')
  })

  test('Strips wikilinks with aliases from text part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      'Link to [[other|file]]',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Link to file]]')
  })

  test('Strips wikilinks without aliases from text part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      'Link to [[other]]',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Link to other]]')
  })

  test('Handles wikilinks with anchors in link part', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      'Heading #with-tag',
      options as TableOfContentsOptions,
    )
    // The link part should preserve the tag structure but convert # to space
    expect(result).toMatch(/^\[\[#Heading\s+with-tag\|/)
    // The text part should show the tag
    expect(result).toContain('|Heading #with-tag]]')
  })

  test('Strips double square brackets from text', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      'Text with [[brackets]]',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Text with brackets]]')
  })

  test('Handles complex markdown combination', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      '**Bold** with [[link|alias]] and `code`',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Bold with alias and code]]')
  })

  test('Handles empty heading', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading('', options as TableOfContentsOptions)
    expect(result).toBe('[[#|]]')
  })

  test('Handles heading with only markdown formatting (strips to empty)', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading('****', options as TableOfContentsOptions)
    // Bold markers without content remain in the link part
    expect(result).toBe('[[#****|]]')
  })

  test('Preserves spaces in heading', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      'Heading with   multiple   spaces',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Heading with   multiple   spaces]]')
  })

  test('Handles special characters', () => {
    const options = { includeLinks: true } as Partial<TableOfContentsOptions>
    const result = getFormattedMarkdownHeading(
      'Heading with special chars: !@#$%',
      options as TableOfContentsOptions,
    )
    expect(result).toContain('|Heading with special chars: !@#$%]]')
  })

  test('Returns original text unchanged when includeLinks is false', () => {
    const options = { includeLinks: false } as Partial<TableOfContentsOptions>
    expect(getFormattedMarkdownHeading('**Bold** `code`', options as TableOfContentsOptions)).toBe(
      '**Bold** `code`',
    )
    expect(getFormattedMarkdownHeading('[[link]]', options as TableOfContentsOptions)).toBe(
      '[[link]]',
    )
  })
})
