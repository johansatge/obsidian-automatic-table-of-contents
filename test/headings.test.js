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
      { level: 1, heading: 'A' },
      { level: 1, heading: 'B' },
      { level: 1, heading: 'C' },
      { level: 1, heading: 'D' },
    ];
    const options = parseOptionsFromSourceText('startAt: 2');
    const md = getMarkdownFromHeadings(headings, options);
    expect(md).toContain('C');
    expect(md).toContain('D');
    expect(md).not.toContain('A');
    expect(md).not.toContain('B');
  });

  test('startAt with inlineFirstLevel style', () => {
    const headings = [
      { level: 1, heading: 'A' },
      { level: 1, heading: 'B' },
      { level: 1, heading: 'C' },
      { level: 1, heading: 'D' },
    ];
    const options = parseOptionsFromSourceText('style: inlineFirstLevel\nstartAt: 1');
    const md = getMarkdownFromHeadings(headings, options);
    expect(md).toContain('B');
    expect(md).toContain('C');
    expect(md).toContain('D');
    expect(md).not.toContain('A');
  });

  test('startAt greater than headings count returns empty', () => {
    const headings = [
      { level: 1, heading: 'A' },
      { level: 1, heading: 'B' }
    ];
    const options = parseOptionsFromSourceText('startAt: 5\nhideWhenEmpty: true');
    const md = getMarkdownFromHeadings(headings, options);
    expect(md).toEqual('');
  });
})
