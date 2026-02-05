const { isHeadingAllowed, getFormattedMarkdownHeading } = require('./markdown.js')

module.exports = {
  getMarkdownFromHeadings,
}

function getMarkdownFromHeadings(headings, options) {
  const markdownHandlersByStyle = {
    nestedList: getMarkdownNestedListFromHeadings,
    nestedOrderedList: getMarkdownNestedOrderedListFromHeadings,
    nestedDetailedOrderedList: getMarkdownNestedDetailedOrderedListFromHeadings,
    inlineFirstLevel: getMarkdownInlineFirstLevelFromHeadings,
  }
  let titleMarkdown = ''
  if (options.title && options.title.length > 0) {
    const titleSeparator = options.style === 'inlineFirstLevel' ? ' ' : '\n'
    titleMarkdown += `${options.title}${titleSeparator}`
  }
  const markdownHeadings = markdownHandlersByStyle[options.style](headings, options)
  if (markdownHeadings === null) {
    if (options.hideWhenEmpty) {
      return ''
    }
    return `${titleMarkdown}_Table of contents: no headings found_`
  }
  return titleMarkdown + markdownHeadings
}

function getMarkdownNestedListFromHeadings(headings, options) {
  return getMarkdownListFromHeadings(headings, false, options)
}

function getMarkdownNestedOrderedListFromHeadings(headings, options) {
  return getMarkdownListFromHeadings(headings, true, options)
}

function getMarkdownNestedDetailedOrderedListFromHeadings(headings, options) {
  const lines = []
  const minLevel =
    options.minLevel > 0 ? options.minLevel : Math.min(...headings.map((heading) => heading.level))
  let unallowedLevel = 0
  const numberCounters = {} // Track numbers for each level

  for (const heading of headings) {
    if (unallowedLevel > 0 && heading.level > unallowedLevel) continue
    if (heading.level <= unallowedLevel) {
      unallowedLevel = 0
    }
    if (!isHeadingAllowed(heading.heading, options)) {
      unallowedLevel = heading.level
      continue
    }
    if (heading.level < minLevel) continue
    if (options.maxLevel > 0 && heading.level > options.maxLevel) continue
    if (heading.heading.length === 0) continue

    // Reset counters for levels deeper than current level
    for (const level of Object.keys(numberCounters)) {
      if (Number.parseInt(level) > heading.level) {
        delete numberCounters[level]
      }
    }

    // Increment counter for current level
    if (!numberCounters[heading.level]) {
      numberCounters[heading.level] = 0
    }
    numberCounters[heading.level]++

    // Build the number prefix (e.g., "1.", "1.1", "1.1.1")
    const numberParts = []
    for (let level = minLevel; level <= heading.level; level++) {
      if (numberCounters[level]) {
        numberParts.push(numberCounters[level])
      }
    }
    const numberPrefix = `${numberParts.join('.')}.`

    lines.push(
      `${'\t'.repeat(heading.level - minLevel)}${numberPrefix} ${getFormattedMarkdownHeading(heading.heading, options)}`,
    )
  }
  return lines.length > 0 ? lines.join('\n') : null
}

function getMarkdownListFromHeadings(headings, isOrdered, options) {
  const prefix = isOrdered ? '1.' : '-'
  const lines = []
  const minLevel =
    options.minLevel > 0 ? options.minLevel : Math.min(...headings.map((heading) => heading.level))
  let unallowedLevel = 0
  for (const heading of headings) {
    if (unallowedLevel > 0 && heading.level > unallowedLevel) continue
    if (heading.level <= unallowedLevel) {
      unallowedLevel = 0
    }
    if (!isHeadingAllowed(heading.heading, options)) {
      unallowedLevel = heading.level
      continue
    }
    if (heading.level < minLevel) continue
    if (options.maxLevel > 0 && heading.level > options.maxLevel) continue
    if (heading.heading.length === 0) continue
    lines.push(
      `${'\t'.repeat(heading.level - minLevel)}${prefix} ${getFormattedMarkdownHeading(heading.heading, options)}`,
    )
  }
  return lines.length > 0 ? lines.join('\n') : null
}

function getMarkdownInlineFirstLevelFromHeadings(headings, options) {
  const minLevel =
    options.minLevel > 0 ? options.minLevel : Math.min(...headings.map((heading) => heading.level))
  const items = headings
    .filter((heading) => heading.level === minLevel)
    .filter((heading) => heading.heading.length > 0)
    .filter((heading) => isHeadingAllowed(heading.heading, options))
    .map((heading) => {
      return getFormattedMarkdownHeading(heading.heading, options)
    })
  return items.length > 0 ? items.join(' | ') : null
}
