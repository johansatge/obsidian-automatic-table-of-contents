/**
 * Expose Obsidian API when running in Obsidian, and mocks when running tests
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Plugin: any = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MarkdownRenderer: any = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MarkdownRenderChild: any = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PluginSettingTab: any = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Setting: any = class {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SettingGroup: any = class {}
let htmlToMarkdown: (html: string) => string = (html) => html

if (isObsidian()) {
  try {
    // Dynamic import with require for CommonJS compatibility
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const obsidian = require('obsidian')
    Plugin = obsidian.Plugin
    MarkdownRenderer = obsidian.MarkdownRenderer
    MarkdownRenderChild = obsidian.MarkdownRenderChild
    PluginSettingTab = obsidian.PluginSettingTab
    Setting = obsidian.Setting
    // SettingGroup is available in Obsidian but not exported in types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SettingGroup = (obsidian as any).SettingGroup || class {}
    htmlToMarkdown = obsidian.htmlToMarkdown
  } catch {
    // Running in test environment where obsidian is not available
  }
}

export {
  Plugin,
  MarkdownRenderer,
  MarkdownRenderChild,
  PluginSettingTab,
  Setting,
  SettingGroup,
  htmlToMarkdown,
}

function isObsidian(): boolean {
  if (typeof process !== 'object') {
    return true // Obsidian mobile doesn't have a global process object
  }
  return !process.env || !process.env.JEST_WORKER_ID // Jest runtime is not Obsidian
}
