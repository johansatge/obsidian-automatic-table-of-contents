# Obsidian Automatic Table Of Contents

[![Version](https://img.shields.io/github/v/release/johansatge/obsidian-automatic-table-of-contents)](https://github.com/johansatge/obsidian-automatic-table-of-contents/releases)
[![Test](https://github.com/johansatge/obsidian-automatic-table-of-contents/actions/workflows/test.yml/badge.svg)](https://github.com/johansatge/obsidian-automatic-table-of-contents/actions)

> An Obsidian plugin to create a table of contents in a note, that updates itself when the note changes

---

![demo](images/demo.gif)

- [Installation](#installation)
- [Usage](#usage)

## Installation

Clone the plugin in your `.obsidian/plugins` directory:

```shell
cd /path/to/your/vault/.obsidian/plugins
git clone git@github.com:johansatge/obsidian-automatic-table-of-contents.git
```

Alternatively, download the [latest release](https://github.com/johansatge/obsidian-automatic-table-of-contents/releases) and unzip it in your `.obsidian/plugins` directory.

## Usage

Insert a codeblock with the `table-of-contents` syntax.

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
| `style` | `nestedList` | Table of contents style (can be `nestedList` or `inlineFirstLevel`) |
| `maxLevel` | `0` | Include headings up to the speficied level (`0` for no limit) |
| `includeLinks` | `true` | Make headings clickable |
| `debugInConsole` | `false` | Print debug info in Obsidian console |

## Changelog

This project uses [semver](http://semver.org/).

| Version | Date | Notes |
| --- | --- | --- |
| `1.0.3` | 2023-09-30 | Fix readme |
| `1.0.2` | 2023-09-25 | Fix output sometimes displaying `undefined` headings |
| `1.0.1` | 2023-09-09 | Fix reference to global `App` instance |
| `1.0.0` | 2023-08-27 | Initial version |

## License

This project is released under the [MIT License](license.md).