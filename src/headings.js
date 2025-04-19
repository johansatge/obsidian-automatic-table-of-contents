const { htmlToMarkdown } = require('./obsidian.js')

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
      `${'\t'.repeat(heading.level - minLevel)}${prefix} ${getMarkdownHeading(heading, options)}`,
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
      return getMarkdownHeading(heading, options)
    })
  return items.length > 0 ? items.join(' | ') : null
}

function getMarkdownHeading(heading, options) {
  const stripMarkdown = (text) => {
    return text
      .replaceAll('*', '')
      .replaceAll('_', '')
      .replaceAll('`', '')
      .replaceAll('==', '')
      .replaceAll('~~', '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip markdown links
  }
  const stripHtml = (text) => stripMarkdown(htmlToMarkdown(text))
  const stripWikilinks = (text, isForLink) => {
    // Strip [[link|text]] format
    // For the text part of the final link we only keep "text"
    // For the link part we need the text + link
    // Example: "# Some [[file.md|heading]]" must be translated to "[[#Some file.md heading|Some heading]]"
    return (
      text
        .replace(/\[\[([^\]]+)\|([^\]]+)\]\]/g, isForLink ? '$1 $2' : '$2')
        .replace(/\[\[([^\]]+)\]\]/g, '$1') // Strip [[link]] format
        // Replace malformed links & reserved wikilinks chars
        .replaceAll('[[', '')
        .replaceAll('| ', isForLink ? '' : '- ')
        .replaceAll('|', isForLink ? ' ' : '-')
    )
  }
  const stripTags = (text) => text.replaceAll('#', '')
  if (options.includeLinks) {
    // Remove markdown, HTML & wikilinks from text for readability, as they are not rendered in a wikilink
    let text = heading.heading
    text = stripMarkdown(text)
    text = stripHtml(text)
    text = stripWikilinks(text, false)
    // Remove wikilinks & tags from link or it won't be clickable (on the other hand HTML & markdown must stay)
    let link = heading.heading
    link = stripWikilinks(link, true)
    link = stripTags(link)

    // Return wiklink style link
    return `[[#${link}|${text}]]`
    // Why not markdown links? Because even if it looks like the text part would have a better compatibility
    // with complex headings (as it would support HTML, markdown, etc) the link part is messy,
    // because it requires some encoding that looks buggy and undocumented; official docs state the link must be URL encoded
    // (https://help.obsidian.md/Linking+notes+and+files/Internal+links#Supported+formats+for+internal+links)
    // but it doesn't work properly, example: "## Some <em>heading</em> with simple HTML" must be encoded as:
    // [Some <em>heading</em> with simple HTML](#Some%20<em>heading</em>%20with%20simpler%20HTML)
    // and not
    // [Some <em>heading</em> with simple HTML](#Some%20%3Cem%3Eheading%3C%2Fem%3E%20with%20simpler%20HTML)
    // Also it won't be clickable at all if the heading contains #tags or more complex HTML
    // (example: ## Some <em style="background: red">heading</em> #with-a-tag)
    // (unless there is a way to encode these use cases that I didn't find)
  }
  return heading.heading
}
