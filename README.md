# JavaScript in less than 30 words

[Website](https://www.javascriptin30words.com/)

This project's purpose is to serve as a pre-interview refresher.

It is also my attempt to describe both basic and more advanced JavaScript concepts in less than 30 words.

Distilling complex ideas into simple notions is a key tenet of effective communication and I hope this project encourages me and others to practice this skill.

**Contributions are welcome and encouraged.**

[Contributing guidelines](https://github.com/msmfa/javascript-in-30/blob/master/CONTRIBUTING.md)

A side aim of this project is to allow other junior members of the community to learn how to contribute to open source projects. A goal of the project is to crowdsource the easiest to understand and most accurate definitions of various elements of JavaScript.

## Run locally

Use Node.js 22 or newer. Install the dependencies before starting the local site.

```sh
npm ci
npm run dev
```

Open the local address printed in the terminal. Each concept is a real HTML page, such as `/javascript-closures/`, with its definition and code visible without client-side JavaScript.

## AI panel

Each concept has a collapsible AI panel in place of “What to notice”. Click **AI panel** to expand it, then select **Connect your API key**. Choose OpenAI or Anthropic, enter your API key, and click **Load models**. Select a model returned for your account from the **Model** dropdown, then connect. There is no fixed preset list; loading models makes only read requests and never generates a paid answer. Choose **Other model…** to enter another text model ID available to your account. You can switch models later in **Connection settings**. Connecting checks access to that model without generating an answer. Changing the provider or key clears the loaded list; closing the popup cancels any pending lookup. The AI controls stay disabled until connected. Then enter a question and select **Submit**, or choose **Explain simply**, **Walk through the code**, or **Quiz me**. Each request includes the current definition, code, expected output, and the last five conversation exchanges. Stop cancels a pending request; Clear conversation starts fresh.

Keys stay in page memory by default and are cleared when leaving or reloading the page. **Remember this connection in this tab** optionally stores the key in `sessionStorage` so it survives reloads and navigation between concepts in that tab. Disconnect clears the connection and conversation. Requests go directly from the visitor's browser to their selected provider; the site has no AI proxy, stores no keys on its server, and makes no automatic explanation requests. API billing is separate from ChatGPT or Claude subscriptions. Keys need access to the selected model and its model lookup endpoint; some restricted accounts may disallow browser connections.

Model discovery uses the [OpenAI Models API](https://developers.openai.com/api/reference/resources/models/methods/list) or the [Anthropic Models API](https://platform.claude.com/docs/en/api/models/list), including pagination. Known image, audio, embedding, moderation, and specialist model families are omitted from the OpenAI list. That endpoint does not expose endpoint compatibility, so a listed model may still reject a Responses request; custom IDs and clear provider errors remain available. Model lists are kept in page memory, never stored with the key.

The AI panel uses the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text) with `store: false` or the [Anthropic Messages API](https://platform.claude.com/docs/en/api/messages/create). Replies are rendered as text and a limited set of Markdown elements; returned HTML and code are never executed. The static definitions and examples remain available when JavaScript is disabled. The development server and generated hosting headers allow the two AI providers and the configured analytics origins, while blocking inline scripts, injected scripts from other hosts, and form submission.

## Analytics and referrals

Every **Try Practice Pad** link includes `utm_source=javascriptin30words`, `utm_medium=referral`, and `utm_campaign=concept_to_practice`. `utm_content=footer_<concept-slug>` identifies the source concept; the index uses `footer_home`. These tags work without JavaScript. Find them in Practice Pad’s GA4 Traffic acquisition report using Session source/medium and Session campaign, with Session manual ad content for individual concept pages. The footer’s Contact link opens `michael@codemoore.com` in the visitor’s email app.

Public browser identifiers live in `src/analytics-config.js`. The GA4 property **JavaScript in 30 Words** (property `553536097`) belongs to its own **JavaScript in 30 Words** account (`407485855`), alongside Practice Pad and Plastic Brains under the same Google login. The existing property was moved out of Practice Pad without changing its website stream (`15753375499`) or measurement ID (`G-9W8VGXXL0G`). Enhanced measurement is off to avoid automatic form and interaction collection. Optional account data sharing is disabled.

PostHog uses the separate **JavaScript in 30 Words** organization and project (`271088`) in EU Cloud, under the existing PostHog login. The free plan is selected with no payment method added. Its public `phc_` project token is configured in `posthogProjectToken`, with `https://eu.i.posthog.com` ingestion. Never use a personal PostHog API key or an AI provider key in this configuration.

Analytics runs only on the production hostname allowlist. For the owner’s current test, `suppressConsentPrompt: true` starts both SDKs without automatically showing the permission popup. This does not save a consent choice and still respects an existing decline. Set that flag back to `false` to restore the original opt-in behavior, where neither SDK loads before permission. **Privacy** in the footer reopens the choice. Withdrawal clears this site’s GA cookies and its PostHog browser storage and reloads to unload both SDKs; the consent choice persists separately. Localhost and Netlify deploy previews never send events, even with remembered consent. The content, AI connection, and tagged links work independently of analytics.

Tracked events are page views (`page_view` in GA4, `$pageview` in PostHog), `practice_pad_click`, `contact_click`, `output_revealed`, and `ai_panel_opened`. Each includes the page and concept slug. PostHog autocapture, session replay, heatmaps, exception collection, surveys, and person profiles are disabled. Only explicitly permitted properties are sent; URL fragments and unrelated query parameters are removed. Keys, prompts, responses, model selections, and input values are not collected. Google advertising storage, personalization, and signals are disabled. The SDKs load asynchronously when analytics is active. Anonymous analytics will still miss visitors who decline or use blockers.

The site and both analytics integrations are deployed to the custom domain. Test analytics using intercepted network requests; do not enable tracking on localhost or send test traffic to production reports.

## Content and checks

Edit `src/data.js` to change an example, updating `output` to match its console output. Descriptions and `definitionItems` preserve the original site's wording; intentional copy changes must also update the source snapshot in `test/fixtures/original-descriptions.json`. Preserve existing slugs so shared links keep working.

```sh
npm test
npm run build
```

Tests run all 35 examples, compare every description and bullet list with the original site snapshot in `test/fixtures/original-descriptions.json`, check the rendered HTML and internal links, and validate the sitemap. The original wording is preserved even where it exceeds 30 words. The generated site is written to `build/`. The archived image assets in `src/assets/` use lossless WebP; they are not shipped with the site. Code examples are selectable text, with JavaScript syntax highlighting generated at build time using highlight.js.

AI tests use simulated provider responses to check request formats, conversation context, connection validation, storage opt-in, cancellation, and error handling without using a real key or incurring API charges. A live explanation requires a valid visitor-supplied API key and API credits.

The header and favicon share the optimised 64px `src/logo.webp`, served with a content hash and immutable cache headers. `src/logo.svg` is its editable vector source and is not deployed. When changing the logo, export the vector at 64 × 64 pixels with transparency and encode it using lossless WebP before rebuilding.

The interface uses a locally served Latin variable subset of [Manrope](https://fonts.google.com/specimen/Manrope), with regular and medium weights. The 24 KB WOFF2 file is preloaded, content-hashed, and cached; no external font request is made by visitors. Code examples keep their monospace font. The font’s SIL Open Font License is in `src/fonts/OFL.txt` and is copied into the generated assets.

## Deploy

The existing Netlify project deploys the `master` branch. `netlify.toml` sets the build command, publish directory, Node version, and canonical site origin (`SITE_URL`). The production origin is `https://www.javascriptin30words.com`. Cloudflare DNS has a DNS-only `www` CNAME to `javascript-in-30-words.netlify.app` and a flattened apex CNAME to `apex-loadbalancer.netlify.com`. Both names are attached to Netlify, with `www` primary and a provisioned Let's Encrypt certificate. HTTP and the apex redirect to HTTPS on `www`, preserving query parameters. Netlify manages the certificate automatically. For another host, override `SITE_URL` when building.

The GitHub Actions workflow runs a clean install, all tests, and the production build on Node 22 for pull requests and pushes to `master`. Preview and production deployment still use Netlify. Publishing the reviewed branch to `master` replaces the previous site; verify the deployed concept routes, headers, redirects, and analytics consent again after that deployment.

No single-page-app fallback is needed: each route has its own `index.html`, and unknown URLs return the custom 404 page. `sitemap.xml` and `robots.txt` are generated with the selected canonical origin.

## Search discovery

The sitemap at https://www.javascriptin30words.com/sitemap.xml lists the homepage and all 35 concepts; robots.txt advertises it. Each indexable page has one main heading, a unique description, canonical metadata, a WebSite/WebPage graph, and concept breadcrumb structured data. Visible definitions retain the exact original wording. The old Netlify hostname redirects to the custom domain, preserving paths. Preview deployments retain the production canonical URLs.

Google Search Console uses the domain property `sc-domain:javascriptin30words.com`, verified through Cloudflare DNS. Keep the Google ownership TXT record in place. Submit the sitemap in Search Console and Bing Webmaster Tools; those services report discovered, crawled, and indexed pages separately.

After publishing changes, run `npm run indexnow` to notify participating search engines, including Bing, about the 36 sitemap URLs. The script checks that the matching ownership file is publicly accessible before submission. The key in `src/search-config.js` is for public host verification, not a private account credential. IndexNow acceptance and sitemap submission do not guarantee indexing; Google uses Search Console rather than IndexNow.
