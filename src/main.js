const { Plugin, MarkdownRenderer, MarkdownRenderChild } = require('./obsidian.js')
const { getOptionsDocs, parseOptionsFromSourceText } = require('./options.js')
const { getMarkdownFromHeadings } = require('./headings.js')
const { DEFAULT_SETTINGS, SettingsTab } = require('./settings.js')

const codeblockId = 'table-of-contents'
const codeblockIdShort = 'toc'

class ObsidianAutomaticTableOfContents extends Plugin {
  async onload() {
    await this.loadSettings()

    const handler = (sourceText, element, context) => {
      context.addChild(new Renderer(this.app, element, context.sourcePath, sourceText, this.settings))
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
      name: 'Insert table of contents (with available options)',
      editorCallback: onInsertTocWithDocs,
    })
    this.addSettingTab(new SettingsTab(this.app, this))
  }

  onunload() {
    // Cleanup is handled automatically by registerMarkdownCodeBlockProcessor,
    // registerEvent, and addCommand
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

function onInsertToc(editor) {
  const markdown = `\`\`\`${codeblockId}\n\`\`\``
  editor.replaceRange(markdown, editor.getCursor())
}

function onInsertTocWithDocs(editor) {
  const markdown = [`\`\`\`${codeblockId}\n${getOptionsDocs()}\n\`\`\``]
  editor.replaceRange(markdown.join('\n'), editor.getCursor())
}

class Renderer extends MarkdownRenderChild {
  constructor(app, element, sourcePath, sourceText, pluginSettings) {
    super(element)
    this.app = app
    this.element = element
    this.sourcePath = sourcePath
    this.sourceText = sourceText
    this.pluginSettings = pluginSettings
  }

  // Render on load
  onload() {
    this.render()
    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        // Only re-render if the current file has changed
        if (file.path === this.sourcePath) {
          this.onMetadataChange()
        }
      }),
    )
  }

  // Render on file change
  onMetadataChange() {
    this.render()
  }

  render() {
    try {
      const options = parseOptionsFromSourceText(this.sourceText, this.pluginSettings)
      if (options.debugInConsole) debug('Options', options)

      const metadata = this.app.metadataCache.getCache(this.sourcePath)
      const headings = metadata?.headings ? metadata.headings : []
      if (options.debugInConsole) debug('Headings', headings)

      const markdown = getMarkdownFromHeadings(headings, options)
      if (options.debugInConsole) debug('Markdown', markdown)

      this.element.empty()
      MarkdownRenderer.renderMarkdown(markdown, this.element, this.sourcePath, this)
    } catch (error) {
      debug('Error', error)
      const readableError = `_💥 Could not render table of contents (${error.message})_`
      MarkdownRenderer.renderMarkdown(readableError, this.element, this.sourcePath, this)
    }
  }
}

function debug(type, data) {
  console.log(
    ...[
      `%cAutomatic Table Of Contents %c${type}:\n`,
      'color: orange; font-weight: bold',
      'font-weight: bold',
      data,
    ],
  )
}

module.exports = ObsidianAutomaticTableOfContents
