import { DEFAULT_OPTIONS, type TableOfContentsOptions } from './defaults.js'

interface OptionDefinition {
  type: 'string' | 'value' | 'number' | 'boolean' | 'regexp'
  default: string | number | boolean | null
  values?: string[]
  comment: string
}

type AvailableOptions = {
  [K in keyof TableOfContentsOptions]: OptionDefinition
}

const availableOptions: AvailableOptions = {
  title: {
    type: 'string',
    default: DEFAULT_OPTIONS.title,
    comment: '',
  },
  style: {
    type: 'value',
    default: DEFAULT_OPTIONS.style,
    values: ['nestedList', 'nestedOrderedList', 'nestedDetailedOrderedList', 'inlineFirstLevel'],
    comment: 'TOC style (nestedList|nestedOrderedList|nestedDetailedOrderedList|inlineFirstLevel)',
  },
  minLevel: {
    type: 'number',
    default: DEFAULT_OPTIONS.minLevel,
    comment: 'Include headings from the specified level',
  },
  maxLevel: {
    type: 'number',
    default: DEFAULT_OPTIONS.maxLevel,
    comment: 'Include headings up to the specified level',
  },
  include: {
    type: 'regexp',
    default: null,
    comment: '',
  },
  exclude: {
    type: 'regexp',
    default: null,
    comment: '',
  },
  includeLinks: {
    type: 'boolean',
    default: DEFAULT_OPTIONS.includeLinks,
    comment: 'Make headings clickable',
  },
  hideWhenEmpty: {
    type: 'boolean',
    default: DEFAULT_OPTIONS.hideWhenEmpty,
    comment: 'Hide TOC if no headings are found',
  },
  debugInConsole: {
    type: 'boolean',
    default: false,
    comment: 'Print debug info in Obsidian console',
  },
}

export interface PluginSettings {
  defaultTitle: string
  defaultStyle: 'nestedList' | 'nestedOrderedList' | 'nestedDetailedOrderedList' | 'inlineFirstLevel'
  defaultMinLevel: number
  defaultMaxLevel: number
  defaultIncludeLinks: boolean
  defaultHideWhenEmpty: boolean
}

/**
 * Get readable options to be inserted with the TOC command
 * @return Formatted options string
 */
export function getOptionsDocs(): string {
  const markdown: string[] = []
  for (const optionName of Object.keys(availableOptions) as Array<keyof TableOfContentsOptions>) {
    const option = availableOptions[optionName]
    const comment = option.comment.length > 0 ? ` # ${option.comment}` : ''
    const def = option.default !== null ? option.default : ''
    markdown.push(`${optionName}: ${def}${comment}`)
  }
  return markdown.join('\n')
}

/**
 * Get an options object from a source text (got from the TOC code block)
 * @param sourceText - Text from the code block
 * @param pluginSettings - Optional plugin settings to use as defaults
 * @return Parsed options object
 */
export function parseOptionsFromSourceText(
  sourceText = '',
  pluginSettings: PluginSettings | null = null,
): TableOfContentsOptions {
  // Start with hardcoded defaults
  const options: TableOfContentsOptions = {
    title: DEFAULT_OPTIONS.title,
    style: DEFAULT_OPTIONS.style,
    minLevel: DEFAULT_OPTIONS.minLevel,
    maxLevel: DEFAULT_OPTIONS.maxLevel,
    include: DEFAULT_OPTIONS.include,
    exclude: DEFAULT_OPTIONS.exclude,
    includeLinks: DEFAULT_OPTIONS.includeLinks,
    hideWhenEmpty: DEFAULT_OPTIONS.hideWhenEmpty,
    debugInConsole: DEFAULT_OPTIONS.debugInConsole,
  }

  // Apply plugin settings if available
  if (pluginSettings) {
    options.title = pluginSettings.defaultTitle
    options.style = pluginSettings.defaultStyle
    options.minLevel = pluginSettings.defaultMinLevel
    options.maxLevel = pluginSettings.defaultMaxLevel
    options.includeLinks = pluginSettings.defaultIncludeLinks
    options.hideWhenEmpty = pluginSettings.defaultHideWhenEmpty
  }

  // Parse overrides from codeblock source text
  for (const line of sourceText.split('\n')) {
    const option = parseOptionFromSourceLine(line)
    if (option !== null) {
      ;(options as any)[option.name] = option.value
    }
  }
  return options
}

interface ParsedOption {
  name: keyof TableOfContentsOptions
  value: string | number | boolean | RegExp
}

/**
 * Parse an option from a source line
 * @param line - The source line to parse (e.g., "optionName: value # comment")
 * @return Parsed option object or null if invalid
 * @throws Error when invalid value format detected for the option type
 */
function parseOptionFromSourceLine(line: string): ParsedOption | null {
  const matches = line.match(/([a-zA-Z0-9._ ]+):(.*)/)
  if (line.startsWith('#') || !matches) return null
  const possibleName = matches[1].trim() as keyof TableOfContentsOptions
  const optionParams = availableOptions[possibleName]
  let possibleValue = matches[2].trim()
  if (!optionParams || !['string', 'regexp'].includes(optionParams.type)) {
    // Strip comments from values except for strings & regexp (as a string or regex may contain "#")
    possibleValue = possibleValue.replace(/#[^#]*$/, '').trim()
  }
  const valueError = new Error(`Invalid value for \`${possibleName}\``)
  if (optionParams && optionParams.type === 'number') {
    const value = Number.parseInt(possibleValue)
    if (value < 0) throw valueError
    return { name: possibleName, value }
  }
  if (optionParams && optionParams.type === 'boolean') {
    if (!['true', 'false'].includes(possibleValue)) throw valueError
    return { name: possibleName, value: possibleValue === 'true' }
  }
  if (optionParams && optionParams.type === 'value') {
    if (optionParams.values && !optionParams.values.includes(possibleValue)) throw valueError
    return { name: possibleName, value: possibleValue as TableOfContentsOptions['style'] }
  }
  if (optionParams && optionParams.type === 'string') {
    // Allow explicitly setting empty string to override default
    if (possibleValue === 'null' || possibleValue === '""' || possibleValue === "''") {
      return { name: possibleName, value: '' }
    }
    return { name: possibleName, value: possibleValue }
  }
  if (optionParams && optionParams.type === 'regexp') {
    if (possibleValue === 'null' || possibleValue.length === 0) return null
    try {
      const match = /^\/(.*)\/([a-z]*)/.exec(possibleValue)
      if (!match) throw new Error('Invalid regexp')
      const regexp = new RegExp(match[1], match[2])
      return { name: possibleName, value: regexp }
    } catch {
      throw valueError
    }
  }
  return null
}
