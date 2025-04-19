const availableOptions = {
  title: {
    type: 'string',
    default: '',
    comment: '',
  },
  style: {
    type: 'value',
    default: 'nestedList',
    values: ['nestedList', 'nestedOrderedList', 'inlineFirstLevel'],
    comment: 'TOC style (nestedList|nestedOrderedList|inlineFirstLevel)',
  },
  minLevel: {
    type: 'number',
    default: 0,
    comment: 'Include headings from the specified level',
  },
  maxLevel: {
    type: 'number',
    default: 0,
    comment: 'Include headings up to the specified level',
  },
  includeLinks: {
    type: 'boolean',
    default: true,
    comment: 'Make headings clickable',
  },
  hideWhenEmpty: {
    type: 'boolean',
    default: false,
    comment: 'Hide TOC if no headings are found',
  },
  debugInConsole: {
    type: 'boolean',
    default: false,
    comment: 'Print debug info in Obsidian console',
  },
}

module.exports = {
  getOptionsDocs,
  parseOptionsFromSourceText,
}

function getOptionsDocs() {
  const markdown = []
  for (const optionName of Object.keys(availableOptions)) {
    const option = availableOptions[optionName]
    const comment = option.comment.length > 0 ? ` # ${option.comment}` : ''
    markdown.push(`${optionName}: ${option.default}${comment}`)
  }
  return markdown.join('\n')
}

function parseOptionsFromSourceText(sourceText = '') {
  const options = {}
  for (const option of Object.keys(availableOptions)) {
    options[option] = availableOptions[option].default
  }
  for (const line of sourceText.split('\n')) {
    const option = parseOptionFromSourceLine(line)
    if (option !== null) {
      options[option.name] = option.value
    }
  }
  return options
}

function parseOptionFromSourceLine(line) {
  const matches = line.match(/([a-zA-Z0-9._ ]+):(.*)/)
  if (line.startsWith('#') || !matches) return null
  const possibleName = matches[1].trim()
  const optionParams = availableOptions[possibleName]
  let possibleValue = matches[2].trim()
  if (!optionParams || optionParams.type !== 'string') {
    // Strip comments from values except for strings (as a string may contain markdown)
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
    if (!optionParams.values.includes(possibleValue)) throw valueError
    return { name: possibleName, value: possibleValue }
  }
  if (optionParams && optionParams.type === 'string') {
    return { name: possibleName, value: possibleValue }
  }
  return null
}
