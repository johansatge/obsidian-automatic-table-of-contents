import { describe, expect, test } from 'vitest'
import type { PluginSettings } from '../src/options.js'
import { parseOptionsFromSourceText } from '../src/options.js'

describe('Options', () => {
  test('Returns default options if none are specified', () => {
    const options = parseOptionsFromSourceText('')
    expect(options).toEqual({
      title: '',
      style: 'nestedList',
      minLevel: 0,
      maxLevel: 0,
      include: null,
      exclude: null,
      includeLinks: true,
      hideWhenEmpty: false,
      debugInConsole: false,
    })
  })

  test('Returns custom options if specified', () => {
    const optionsText = `
      title: # Some title
      style: inlineFirstLevel # Some comment
      minLevel: 1
      maxLevel:  2   # Some other comment
      include: /test1/
      exclude: /test#2/gi
      includeLinks: false
      hideWhenEmpty: true
      debugInConsole: true
    `
    const options = parseOptionsFromSourceText(optionsText)
    expect(options).toEqual({
      title: '# Some title',
      style: 'inlineFirstLevel',
      minLevel: 1,
      maxLevel: 2,
      include: /test1/,
      exclude: /test#2/gi,
      includeLinks: false,
      hideWhenEmpty: true,
      debugInConsole: true,
    })
  })

  test('Accepts comments in options', () => {
    const options = parseOptionsFromSourceText('maxLevel: 5 # some comment')
    expect(options.maxLevel).toEqual(5)
  })

  test('Ignores unknown options', () => {
    const options = parseOptionsFromSourceText(`
      maxLevel:    5
      someOption:  someValue
    `)
    expect(options.maxLevel).toEqual(5)
  })

  test('Ignores empty regexes', () => {
    const options = parseOptionsFromSourceText(`
      include: 
      exclude: null
    `)
    expect(options.include).toBeNull()
    expect(options.exclude).toBeNull()
  })

  describe('Throw an error if the option value is invalid', () => {
    test('On style', () => {
      try {
        const options = parseOptionsFromSourceText('style: someInvalidStyle')
        expect(options.style).toEqual('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid value')
      }
    })
    test('On minLevel', () => {
      try {
        const options = parseOptionsFromSourceText('minLevel: -1')
        expect(options.minLevel).toEqual('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid value')
      }
    })
    test('On maxLevel', () => {
      try {
        const options = parseOptionsFromSourceText('maxLevel: -1')
        expect(options.maxLevel).toEqual('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid value')
      }
    })
    test('On include', () => {
      try {
        const options = parseOptionsFromSourceText('include: [)')
        expect(options.include).toEqual('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid value')
      }
    })
    test('On exclude', () => {
      try {
        const options = parseOptionsFromSourceText('exclude: /test')
        expect(options.exclude).toEqual('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid value')
      }
    })
    test('On includeLinks', () => {
      try {
        const options = parseOptionsFromSourceText('includeLinks: no')
        expect(options.includeLinks).toEqual('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid value')
      }
    })
    test('On hideWhenEmpty', () => {
      try {
        const options = parseOptionsFromSourceText('hideWhenEmpty: maybe')
        expect(options.hideWhenEmpty).toEqual('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid value')
      }
    })
    test('On debugInConsole', () => {
      try {
        const options = parseOptionsFromSourceText('debugInConsole: yes')
        expect(options.debugInConsole).toEqual('Should have thrown')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid value')
      }
    })
  })

  describe('Plugin settings integration', () => {
    test('Uses plugin settings as defaults when provided', () => {
      const pluginSettings: PluginSettings = {
        defaultTitle: '## Custom Title',
        defaultStyle: 'nestedOrderedList',
        defaultMinLevel: 2,
        defaultMaxLevel: 4,
        defaultIncludeLinks: false,
        defaultHideWhenEmpty: true,
      }
      const options = parseOptionsFromSourceText('', pluginSettings)
      expect(options).toEqual({
        title: '## Custom Title',
        style: 'nestedOrderedList',
        minLevel: 2,
        maxLevel: 4,
        include: null,
        exclude: null,
        includeLinks: false,
        hideWhenEmpty: true,
        debugInConsole: false,
      })
    })

    test('Allows codeblock to override plugin settings', () => {
      const pluginSettings: PluginSettings = {
        defaultTitle: '## Custom Title',
        defaultStyle: 'nestedOrderedList',
        defaultMinLevel: 2,
        defaultMaxLevel: 4,
        defaultIncludeLinks: false,
        defaultHideWhenEmpty: true,
      }
      const optionsText = `
        title: ## Override Title
        style: inlineFirstLevel
        minLevel: 1
        maxLevel: 3
        includeLinks: true
      `
      const options = parseOptionsFromSourceText(optionsText, pluginSettings)
      expect(options.title).toBe('## Override Title')
      expect(options.style).toBe('inlineFirstLevel')
      expect(options.minLevel).toBe(1)
      expect(options.maxLevel).toBe(3)
      expect(options.includeLinks).toBe(true)
      // hideWhenEmpty should keep plugin setting when not overridden
      expect(options.hideWhenEmpty).toBe(true)
    })

    test('Allows explicitly setting empty string to override plugin title', () => {
      const pluginSettings: PluginSettings = {
        defaultTitle: '## Custom Title',
        defaultStyle: 'nestedList',
        defaultMinLevel: 0,
        defaultMaxLevel: 0,
        defaultIncludeLinks: true,
        defaultHideWhenEmpty: false,
      }
      const options = parseOptionsFromSourceText('title: null', pluginSettings)
      expect(options.title).toBe('')
    })

    test('Falls back to hardcoded defaults when no plugin settings provided', () => {
      const options = parseOptionsFromSourceText('')
      expect(options.title).toBe('')
      expect(options.style).toBe('nestedList')
      expect(options.minLevel).toBe(0)
      expect(options.includeLinks).toBe(true)
    })
  })
})
