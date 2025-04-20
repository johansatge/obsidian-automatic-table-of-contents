const { getFormattedMarkdownHeading } = require('./markdown.js')

module.exports = {
  getMarkdownFromHeadings,
}

function getMarkdownFromHeadings(headings, options) {
  const markdownHandlersByStyle = {
    nestedList: getMarkdownNestedListFromHeadings,
    nestedOrderedList: getMarkdownNestedOrderedListFromHeadings,
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

function getMarkdownListFromHeadings(headings, isOrdered, options) {
  const prefix = isOrdered ? '1.' : '-'
  const lines = []
  const minLevel =
    options.minLevel > 0 ? options.minLevel : Math.min(...headings.map((heading) => heading.level))
  for (const heading of headings) {
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
    .map((heading) => {
      return getFormattedMarkdownHeading(heading.heading, options)
    })
  return items.length > 0 ? items.join(' | ') : null
}
