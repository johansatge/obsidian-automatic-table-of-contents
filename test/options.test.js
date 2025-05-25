const { parseOptionsFromSourceText } = require('../src/options.js')

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
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On minLevel', () => {
      try {
        const options = parseOptionsFromSourceText('minLevel: -1')
        expect(options.minLevel).toEqual('Should have thrown')
      } catch (error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On maxLevel', () => {
      try {
        const options = parseOptionsFromSourceText('maxLevel: -1')
        expect(options.maxLevel).toEqual('Should have thrown')
      } catch (error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On include', () => {
      try {
        const options = parseOptionsFromSourceText('include: [)')
        expect(options.include).toEqual('Should have thrown')
      } catch (error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On exclude', () => {
      try {
        const options = parseOptionsFromSourceText('exclude: /test')
        expect(options.exclude).toEqual('Should have thrown')
      } catch (error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On includeLinks', () => {
      try {
        const options = parseOptionsFromSourceText('includeLinks: no')
        expect(options.includeLinks).toEqual('Should have thrown')
      } catch (error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On hideWhenEmpty', () => {
      try {
        const options = parseOptionsFromSourceText('hideWhenEmpty: maybe')
        expect(options.hideWhenEmpty).toEqual('Should have thrown')
      } catch (error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On debugInConsole', () => {
      try {
        const options = parseOptionsFromSourceText('debugInConsole: yes')
        expect(options.debugInConsole).toEqual('Should have thrown')
      } catch (error) {
        expect(error.message).toContain('Invalid value')
      }
    })
  })
})
