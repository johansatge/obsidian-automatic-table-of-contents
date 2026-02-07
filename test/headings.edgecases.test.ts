import { describe, expect, test } from 'vitest'
import { getMarkdownFromHeadings } from '../src/headings.js'
import { parseOptionsFromSourceText } from '../src/options.js'

describe('getMarkdownFromHeadings - edge cases', () => {
  test('Handles empty headings array', () => {
    const options = parseOptionsFromSourceText('')
    const md = getMarkdownFromHeadings([], options)
    expect(md).toContain('no headings found')
  })

  test('Handles headings with gaps in hierarchy', () => {
    const headings = [
      {
        level: 1,
        heading: 'Level 1',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 3,
        heading: 'Level 3 (no level 2)',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      }, // gap
      {
        level: 5,
        heading: 'Level 5 (no level 4)',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      }, // gap
    ]
    const options = parseOptionsFromSourceText('style: nestedList')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toContain('Level 1')
    expect(md).toContain('Level 3')
    expect(md).toContain('Level 5')
  })

  test('Handles all headings filtered out by minLevel/maxLevel', () => {
    const headings = [
      {
        level: 1,
        heading: 'Level 1',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 2,
        heading: 'Level 2',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
    ]
    const options = parseOptionsFromSourceText('minLevel: 3\nmaxLevel: 5')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toBe('_Table of contents: no headings found_')
  })

  test('Handles title with nestedList style (newline after title)', () => {
    const headings = [
      {
        level: 1,
        heading: 'Test',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
    ]

    const options = parseOptionsFromSourceText('title: ## TOC\nstyle: nestedList')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toMatch(/^## TOC\n/)
    expect(md).toContain('- [[#Test|Test]]')
  })

  test('Handles title with inlineFirstLevel style (space after title)', () => {
    const headings = [
      {
        level: 1,
        heading: 'Test',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
    ]

    const options = parseOptionsFromSourceText('title: ## TOC\nstyle: inlineFirstLevel')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toMatch(/^## TOC /)
    expect(md).toContain('[[#Test|Test]]')
  })

  test('Handles empty title option', () => {
    const headings = [
      {
        level: 1,
        heading: 'Test',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
    ]

    const options = parseOptionsFromSourceText('title: \nstyle: nestedList')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).not.toMatch(/^##/)
    expect(md).toContain('- [[#Test|Test]]')
  })

  test('Returns empty string when hideWhenEmpty is true and no headings', () => {
    const options = parseOptionsFromSourceText('hideWhenEmpty: true')
    const md = getMarkdownFromHeadings([], options)
    expect(md).toBe('')
  })

  test('Returns empty string when hideWhenEmpty is true and all headings filtered', () => {
    const headings = [
      {
        level: 1,
        heading: 'Skip this',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 2,
        heading: 'Skip that',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
    ]
    const options = parseOptionsFromSourceText('hideWhenEmpty: true\nexclude: /skip/i')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toBe('')
  })

  test('Handles only higher level headings than minLevel', () => {
    const headings = [
      {
        level: 1,
        heading: 'Level 1',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 2,
        heading: 'Level 2',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
    ]
    const options = parseOptionsFromSourceText('minLevel: 3')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toContain('no headings found')
  })

  test('Handles nestedOrderedList style', () => {
    const headings = [
      {
        level: 1,
        heading: 'First',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 2,
        heading: 'Second',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 1,
        heading: 'Third',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
    ]
    const options = parseOptionsFromSourceText('style: nestedOrderedList')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toMatch(/^1\. \[\[#First/)
    expect(md).toMatch(/\n\t1\. \[\[#Second/)
    expect(md).toMatch(/\n1\. \[\[#Third/)
  })

  test('Handles deeply nested hierarchy', () => {
    const headings = [
      {
        level: 1,
        heading: 'H1',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 2,
        heading: 'H2',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 3,
        heading: 'H3',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 4,
        heading: 'H4',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 5,
        heading: 'H5',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
      {
        level: 6,
        heading: 'H6',
        position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
      },
    ]
    const options = parseOptionsFromSourceText('style: nestedList')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toContain('- [[#H1|H1]]')
    expect(md).toContain('\t- [[#H2|H2]]')
    expect(md).toContain('\t\t- [[#H3|H3]]')
    expect(md).toContain('\t\t\t- [[#H4|H4]]')
    expect(md).toContain('\t\t\t\t- [[#H5|H5]]')
    expect(md).toContain('\t\t\t\t\t- [[#H6|H6]]')
  })
})
