import { DEFAULT_OPTIONS } from './defaults.js'
import { PluginSettingTab, SettingGroup } from './obsidian.js'
import type { PluginSettings } from './options.js'

// These types are conditional based on runtime environment
type App = any
type Plugin = any

export const DEFAULT_SETTINGS: PluginSettings = {
  defaultTitle: DEFAULT_OPTIONS.title,
  defaultStyle: DEFAULT_OPTIONS.style,
  defaultMinLevel: DEFAULT_OPTIONS.minLevel,
  defaultMaxLevel: DEFAULT_OPTIONS.maxLevel,
  defaultIncludeLinks: DEFAULT_OPTIONS.includeLinks,
  defaultHideWhenEmpty: DEFAULT_OPTIONS.hideWhenEmpty,
}

export class SettingsTab extends PluginSettingTab {
  plugin: Plugin & { settings: PluginSettings; saveSettings: () => Promise<void> }

  constructor(
    app: App,
    plugin: Plugin & { settings: PluginSettings; saveSettings: () => Promise<void> },
  ) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    const heading = document.createDocumentFragment()
    ;(heading as any).createDiv({ cls: 'setting-item-name', text: 'Default options' })
    ;(heading as any).createDiv({
      cls: 'setting-item-description',
      text: 'Configure default options. They can be overridden per codeblock when inserting the table of contents in a page.',
    })

    // Using any types for Obsidian UI components since they're not fully typed
    new SettingGroup(containerEl)
      .setHeading(heading)
      .addSetting((setting: any) =>
        setting
          .setName('Title')
          .setDesc(
            'Title to display before the table of contents (supports Markdown). Use empty string for no title.',
          )
          .addText((text: any) =>
            text
              .setPlaceholder('')
              .setValue(this.plugin.settings.defaultTitle)
              .onChange(async (value: string) => {
                this.plugin.settings.defaultTitle = value
                await this.plugin.saveSettings()
              }),
          ),
      )
      .addSetting((setting: any) =>
        setting
          .setName('Style')
          .setDesc('Table of contents style')
          .addDropdown((dropdown: any) =>
            dropdown
              .addOption('nestedList', 'Nested List')
              .addOption('nestedOrderedList', 'Nested Ordered List')
              .addOption('inlineFirstLevel', 'Inline First Level')
              .setValue(this.plugin.settings.defaultStyle)
              .onChange(async (value: string) => {
                this.plugin.settings.defaultStyle = value as PluginSettings['defaultStyle']
                await this.plugin.saveSettings()
              }),
          ),
      )
      .addSetting((setting: any) =>
        setting
          .setName('Minimum level')
          .setDesc('Include headings from the specified level (0 for no limit)')
          .addText((text: any) =>
            text
              .setPlaceholder('0')
              .setValue(String(this.plugin.settings.defaultMinLevel))
              .onChange(async (value: string) => {
                const numValue = Number.parseInt(value, 10)
                if (!Number.isNaN(numValue) && numValue >= 0) {
                  this.plugin.settings.defaultMinLevel = numValue
                  await this.plugin.saveSettings()
                } else {
                  // Reset to current valid value on invalid input
                  text.setValue(String(this.plugin.settings.defaultMinLevel))
                }
              }),
          ),
      )
      .addSetting((setting: any) =>
        setting
          .setName('Maximum level')
          .setDesc('Include headings up to the specified level (0 for no limit)')
          .addText((text: any) =>
            text
              .setPlaceholder('0')
              .setValue(String(this.plugin.settings.defaultMaxLevel))
              .onChange(async (value: string) => {
                const numValue = Number.parseInt(value, 10)
                if (!Number.isNaN(numValue) && numValue >= 0) {
                  this.plugin.settings.defaultMaxLevel = numValue
                  await this.plugin.saveSettings()
                } else {
                  // Reset to current valid value on invalid input
                  text.setValue(String(this.plugin.settings.defaultMaxLevel))
                }
              }),
          ),
      )
      .addSetting((setting: any) =>
        setting
          .setName('Include links')
          .setDesc('Make headings clickable')
          .addToggle((toggle: any) =>
            toggle
              .setValue(this.plugin.settings.defaultIncludeLinks)
              .onChange(async (value: boolean) => {
                this.plugin.settings.defaultIncludeLinks = value
                await this.plugin.saveSettings()
              }),
          ),
      )
      .addSetting((setting: any) =>
        setting
          .setName('Hide when empty')
          .setDesc('Hide TOC if no headings are found')
          .addToggle((toggle: any) =>
            toggle
              .setValue(this.plugin.settings.defaultHideWhenEmpty)
              .onChange(async (value: boolean) => {
                this.plugin.settings.defaultHideWhenEmpty = value
                await this.plugin.saveSettings()
              }),
          ),
      )
  }
}
