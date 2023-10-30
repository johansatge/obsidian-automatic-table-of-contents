const { parseOptionsFromSourceText } = require('../main.js')

describe('Options', () => {
  test('Returns default options if none are specified', () => {
    const options = parseOptionsFromSourceText('')
    expect(options).toEqual({
       style: 'nestedList',
       includeLinks: true,
       maxLevel: 0,
       debugInConsole: false,
    })
  })

  test('Returns custom options if specified', () => {
    const optionsText = `
      style: inlineFirstLevel
      maxLevel: 2
      includeLinks: false
      debugInConsole: true
    `
    const options = parseOptionsFromSourceText(optionsText)
    expect(options).toEqual({
       style: 'inlineFirstLevel',
       includeLinks: false,
       maxLevel: 2,
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

  describe('Throw an error if the option value is invalid', () => {
    test('On style', () => {
      try {
        const options = parseOptionsFromSourceText('style: someInvalidStyle')
        expect(options.style).toEqual('Should have thrown')
      } catch(error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On maxLevel', () => {
      try {
        const options = parseOptionsFromSourceText('maxLevel: -1')
        expect(options.maxLevel).toEqual('Should have thrown')
      } catch(error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On includeLinks', () => {
      try {
        const options = parseOptionsFromSourceText('includeLinks: no')
        expect(options.includeLinks).toEqual('Should have thrown')
      } catch(error) {
        expect(error.message).toContain('Invalid value')
      }
    })
    test('On debugInConsole', () => {
      try {
        const options = parseOptionsFromSourceText('debugInConsole: yes')
        expect(options.debugInConsole).toEqual('Should have thrown')
      } catch(error) {
        expect(error.message).toContain('Invalid value')
      }
    })
  })
})
