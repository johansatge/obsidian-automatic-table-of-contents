import type { TableOfContentsOptions } from './defaults.js'
import { htmlToMarkdown } from './obsidian.js'

/**
 * Check if a heading should be included based on include/exclude filters
 * @param label - The heading text to check against filters
 * @param options - Configuration options containing include/exclude patterns
 * @returns True if the heading passes the filters and should be included
 */
export function isHeadingAllowed(label: string, options: TableOfContentsOptions): boolean {
  if (options.include) {
    return options.include.test(label)
  }
  if (options.exclude) {
    return !options.exclude.test(label)
  }
  return true
}

/**
 * Get formatted markdown for the given label (either the label itself, or a sanitized link)
 * @param label - The raw label, might contain Markdown
 * @param options - Global options object
 * @return Formatted markdown string
 */
export function getFormattedMarkdownHeading(
  label: string,
  options: TableOfContentsOptions,
): string {
  if (options.includeLinks) {
    // Remove markdown, HTML & wikilinks from text for readability, as they are not rendered in a wikilink
    let text = label
    text = stripMarkdown(text)
    text = stripHtml(text)
    text = stripWikilinks(text, false)
    // Remove wikilinks & tags from link or it won't be clickable (on the other hand HTML & markdown must stay)
    let link = label
    link = stripWikilinks(link, true)
    link = stripTags(link)

    // Return wiklink style link
    return `[[#${link}|${text}]]`
    // Why not markdown links? Because even if it looks like the text part would have a better compatibility
    // with complex headings (as it would support HTML, markdown, etc) the link part is messy,
    // because it requires some encoding that looks buggy and undocumented; official docs state the link must be URL encoded
    // (https://help.obsidian.md/Linking+notes+and+files/Internal+links#Supported+formats+for+internal+links)
    // but it doesn't work properly, example: "## Some <em>heading</em> with simple HTML" must be encoded as:
    // [Some <em>heading</em> with simple HTML](#Some%20<em>heading</em>%20with%20simpler%20HTML)
    // and not
    // [Some <em>heading</em> with simple HTML](#Some%20%3Cem%3Eheading%3C%2Fem%3E%20with%20simpler%20HTML)
    // Also it won't be clickable at all if the heading contains #tags or more complex HTML
    // (example: ## Some <em style="background: red">heading</em> #with-a-tag)
    // (unless there is a way to encode these use cases that I didn't find)
  }
  return label
}

function stripMarkdown(text: string): string {
  return text
    .replaceAll('*', '')
    .replaceAll(/(\W|^)_+(\S)(.*?\S)?_+(\W|$)/g, '$1$2$3$4')
    .replaceAll('`', '')
    .replaceAll('==', '')
    .replaceAll('~~', '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip markdown links
}

function stripHtml(text: string): string {
  return stripMarkdown(htmlToMarkdown(text))
}

function stripWikilinks(text: string, isForLink: boolean): string {
  // Strip [[link|text]] format
  // For the text part of the final link we only keep "text"
  // For the link part we need the text + link
  // Example: "# Some [[file.md|heading]]" must be translated to "[[#Some file.md heading|Some heading]]"
  return (
    text
      .replace(/\[\[([^\]]+)\|([^\]]+)\]\]/g, isForLink ? '$1 $2' : '$2')
      .replace(/\[\[([^\]]+)\]\]/g, '$1') // Strip [[link]] format
      // Replace malformed links & reserved wikilinks chars
      .replaceAll('[[', '')
      .replaceAll('| ', isForLink ? '' : '- ')
      .replaceAll('|', isForLink ? ' ' : '-')
  )
}

function stripTags(text: string): string {
  return text.replaceAll('#', ' ')
}
