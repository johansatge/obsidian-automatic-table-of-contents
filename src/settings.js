const { PluginSettingTab, Setting } = require('./obsidian.js')

const DEFAULT_SETTINGS = {
  defaultTitle: '## Table of Contents',
  defaultStyle: 'nestedList',
  defaultMinLevel: 0,
  defaultMaxLevel: 0,
  defaultIncludeLinks: true,
  defaultHideWhenEmpty: false,
}

class SettingsTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display() {
    const { containerEl } = this

    containerEl.empty()
    containerEl.createEl('h2', { text: 'Automatic Table of Contents Settings' })

    new Setting(containerEl)
      .setName('Default title')
      .setDesc(
        'Default title to display before the table of contents (supports Markdown). Use empty string for no title.',
      )
      .addText((text) =>
        text
          .setPlaceholder('## Table of Contents')
          .setValue(this.plugin.settings.defaultTitle)
          .onChange(async (value) => {
            this.plugin.settings.defaultTitle = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(containerEl)
      .setName('Default style')
      .setDesc('Default table of contents style')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('nestedList', 'Nested List')
          .addOption('nestedOrderedList', 'Nested Ordered List')
          .addOption('inlineFirstLevel', 'Inline First Level')
          .setValue(this.plugin.settings.defaultStyle)
          .onChange(async (value) => {
            this.plugin.settings.defaultStyle = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(containerEl)
      .setName('Default minimum level')
      .setDesc('Include headings from the specified level (0 for no limit)')
      .addText((text) =>
        text
          .setPlaceholder('0')
          .setValue(String(this.plugin.settings.defaultMinLevel))
          .onChange(async (value) => {
            const numValue = Number.parseInt(value)
            if (!Number.isNaN(numValue) && numValue >= 0) {
              this.plugin.settings.defaultMinLevel = numValue
              await this.plugin.saveSettings()
            }
          }),
      )

    new Setting(containerEl)
      .setName('Default maximum level')
      .setDesc('Include headings up to the specified level (0 for no limit)')
      .addText((text) =>
        text
          .setPlaceholder('0')
          .setValue(String(this.plugin.settings.defaultMaxLevel))
          .onChange(async (value) => {
            const numValue = Number.parseInt(value)
            if (!Number.isNaN(numValue) && numValue >= 0) {
              this.plugin.settings.defaultMaxLevel = numValue
              await this.plugin.saveSettings()
            }
          }),
      )

    new Setting(containerEl)
      .setName('Default include links')
      .setDesc('Make headings clickable by default')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.defaultIncludeLinks).onChange(async (value) => {
          this.plugin.settings.defaultIncludeLinks = value
          await this.plugin.saveSettings()
        }),
      )

    new Setting(containerEl)
      .setName('Default hide when empty')
      .setDesc('Hide table of contents if no headings are found by default')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.defaultHideWhenEmpty).onChange(async (value) => {
          this.plugin.settings.defaultHideWhenEmpty = value
          await this.plugin.saveSettings()
        }),
      )
  }
}

module.exports = {
  DEFAULT_SETTINGS,
  SettingsTab,
}
