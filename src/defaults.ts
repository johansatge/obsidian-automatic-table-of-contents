/**
 * Configuration options for the table of contents
 */
export interface TableOfContentsOptions {
  title: string
  style: 'nestedList' | 'nestedOrderedList' | 'inlineFirstLevel'
  minLevel: number
  maxLevel: number
  include: RegExp | null
  exclude: RegExp | null
  includeLinks: boolean
  hideWhenEmpty: boolean
  debugInConsole: boolean
}

/**
 * Default values for table of contents options
 * Used for both codeblock options and plugin settings
 */
export const DEFAULT_OPTIONS = {
  title: '',
  style: 'nestedList',
  minLevel: 0,
  maxLevel: 0,
  include: null,
  exclude: null,
  includeLinks: true,
  hideWhenEmpty: false,
  debugInConsole: false,
} as const satisfies TableOfContentsOptions
