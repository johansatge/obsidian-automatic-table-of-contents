import { describe, expect, test } from 'vitest'
import { getMarkdownFromHeadings } from '../src/headings.js'
import { parseOptionsFromSourceText } from '../src/options.js'
import {
  sanitizeMd,
  testHeadingsWithoutFirstLevel,
  testStandardHeadings,
  toHeadingCache,
} from './utils.js'

describe('First-level headings', () => {
  test('Returns flat first-level list with links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    const md = getMarkdownFromHeadings(toHeadingCache(testStandardHeadings), options)
    const expectedMd = sanitizeMd(`
[[#Title 1 level 1|Title 1 level 1]] | [[#Title 2 level 1|Title 2 level 1]] | [[#Title 3 level 1|Title 3 level 1]]
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat first-level list without links', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.includeLinks = false
    const md = getMarkdownFromHeadings(toHeadingCache(testStandardHeadings), options)
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
    const md = getMarkdownFromHeadings(toHeadingCache(testStandardHeadings), options)
    const expectedMd = sanitizeMd(`
Title 1 level 3
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat list with default level', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.includeLinks = false
    const md = getMarkdownFromHeadings(toHeadingCache(testHeadingsWithoutFirstLevel), options)
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
    const md = getMarkdownFromHeadings(toHeadingCache(testHeadingsWithoutFirstLevel), options)
    const expectedMd = sanitizeMd(`
Some title: Title 1 level 2 | Title 2 level 2 | Title 3 level 2
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat list with includes', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.include = /title [13]/i
    options.includeLinks = false
    const md = getMarkdownFromHeadings(toHeadingCache(testStandardHeadings), options)
    const expectedMd = sanitizeMd(`
Title 1 level 1 | Title 3 level 1
`)
    expect(md).toEqual(expectedMd)
  })

  test('Returns flat list with excludes', () => {
    const options = parseOptionsFromSourceText('')
    options.style = 'inlineFirstLevel'
    options.exclude = /Title [13]/
    options.includeLinks = false
    const md = getMarkdownFromHeadings(toHeadingCache(testStandardHeadings), options)
    const expectedMd = sanitizeMd(`
Title 2 level 1
`)
    expect(md).toEqual(expectedMd)
  })
})
