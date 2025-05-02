function sanitizeMd(md) {
  return md.replaceAll('  ', '\t').replace(/^\n/, '').replace(/\n$/, '')
}

const testStandardHeadings = [
  { heading: 'Title 1 level 1', level: 1 },
  { heading: 'Title 1 level 2', level: 2 },
  { heading: 'Title 1 level 3', level: 3 },
  { heading: '', level: 3 },
  { heading: 'Title 2 level 1', level: 1 },
  { heading: 'Title 3 level 1', level: 1 },
  { heading: 'Title 3 level 2', level: 2 },
]

const testHeadingsWithoutFirstLevel = [
  { heading: 'Title 1 level 2', level: 2 },
  { heading: 'Title 1 level 3', level: 3 },
  { heading: 'Title 1 level 4', level: 4 },
  { heading: 'Title 2 level 2', level: 2 },
  { heading: 'Title 3 level 2', level: 2 },
  { heading: 'Title 3 level 3', level: 3 },
]

const testHeadingsWithSpecialChars = [
  {
    heading:
      'Title 1 `level 1` {with special chars}, **bold**, _italic_,#a-tag, ==highlighted== and ~~strikethrough~~ text',
    level: 1,
  },
  { heading: 'Title 1 level 2 <em style="color: black">with HTML</em>', level: 2 },
  {
    heading: 'Title 1 level 2 [[wikilink1]] [[wikilink2|wikitext2]] [mdlink](https://mdurl)',
    level: 2,
  },
  { heading: 'Title 1 level 2 [[malformedlink a pi|pe | and [other chars]', level: 2 },
]

module.exports = {
  sanitizeMd,
  testStandardHeadings,
  testHeadingsWithoutFirstLevel,
  testHeadingsWithSpecialChars,
}
