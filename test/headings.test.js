const { getMarkdownFromHeadings } = require('../src/headings.js')
const { parseOptionsFromSourceText } = require('../src/options.js')

describe('Headings', () => {
  test('Returns default message if no headings', () => {
    const options = parseOptionsFromSourceText('')
    const md = getMarkdownFromHeadings([], options)
    expect(md).toContain('no headings found')
  })

  test('Returns empty TOC if no headings & option enabled', () => {
    const options = parseOptionsFromSourceText('')
    options.hideWhenEmpty = true
    const md = getMarkdownFromHeadings([], options)
    expect(md).toEqual('')
  })

  test('startAt option only shows headings from specified index', () => {
    const headings = [
      { level: 1, heading: 'First heading' },
      { level: 1, heading: 'Second heading' },
      { level: 1, heading: 'Third heading' },
      { level: 1, heading: 'Fourth heading' },
    ]
    const options = parseOptionsFromSourceText('startAt: 2')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toContain('Third heading')
    expect(md).toContain('Fourth heading')
    expect(md).not.toContain('First heading')
    expect(md).not.toContain('Second heading')
  })

  test('startAt with inlineFirstLevel style', () => {
    const headings = [
      { level: 1, heading: 'First heading' },
      { level: 1, heading: 'Second heading' },
      { level: 1, heading: 'Third heading' },
      { level: 1, heading: 'Fourth heading' },
    ]
    const options = parseOptionsFromSourceText('style: inlineFirstLevel\nstartAt: 1')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toContain('Second heading')
    expect(md).toContain('Third heading')
    expect(md).toContain('Fourth heading')
    expect(md).not.toContain('First heading')
  })

  test('startAt greater than headings count returns empty', () => {
    const headings = [
      { level: 1, heading: 'First heading' },
      { level: 1, heading: 'Second heading' }
    ]
    const options = parseOptionsFromSourceText('startAt: 5\nhideWhenEmpty: true')
    const md = getMarkdownFromHeadings(headings, options)
    expect(md).toEqual('')
  })
})
