# remark-obsidian

Parse and render wiki-style links in markdown especially Obsidian style links.

## What is this ?

Using obsidian, when we type in wiki link syntax for eg. `[[wiki_link]]` it would parse them as anchors.

## Features supported

- [x] Support `[[Internal link]]`
- [x] Support `[[Internal link|With custom text]]`
- [x] Support `[[Internal link#heading]]`
- [x] Support `[[Internal link#heading|With custom text]]`

Future support:
- [ ] Support callouts
- [ ] Support `==highlight text==`
- [ ] Support `![[Embed note]]`
- [ ] Support `![[Embed note#heading]]`

## Installation

```bash
npm install remark-obsidian
```

## Usage

```javascript
const unified = require('unified')
const markdown = require('remark-parse')
const obsidianPlugin = require('remark-obsidian');

let processor = unified()
    .use(markdown, { gfm: true })
    .use(obsidianPlugin)
```

### Configuration options

* `markdownFolder [String]`: A string that points to the content folder.
* `urlPrefix [String]`: A string that adds an Url Prefix .

  The default `hrefTemplate` is:
  
```javascript
(permalink) => `/${permalink}`
```

## Running the tests

```bash
npm run test
```
