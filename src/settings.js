const { PluginSettingTab, Setting, SettingGroup } = require('./obsidian.js')
const { DEFAULT_OPTIONS } = require('./defaults.js')

const DEFAULT_SETTINGS = {
  defaultTitle: DEFAULT_OPTIONS.title,
  defaultStyle: DEFAULT_OPTIONS.style,
  defaultMinLevel: DEFAULT_OPTIONS.minLevel,
  defaultMaxLevel: DEFAULT_OPTIONS.maxLevel,
  defaultIncludeLinks: DEFAULT_OPTIONS.includeLinks,
  defaultHideWhenEmpty: DEFAULT_OPTIONS.hideWhenEmpty,
}

class SettingsTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display() {
    const { containerEl } = this

    containerEl.empty()

    const heading = document.createDocumentFragment()
    heading.createDiv({ cls: 'setting-item-name', text: 'Default options' })
    heading.createDiv({
      cls: 'setting-item-description',
      text: 'Configure default options. They can be overridden per codeblock when inserting the table of contents in a page.',
    })

    new SettingGroup(containerEl)
      .setHeading(heading)
      .addSetting((setting) =>
        setting
          .setName('Title')
          .setDesc(
            'Title to display before the table of contents (supports Markdown). Use empty string for no title.',
          )
          .addText((text) =>
            text
              .setPlaceholder('')
              .setValue(this.plugin.settings.defaultTitle)
              .onChange(async (value) => {
                this.plugin.settings.defaultTitle = value
                await this.plugin.saveSettings()
              }),
          ),
      )
      .addSetting((setting) =>
        setting
          .setName('Style')
          .setDesc('Table of contents style')
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
          ),
      )
      .addSetting((setting) =>
        setting
          .setName('Minimum level')
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
                } else {
                  // Reset to current valid value on invalid input
                  text.setValue(String(this.plugin.settings.defaultMinLevel))
                }
              }),
          ),
      )
      .addSetting((setting) =>
        setting
          .setName('Maximum level')
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
                } else {
                  // Reset to current valid value on invalid input
                  text.setValue(String(this.plugin.settings.defaultMaxLevel))
                }
              }),
          ),
      )
      .addSetting((setting) =>
        setting
          .setName('Include links')
          .setDesc('Make headings clickable by default')
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.defaultIncludeLinks).onChange(async (value) => {
              this.plugin.settings.defaultIncludeLinks = value
              await this.plugin.saveSettings()
            }),
          ),
      )
      .addSetting((setting) =>
        setting
          .setName('Hide when empty')
          .setDesc('Hide table of contents if no headings are found by default')
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.defaultHideWhenEmpty).onChange(async (value) => {
              this.plugin.settings.defaultHideWhenEmpty = value
              await this.plugin.saveSettings()
            }),
          ),
      )
  }
}

module.exports = {
  DEFAULT_SETTINGS,
  SettingsTab,
}
