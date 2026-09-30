# Lighthouse and SEO audit — 30 September 2026

The existing live site already passed Lighthouse's accessibility, best practices, and SEO checks. The live mobile performance scores were 96 for the homepage and 98 for Variables. The updated local production build scored 100 in all four categories on every page/device combination tested below.

## Measurements

Lighthouse 13.5.0; a separate headless Chrome session per audit, default simulated mobile throttling or the desktop preset. These are individual laboratory runs, not field Core Web Vitals or measurements from India. Scores can vary by device, location, and run.

| Page and environment | Performance | Accessibility | Best practices | SEO | LCP | Blocking time | Layout shift |
|---|---:|---:|---:|---:|---:|---:|---:|
| Live homepage · mobile | 96 | 100 | 100 | 100 | 1.8 s | 170 ms | 0 |
| Live Variables · mobile | 98 | 100 | 100 | 100 | 1.0 s | 160 ms | 0 |
| Local Arrays before · mobile | 100 | 100 | 100 | 100 | 1.3 s | 0 ms | 0 |
| Updated homepage · mobile | 100 | 100 | 100 | 100 | 1.1 s | 0 ms | 0 |
| Updated Variables · mobile | 100 | 100 | 100 | 100 | 1.2 s | 0 ms | 0 |
| Updated Arrays · mobile | 100 | 100 | 100 | 100 | 1.2 s | 0 ms | 0 |
| Updated homepage · desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 ms | 0 |
| Updated Arrays · desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 ms | 0 |

Local analytics are disabled by the site's existing production-host allowlist. The live and local performance scores therefore cannot be treated as a before/after measurement of these edits. The local Arrays before/after comparison uses the same environment. Its score was already 100; the measurable reduction is in first-party JavaScript loaded before interaction: **21,817 bytes → 6,777 bytes (69% less, before compression)**. The two AI bundles are fetched only after opening the panel. The baseline and final network logs verify this.

The live reports identify Google Analytics and PostHog as the largest remaining JavaScript cost, including about 123 KiB of unused vendor code during initial loading. Analytics behavior and its event collection are unchanged. Post-deployment auditing is needed to measure the changes with the production hosting and analytics together.

## Changes

- Load the optional AI panel and provider client on demand through a 457-byte loader. Reopening the panel does not duplicate initialization; failed downloads show a recovery message.
- Use “JavaScript concepts explained simply” as the homepage H1 and a beginner-focused meta description.
- Put each concept's descriptive MDN documentation link outside the collapsed AI panel, available with JavaScript disabled.
- Enforce an 8 KiB ceiling on initial first-party JavaScript and verify generated lazy imports, unique titles, and metadata in the test suite.

All 40 concept definitions and examples retain their approved wording. The five new definitions remain under 30 words.

## SEO verification

The site generates the homepage and all 40 concept pages as static HTML, with one H1 per page, unique titles and descriptions, self-referencing canonical URLs, real internal links, and structured WebSite, WebPage, BreadcrumbList, TechArticle, and DefinedTerm data. All 41 indexable URLs appear in the sitemap; robots.txt points to it. The 404 page is marked noindex. Tests resolve every internal link and execute all examples.

The live non-www Variables URL redirects to the canonical www URL. At audit time the five new topics and these optimizations remained local; the live Arrays URL returned 404. They need publishing before Google can discover the new pages.

Lighthouse's SEO category covers technical checks. Search visibility also depends on useful content and links, as described in [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide). See [Lighthouse documentation](https://developer.chrome.com/docs/lighthouse/overview/) for audit interpretation.

## Reproduce

Use Node.js 22 and an installed Chrome browser. Start the production-output preview with `npm run dev`, then substitute its printed port:

```sh
npm test
mkdir -p reports/lighthouse
npx --yes lighthouse@13.5.0 http://127.0.0.1:PORT/javascript-arrays/ --chrome-flags="--headless --no-sandbox" --output=json --output=html --output-path=reports/lighthouse/arrays-mobile
npx --yes lighthouse@13.5.0 http://127.0.0.1:PORT/javascript-arrays/ --preset=desktop --chrome-flags="--headless --no-sandbox" --output=json --output=html --output-path=reports/lighthouse/arrays-desktop
```

Repeat for the homepage and Variables. After publishing, run the same commands with the production URLs to include real hosting and analytics. Reports are ignored by Git.

## Saved evidence

The eight HTML and JSON reports are saved locally under `reports/lighthouse/2026-09-30/`:

- [Live homepage · mobile](../reports/lighthouse/2026-09-30/live-home-mobile.report.html)
- [Live Variables · mobile](../reports/lighthouse/2026-09-30/live-variables-mobile.report.html)
- [Local Arrays before · mobile](../reports/lighthouse/2026-09-30/before-arrays-mobile.report.html)
- [Updated homepage · mobile](../reports/lighthouse/2026-09-30/after-home-mobile.report.html)
- [Updated Variables · mobile](../reports/lighthouse/2026-09-30/after-variables-mobile.report.html)
- [Updated Arrays · mobile](../reports/lighthouse/2026-09-30/after-arrays-mobile.report.html)
- [Updated homepage · desktop](../reports/lighthouse/2026-09-30/after-home-desktop.report.html)
- [Updated Arrays · desktop](../reports/lighthouse/2026-09-30/after-arrays-desktop.report.html)

Validation: **85 tests passed**; all 40 examples executed; all five updated Lighthouse runs scored 100 in all four categories. The AI panel and connection dialog were also opened successfully in the browser after lazy loading.
