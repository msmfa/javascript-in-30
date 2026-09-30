# Site maintenance

The AI panel and provider client load only when opened. Tests keep initial first-party JavaScript below 8 KiB and verify that repeated opens share one load.

## Content and checks

Edit `src/data.js` to change an example, updating `output` to match its console output. Descriptions and `definitionItems` preserve the original site's wording; intentional copy changes must also update the source snapshot in `test/fixtures/original-descriptions.json`. New topics use `test/fixtures/new-descriptions.json` and must keep their complete definition under 30 words. Preserve existing slugs so shared links keep working.

```sh
npm test
npm run build
```

Tests run all 40 examples, compare every description and bullet list with its source snapshot, check the rendered HTML and internal links, and validate the sitemap. The original 35 definitions are preserved even where they exceed 30 words. The five new beginner topics—arrays, objects, if/else, DOM, and events—have definitions of fewer than 30 words, enforced by the tests. Examples marked `environment: 'browser'` run with a document supplied by LinkeDOM during tests; readers can paste them into a browser console. LinkeDOM is only a development dependency and is not shipped to visitors. The generated site is written to `build/`. The archived image assets in `src/assets/` use lossless WebP; they are not shipped with the site. Code examples are selectable text, with JavaScript syntax highlighting generated at build time using highlight.js.

AI tests use simulated provider responses to check request formats, conversation context, connection validation, storage opt-in, cancellation, and error handling without using a real key or incurring API charges. A live explanation requires a valid visitor-supplied API key and API credits.

The header and favicon share the optimised 64px `src/logo.webp`, served with a content hash and immutable cache headers. `src/logo.svg` is its editable vector source and is not deployed. When changing the logo, export the vector at 64 × 64 pixels with transparency and encode it using lossless WebP before rebuilding.

The interface uses a locally served Latin variable subset of [Manrope](https://fonts.google.com/specimen/Manrope), with regular and medium weights. The 24 KB WOFF2 file is preloaded, content-hashed, and cached; no external font request is made by visitors. Code examples keep their monospace font. The font’s SIL Open Font License is in `src/fonts/OFL.txt` and is copied into the generated assets.

## Lighthouse and SEO

See [the Lighthouse audit](lighthouse-audit.md) for measured mobile and desktop scores, the audit commands, and the distinction between production and local results. Site tests also verify unique page titles and descriptions, canonical URLs, crawlable links, structured data, the sitemap, and the non-indexable 404 page.

## AI crawler access

The current `robots.txt` permits all crawlers, including search and training crawlers. Search visibility and training permissions are separate controls; see the [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots), [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), and [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). Keep hosting-level bot restrictions in mind when diagnosing blocked requests; a successful request with a crawler user-agent does not verify access from that provider's actual IP addresses or prove indexing.

The build generates `/llms.txt` from `src/data.js`, with links to every canonical concept page and its existing definition. Indexable HTML pages point to it with `rel="describedby"`. This follows the optional [llms.txt proposal](https://llmstxt.org/) as a discovery aid and adds no client-side JavaScript. The HTML remains the complete source for examples and expected output. This file does not guarantee citations or rankings; [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features) says no special AI text file or schema is required.
