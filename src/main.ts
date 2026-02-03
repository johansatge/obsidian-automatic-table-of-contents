import { getMarkdownFromHeadings } from './headings.js'
import { MarkdownRenderChild, MarkdownRenderer, Plugin } from './obsidian.js'
import { type PluginSettings, getOptionsDocs, parseOptionsFromSourceText } from './options.js'
import { DEFAULT_SETTINGS, SettingsTab } from './settings.js'

// These types are conditional based on runtime environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type App = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Editor = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkdownFileInfo = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CachedMetadata = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFile = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HeadingCache = any

const codeblockId = 'table-of-contents'
const codeblockIdShort = 'toc'

interface ProcessorContext {
  sourcePath: string
  addChild: (child: any) => void
}

class ObsidianAutomaticTableOfContents extends Plugin {
  settings!: PluginSettings

  async onload(): Promise<void> {
    await this.loadSettings()

    const handler = (sourceText: string, element: HTMLElement, context: ProcessorContext) => {
      context.addChild(
        new Renderer(this.app, element, context.sourcePath, sourceText, this.settings),
      )
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

  onunload(): void {
    // Cleanup is handled automatically by registerMarkdownCodeBlockProcessor,
    // registerEvent, and addCommand
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}

function onInsertToc(editor: Editor, _view: MarkdownFileInfo): void {
  const markdown = `\`\`\`${codeblockId}\n\`\`\``
  editor.replaceRange(markdown, editor.getCursor())
}

function onInsertTocWithDocs(editor: Editor, _view: MarkdownFileInfo): void {
  const markdown = [`\`\`\`${codeblockId}\n${getOptionsDocs()}\n\`\`\``]
  editor.replaceRange(markdown.join('\n'), editor.getCursor())
}

class Renderer extends MarkdownRenderChild {
  app: App
  element: HTMLElement
  sourcePath: string
  sourceText: string
  pluginSettings: PluginSettings

  constructor(
    app: App,
    element: HTMLElement,
    sourcePath: string,
    sourceText: string,
    pluginSettings: PluginSettings,
  ) {
    super(element)
    this.app = app
    this.element = element
    this.sourcePath = sourcePath
    this.sourceText = sourceText
    this.pluginSettings = pluginSettings
  }

  // Render on load
  onload(): void {
    this.render()
    this.registerEvent(
      this.app.metadataCache.on('changed', (file: TFile) => {
        // Only re-render if the current file has changed
        if (file.path === this.sourcePath) {
          this.onMetadataChange()
        }
      }),
    )
  }

  // Render on file change
  onMetadataChange(): void {
    this.render()
  }

  render(): void {
    try {
      const options = parseOptionsFromSourceText(this.sourceText, this.pluginSettings)
      if (options.debugInConsole) debug('Options', options)

      const metadata: CachedMetadata | null = this.app.metadataCache.getCache(this.sourcePath)
      const headings: HeadingCache[] = metadata?.headings ? metadata.headings : []
      if (options.debugInConsole) debug('Headings', headings)

      const markdown = getMarkdownFromHeadings(headings, options)
      if (options.debugInConsole) debug('Markdown', markdown)
      ;(this.element as any).empty()
      MarkdownRenderer.renderMarkdown(markdown, this.element, this.sourcePath, this)
    } catch (error) {
      debug('Error', error)
      const message = error instanceof Error ? error.message : String(error)
      const readableError = `_💥 Could not render table of contents (${message})_`
      MarkdownRenderer.renderMarkdown(readableError, this.element, this.sourcePath, this)
    }
  }
}

function debug(type: string, data: unknown): void {
  console.log(
    ...[
      `%cAutomatic Table Of Contents %c${type}:\n`,
      'color: orange; font-weight: bold',
      'font-weight: bold',
      data,
    ],
  )
}

export default ObsidianAutomaticTableOfContents
