const obsidianPlugin = require('..')
const { obsidianPlugin: namedObsidianPlugin } = require('..')

const assert = require('assert')
const unified = require('unified')
const markdown = require('remark-parse')
const visit = require('unist-util-visit')
const select = require('unist-util-select')
const remark2markdown = require('remark-stringify')

describe('remark-obsidian', () => {
  it('parses a wiki link that has a matching permalink', () => {
    const processor = unified()
      .use(markdown)
      .use(obsidianPlugin, {
        permalinks: ['test']
      })

    var ast = processor.parse('[[test]]')
    ast = processor.runSync(ast)

    visit(ast, 'wikiLink', (node) => {
      assert.equal(node.data.permalink, 'test')
      assert.equal(node.data.exists, true)
      assert.equal(node.data.hName, 'a')
      assert.equal(node.data.hProperties.className, 'internal')
      assert.equal(node.data.hProperties.href, '/test')
      assert.equal(node.data.hChildren[0].value, 'test')
    })
  })

  it('parses a wiki link and adds the Url Prefix', () => {
    const processor = unified()
      .use(markdown)
      .use(obsidianPlugin, {
        permalinks: ['test'],
        urlPrefix: 'blog/'
      })

    var ast = processor.parse('[[test]]')
    ast = processor.runSync(ast)

    visit(ast, 'wikiLink', (node) => {
      assert.equal(node.data.permalink, 'blog/test')
      assert.equal(node.data.hName, 'a')
      assert.equal(node.data.hProperties.href, '/blog/test')
      assert.equal(node.data.hChildren[0].value, 'test')
      assert.equal(node.data.exists, false) // TODO: investigate if this should be true
      assert.equal(node.data.hProperties.className, 'internal new') // TODO: investigate if this should be just 'internal'
    })
  })

  it('parses a wiki link that has no matching permalink', () => {
    const processor = unified()
      .use(markdown)
      .use(obsidianPlugin, {
        permalinks: []
      })

    var ast = processor.parse('[[New Page]]')
    ast = processor.runSync(ast)

    visit(ast, 'wikiLink', (node) => {
      assert.equal(node.data.exists, false)
      assert.equal(node.data.permalink, 'new-page')
      assert.equal(node.data.hName, 'a')
      assert.equal(node.data.hProperties.className, 'internal new')
      assert.equal(node.data.hProperties.href, '/new-page')
      assert.equal(node.data.hChildren[0].value, 'New Page')
    })
  })

  it('handles wiki alias links with custom divider', () => {
    const processor = unified()
      .use(markdown)
      .use(obsidianPlugin, {
        permalinks: ['example/test']
      })

    var ast = processor.parse('[[example/test|custom text]]')
    ast = processor.runSync(ast)

    visit(ast, 'wikiLink', node => {
      assert.equal(node.data.exists, true)
      assert.equal(node.data.permalink, 'example/test')
      assert.equal(node.data.hName, 'a')
      assert.equal(node.data.alias, 'custom text')
      assert.equal(node.value, 'example/test')
      assert.equal(node.data.hProperties.className, 'internal')
      assert.equal(node.data.hProperties.href, '/example/test')
      assert.equal(node.data.hChildren[0].value, 'custom text')
    })
  })

  it('handles wiki links with heading', () => {
    const processor = unified()
      .use(markdown)
      .use(obsidianPlugin, {
        permalinks: ['example/test']
      })

    var ast = processor.parse('[[example/test#with heading]]')
    ast = processor.runSync(ast)

    visit(ast, 'wikiLink', node => {
      assert.equal(node.data.exists, true)
      assert.equal(node.data.permalink, 'example/test#with-heading')
      assert.equal(node.data.hName, 'a')
      assert.equal(node.data.hProperties.className, 'internal')
      assert.equal(node.data.hProperties.href, '/example/test#with-heading')
      assert.equal(node.data.hChildren[0].value, 'example/test#with heading')
    })
  })

  // it('handles wiki links with heading and custom Url prefix', () => {
  //   const processor = unified()
  //     .use(markdown)
  //     .use(obsidianPlugin, {
  //       permalinks: ['example/test'],
  //       urlPrefix: 'blog/'
  //     })
  //
  //   var ast = processor.parse('[[example/test#with heading]]')
  //   ast = processor.runSync(ast)
  //
  //   visit(ast, 'wikiLink', node => {
  //     assert.equal(node.data.permalink, '/blog/example/test#with-heading')
  //     assert.equal(node.data.hName, 'a')
  //     assert.equal(node.data.hProperties.href, '/blog/example/test#with-heading')
  //     assert.equal(node.data.hChildren[0].value, '/blog/example/test#with heading')
  //     // TODO: investigate if this should be false
  //     assert.equal(node.data.exists, false)
  //     assert.equal(node.data.hProperties.className, 'internal new')
  //   })
  // })

  it('handles wiki alias links with heading and custom divider', () => {
    const processor = unified()
      .use(markdown)
      .use(obsidianPlugin, {
        permalinks: ['example/test']
      })

    var ast = processor.parse('[[example/test#with heading|custom text]]')
    ast = processor.runSync(ast)

    visit(ast, 'wikiLink', node => {
      assert.equal(node.data.exists, true)
      assert.equal(node.data.permalink, 'example/test#with-heading')
      assert.equal(node.data.hName, 'a')
      assert.equal(node.data.hProperties.className, 'internal')
      assert.equal(node.data.hProperties.href, '/example/test#with-heading')
      assert.equal(node.data.hChildren[0].value, 'custom text')
    })
  })

  it('handles a wiki link heading within the page', () => {
    const processor = unified()
      .use(markdown)
      .use(obsidianPlugin)

    var ast = processor.parse('[[#Heading]]')
    ast = processor.runSync(ast)

    visit(ast, 'wikiLink', node => {
      assert.equal(node.data.permalink, '#heading')
      assert.equal(node.data.alias, 'Heading')
      assert.equal(node.data.hName, 'a')
      assert.equal(node.data.hProperties.className, 'internal new')
      assert.equal(node.data.hProperties.href, '#heading')
      assert.equal(node.data.hChildren[0].value, 'Heading')
    })
  })

  it('stringifies wiki links', () => {
    const processor = unified()
      .use(markdown, { gfm: true, footnotes: true, yaml: true })
      .use(remark2markdown)
      .use(obsidianPlugin, { permalinks: ['wiki-link'] })

    const stringified = processor.processSync('[[Wiki Link]]').contents.trim()
    assert.equal(stringified, '[[Wiki Link]]')
  })

  it('stringifies aliased wiki links', () => {
    const processor = unified()
      .use(markdown, { gfm: true, footnotes: true, yaml: true })
      .use(remark2markdown)
      .use(obsidianPlugin, {
        aliasDivider: ':'
      })

    const stringified = processor.processSync('[[Real Page:Page Alias]]').contents.trim()
    assert.equal(stringified, '[[Real Page:Page Alias]]')
  })

  context('configuration options', () => {
    it('uses pageResolver', () => {
      const identity = (name) => [name]

      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          pageResolver: identity,
          permalinks: ['A Page']
        })

      var ast = processor.parse('[[A Page]]')
      ast = processor.runSync(ast)

      visit(ast, 'wikiLink', (node) => {
        assert.equal(node.data.exists, true)
        assert.equal(node.data.permalink, 'A Page')
        assert.equal(node.data.hProperties.href, '/A Page')
      })
    })

    it('uses newClassName', () => {
      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          newClassName: 'new_page'
        })

      var ast = processor.parse('[[A Page]]')
      ast = processor.runSync(ast)

      visit(ast, 'wikiLink', (node) => {
        assert.equal(node.data.hProperties.className, 'internal new_page')
      })
    })

    it('uses hrefTemplate', () => {
      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          hrefTemplate: (permalink) => permalink
        })

      var ast = processor.parse('[[A Page]]')
      ast = processor.runSync(ast)

      visit(ast, 'wikiLink', (node) => {
        assert.equal(node.data.hProperties.href, 'a-page')
      })
    })

    it('uses wikiLinkClassName', () => {
      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          wikiLinkClassName: 'wiki_link',
          permalinks: ['a-page']
        })

      var ast = processor.parse('[[A Page]]')
      ast = processor.runSync(ast)

      visit(ast, 'wikiLink', (node) => {
        assert.equal(node.data.hProperties.className, 'wiki_link')
      })
    })
  })

  context('open wiki links', () => {
    it('handles open wiki links', () => {
      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          permalinks: []
        })

      var ast = processor.parse('t[[\nt')
      ast = processor.runSync(ast)

      assert.ok(!select.select('wikiLink', ast))
    })

    it('handles open wiki links at end of file', () => {
      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          permalinks: []
        })

      var ast = processor.parse('t [[')
      ast = processor.runSync(ast)

      assert.ok(!select.select('wikiLink', ast))
    })

    it('handles open wiki links with partial data', () => {
      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          permalinks: []
        })

      var ast = processor.parse('t [[tt\nt')
      ast = processor.runSync(ast)

      assert.ok(!select.select('wikiLink', ast))
    })

    it('handles open wiki links with partial alias divider', () => {
      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          aliasDivider: '::',
          permalinks: []
        })

      var ast = processor.parse('[[t::\n')
      ast = processor.runSync(ast)

      assert.ok(!select.select('wikiLink', ast))
    })

    it('handles open wiki links with partial alias', () => {
      const processor = unified()
        .use(markdown)
        .use(obsidianPlugin, {
          permalinks: []
        })

      var ast = processor.parse('[[t|\n')
      ast = processor.runSync(ast)

      assert.ok(!select.select('wikiLink', ast))
    })
  })

  it('exports the plugin with named exports', () => {
    assert.equal(obsidianPlugin, namedObsidianPlugin)
  })
})
