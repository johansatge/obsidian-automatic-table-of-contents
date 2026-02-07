import { describe, expect, test } from 'vitest'
import { getMarkdownFromHeadings } from '../src/headings.js'
import { parseOptionsFromSourceText } from '../src/options.js'

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
