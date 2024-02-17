# Obsidian Automatic Table Of Contents

[![Version](https://img.shields.io/github/v/release/johansatge/obsidian-automatic-table-of-contents)](https://github.com/johansatge/obsidian-automatic-table-of-contents/releases)
[![Test](https://github.com/johansatge/obsidian-automatic-table-of-contents/actions/workflows/test.yml/badge.svg)](https://github.com/johansatge/obsidian-automatic-table-of-contents/actions)

> An Obsidian plugin to create a table of contents in a note, that updates itself when the note changes

---

![demo](images/demo.gif)

- [Installation](#installation)
- [Usage](#usage)
- [Publish a new version](#publish-a-new-version)
- [Changelog](#changelog)
- [License](#license)
- [Contributing](#contributing)

## Installation

Clone the plugin in your `.obsidian/plugins` directory:

```shell
cd /path/to/your/vault/.obsidian/plugins
git clone git@github.com:johansatge/obsidian-automatic-table-of-contents.git
```

Alternatively, download the [latest release](https://github.com/johansatge/obsidian-automatic-table-of-contents/releases) and unzip it in your `.obsidian/plugins` directory.

## Usage

Insert a codeblock with the `table-of-contents` (or its short version `toc`) syntax.

````
```table-of-contents
option1: value1
option2: value2
```
````

Alternatively, two commands are available in the command palette:

- Insert table of contents
- Insert table of contents (documented)

The following options are available:

| Option | Default value | Description |
| --- | --- | --- |
| `title` | _None_ | Title to display before the table of contents (supports Markdown) |
| `style` | `nestedList` | Table of contents style (can be `nestedList` or `inlineFirstLevel`) |
| `minLevel` | `0` | Include headings from the specified level  (`0` for no limit) |
| `maxLevel` | `0` | Include headings up to the specified level (`0` for no limit) |
| `includeLinks` | `true` | Make headings clickable |
| `debugInConsole` | `false` | Print debug info in Obsidian console |

## Publish a new version

- Push a commit with the new version number as message with:
  - The relevant changelog in `README.md`
  - The new version number in `manifest.json`
- Tag the commit with the version number
- Publish a [new GitHub release](https://github.com/johansatge/obsidian-automatic-table-of-contents/releases/new) with:
  - The version number as title
  - The changelog from `README.md` as description
  - `main.js` and `manifest.json` as attachments
  - _Set as the latest release_ checked

## Changelog

This project uses [semver](http://semver.org/).

| Version | Date | Notes |
| --- | --- | --- |
| `1.2.0` | 2024-01-19 | Introduce `toc` shorthand trigger (fix #19) |
| `1.1.0` | 2024-01-03 | Introduce `minLevel` option ([@ras0q](https://github.com/ras0q)) (fix #11) |
| `1.0.6` | 2023-11-02 | Escape special characters (fix #3) |
| `1.0.5` | 2023-11-01 | Fix plugin activation on mobile (fix #17) |
| `1.0.4` | 2023-10-31 | Support pages with no first level headings (fix #6) |
| `1.0.3` | 2023-09-30 | Fix readme |
| `1.0.2` | 2023-09-25 | Fix output sometimes displaying `undefined` headings |
| `1.0.1` | 2023-09-09 | Fix reference to global `App` instance |
| `1.0.0` | 2023-08-27 | Initial version |

## License

This project is released under the [MIT License](license.md).

## Contributing

Bug reports and feature requests are welcome! More details in the [contribution guidelines](CONTRIBUTING.md).
