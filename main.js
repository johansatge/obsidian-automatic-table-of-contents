let Plugin = class {}
let MarkdownRenderer = {}
let MarkdownRenderChild = class {}

if (isObsidian()) {
  const obsidian = require('obsidian')
  Plugin = obsidian.Plugin
  MarkdownRenderer = obsidian.MarkdownRenderer
  MarkdownRenderChild = obsidian.MarkdownRenderChild
}

const codeblockId = 'table-of-contents'
const availableOptions = {
  style: {
    type: 'string',
    default: 'nestedList',
    values: ['nestedList', 'inlineFirstLevel'],
    comment: 'TOC style (nestedList|inlineFirstLevel)',
  },
  maxLevel: {
    type: 'number',
    default: 0,
    comment: 'Include headings up to the speficied level',
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
    this.registerMarkdownCodeBlockProcessor(codeblockId, (sourceText, element, context) => {
      context.addChild(new Renderer(this.app, element, context.sourcePath, sourceText))
    })
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
    markdown.push(`${optionName}: ${option.default} # ${option.comment}`)
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
    inlineFirstLevel: getMarkdownInlineFirstLevelFromHeadings,
  }
  const markdown = markdownHandlersByStyle[options.style](headings, options)
  return markdown || '_Table of contents: no headings found_'
}

function getMarkdownNestedListFromHeadings(headings, options) {
  const lines = []
  const minLevel = Math.min(...headings.map((heading) => heading.level))
  headings.forEach((heading) => {
    if (options.maxLevel > 0 && heading.level > options.maxLevel) return
    lines.push(`${'\t'.repeat(heading.level - minLevel)}- ${getMarkdownHeading(heading, options)}`)
  })
  return lines.length > 0 ? lines.join('\n') : null
}

function getMarkdownInlineFirstLevelFromHeadings(headings, options) {
  const items = headings
    .filter((heading) => heading.level === 1)
    .map((heading) => {
      return getMarkdownHeading(heading, options)
    })
  return items.length > 0 ? items.join(' | ') : null
}

function getMarkdownHeading(heading, options) {
  if (options.includeLinks) {
    const cleaned = heading.heading.replaceAll('|', '-').replaceAll('[', '{').replaceAll(']', '}')
    return `[[#${cleaned}]]`
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
  const matches = line.match(/([a-zA-Z0-9._ ]+):([^#]+)/)
  if (line.startsWith('#') || !matches) return null
  const possibleName = matches[1].trim()
  const possibleValue = matches[2].trim()
  const optionParams = availableOptions[possibleName]
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
  if (optionParams && optionParams.type === 'string') {
    if (!optionParams.values.includes(possibleValue)) throw valueError
    return { name: possibleName, value: possibleValue }
  }
  return null
}

function debug() {
  console.log(`%cAutomatic Table Of Contents`, 'color: orange; font-weight: bold', ...arguments)
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
