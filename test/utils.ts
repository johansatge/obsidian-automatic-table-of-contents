import type { HeadingCache } from 'obsidian'

/**
 * Helper type for test headings - simplified version of HeadingCache
 */
export type TestHeading = Pick<HeadingCache, 'heading' | 'level'>

/**
 * Convert test headings to HeadingCache format with mock position data
 */
export function toHeadingCache(headings: TestHeading[]): HeadingCache[] {
  return headings.map((h, i) => ({
    ...h,
    position: {
      start: { line: i, col: 0, offset: 0 },
      end: { line: i, col: h.heading.length, offset: h.heading.length },
    },
  }))
}

/**
 * Normalize markdown formatting for test comparisons
 * Converts spaces to tabs and trims leading/trailing newlines
 */
export function sanitizeMd(md: string): string {
  return md.replaceAll('  ', '\t').replace(/^\n/, '').replace(/\n$/, '')
}

export const testStandardHeadings: TestHeading[] = [
  { heading: 'Title 1 level 1', level: 1 },
  { heading: 'Title 1 level 2', level: 2 },
  { heading: 'Title 1 level 3', level: 3 },
  { heading: '', level: 3 },
  { heading: 'Title 2 level 1', level: 1 },
  { heading: 'Title 3 level 1', level: 1 },
  { heading: 'Title 3 level 2', level: 2 },
]

export const testHeadingsWithoutFirstLevel: TestHeading[] = [
  { heading: 'Title 1 level 2', level: 2 },
  { heading: 'Title 1 level 3', level: 3 },
  { heading: 'Title 1 level 4', level: 4 },
  { heading: 'Title 2 level 2', level: 2 },
  { heading: 'Title 3 level 2', level: 2 },
  { heading: 'Title 3 level 3', level: 3 },
]

export const testHeadingsWithSpecialChars: TestHeading[] = [
  {
    heading:
      'Title 1 `level 1` {with special chars}, **bold**, _some_italic_,#a-tag, ==highlighted== and ~~strikethrough~~ text',
    level: 1,
  },
  { heading: 'Title 1 level 2 <em style="color: black">with HTML</em>', level: 2 },
  {
    heading: 'Title 1 level 2 [[wikilink1]] [[wikilink2|wikitext2]] [mdlink](https://mdurl)',
    level: 2,
  },
  { heading: 'Title 1 level 2 [[malformedlink a pi|pe | and [other chars]', level: 2 },
]
