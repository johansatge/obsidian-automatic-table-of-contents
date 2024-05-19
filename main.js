let Plugin = class {}
let MarkdownRenderer = {}
let MarkdownRenderChild = class {}
let htmlToMarkdown = (html) => html

if (isObsidian()) {
  const obsidian = require('obsidian')
  Plugin = obsidian.Plugin
  MarkdownRenderer = obsidian.MarkdownRenderer
  MarkdownRenderChild = obsidian.MarkdownRenderChild
  htmlToMarkdown = obsidian.htmlToMarkdown
}

const codeblockId = 'table-of-contents'
const codeblockIdShort = 'toc'
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
  debugInConsole: {
    type: 'boolean',
    default: false,
    comment: 'Print debug info in Obsidian console',
  },
}

class ObsidianAutomaticTableOfContents extends Plugin {
  async onload() {
    const handler = (sourceText, element, context) => {
      context.addChild(new Renderer(this.app, element, context.sourcePath, sourceText))
    }
    this.registerMarkdownCodeBlockProcessor(codeblockId, handler)
    this.registerMarkdownCodeBlockProcessor(codeblockIdShort, handler)
    this.addCommand({
      id: 'insert-automatic-table-of-contents',
      name: 'Insert table of contents',
      editorCallback: onInsertToc,
    })
    this.addCommand({
      id: 'insert-automatic-table-of-contents-docs',
      name: 'Insert table of contents (documented)',
      editorCallback: onInsertTocWithDocs,
    })
  }
}

function onInsertToc(editor) {
  const markdown = '```' + codeblockId + '\n```'
  editor.replaceRange(markdown, editor.getCursor())
}

function onInsertTocWithDocs(editor) {
  let markdown = ['```' + codeblockId]
  Object.keys(availableOptions).forEach((optionName) => {
    const option = availableOptions[optionName]
    const comment = option.comment.length > 0 ? ` # ${option.comment}` : ''
    markdown.push(`${optionName}: ${option.default}${comment}`)
  })
  markdown.push('```')
  editor.replaceRange(markdown.join('\n'), editor.getCursor())
}

class Renderer extends MarkdownRenderChild {
  constructor(app, element, sourcePath, sourceText) {
    super(element)
    this.app = app
    this.element = element
    this.sourcePath = sourcePath
    this.sourceText = sourceText
  }

  // Render on load
  onload() {
    this.render()
    this.registerEvent(this.app.metadataCache.on('changed', this.onMetadataChange.bind(this)))
  }

  // Render on file change
  onMetadataChange() {
    this.render()
  }

  render() {
    try {
      const options = parseOptionsFromSourceText(this.sourceText)
      if (options.debugInConsole) debug('Options', options)

      const metadata = this.app.metadataCache.getCache(this.sourcePath)
      const headings = metadata && metadata.headings ? metadata.headings : []
      if (options.debugInConsole) debug('Headings', headings)

      const markdown = getMarkdownFromHeadings(headings, options)
      if (options.debugInConsole) debug('Markdown', markdown)

      this.element.empty()
      MarkdownRenderer.renderMarkdown(markdown, this.element, this.sourcePath, this)
    } catch(error) {
      const readableError = `_💥 Could not render table of contents (${error.message})_`
      MarkdownRenderer.renderMarkdown(readableError, this.element, this.sourcePath, this)
    }
  }
}

function getMarkdownFromHeadings(headings, options) {
  const markdownHandlersByStyle = {
    nestedList: getMarkdownNestedListFromHeadings,
    nestedOrderedList: getMarkdownNestedOrderedListFromHeadings,
    inlineFirstLevel: getMarkdownInlineFirstLevelFromHeadings,
  }
  let markdown = ''
  if (options.title && options.title.length > 0) {
    markdown += options.title + '\n'
  }
  const noHeadingMessage = '_Table of contents: no headings found_'
  markdown += markdownHandlersByStyle[options.style](headings, options) || noHeadingMessage
  return markdown
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
  const minLevel = options.minLevel > 0
    ? options.minLevel
    : Math.min(...headings.map((heading) => heading.level))
  headings.forEach((heading) => {
    if (heading.level < minLevel) return
    if (options.maxLevel > 0 && heading.level > options.maxLevel) return
    lines.push(`${'\t'.repeat(heading.level - minLevel)}${prefix} ${getMarkdownHeading(heading, options)}`)
  })
  return lines.length > 0 ? lines.join('\n') : null
}

function getMarkdownInlineFirstLevelFromHeadings(headings, options) {
  const minLevel = options.minLevel > 0
    ? options.minLevel
    : Math.min(...headings.map((heading) => heading.level))
  const items = headings
    .filter((heading) => heading.level === minLevel)
    .map((heading) => {
      return getMarkdownHeading(heading, options)
    })
  return items.length > 0 ? items.join(' | ') : null
}

function getMarkdownHeading(heading, options) {
  const stripMarkdown = (text) => {
    text = text.replaceAll('*', '').replaceAll('_', '').replaceAll('`', '')
    text = text.replaceAll('==', '').replaceAll('~~', '')
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip markdown links
    return text
  }
  const stripHtml = (text) => stripMarkdown(htmlToMarkdown(text))
  const stripWikilinks = (text, isForLink) => {
    // Strip [[link|text]] format
    // For the text part of the final link we only keep "text"
    // For the link part we need the text + link
    // Example: "# Some [[file.md|heading]]" must be translated to "[[#Some file.md heading|Some heading]]"
    text = text.replace(/\[\[([^\]]+)\|([^\]]+)\]\]/g, isForLink ? '$1 $2' : '$2')
    text = text.replace(/\[\[([^\]]+)\]\]/g, '$1') // Strip [[link]] format
    // Replace malformed links & reserved wikilinks chars
    text = text.replaceAll('[[', '').replaceAll('| ', isForLink ? '' : '- ').replaceAll('|', isForLink ? ' ' : '-')
    return text
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

function parseOptionsFromSourceText(sourceText = '') {
  const options = {}
  Object.keys(availableOptions).forEach((option) => {
    options[option] = availableOptions[option].default
  })
  sourceText.split('\n').forEach((line) => {
    const option = parseOptionFromSourceLine(line)
    if (option !== null) {
      options[option.name] = option.value
    }
  })
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
    const value = parseInt(possibleValue)
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

function debug(type, data) {
  console.log(...[
    `%cAutomatic Table Of Contents %c${type}:\n`,
    'color: orange; font-weight: bold',
    'font-weight: bold',
    data,
  ])
}

function isObsidian() {
  if (typeof process !== 'object') {
    return true // Obsidian mobile doesn't have a global process object
  }
  return !process.env || !process.env.JEST_WORKER_ID // Jest runtime is not Obsidian
}

if (isObsidian()) {
  module.exports = ObsidianAutomaticTableOfContents
} else {
  module.exports = {
    parseOptionsFromSourceText,
    getMarkdownFromHeadings,
  }
}
