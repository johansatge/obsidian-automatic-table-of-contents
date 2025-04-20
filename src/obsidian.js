let Plugin = class {}
let MarkdownRenderer = {}
let MarkdownRenderChild = class {}
let htmlToMarkdown = (html) => html

if (isObsidian()) {
  const obsidian = require('obsidian')
  Plugin = obsidian.Plugin
  MarkdownRenderer = obsidian.MarkdownRenderer
  MarkdownRenderChild = obsidian.MarkdownRenderChild
  htmlToMarkdown = obsidian.htmlToMarkdown
}

module.exports = {
  Plugin,
  MarkdownRenderer,
  MarkdownRenderChild,
  htmlToMarkdown,
}

function isObsidian() {
  if (typeof process !== 'object') {
    return true // Obsidian mobile doesn't have a global process object
  }
  return !process.env || !process.env.JEST_WORKER_ID // Jest runtime is not Obsidian
}
