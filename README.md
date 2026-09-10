# Javascript in less than 30 words

[Website](https://www.javascriptin30words.com/)

This projects purpose is to serve as a pre-interview refresher.

It is also my attempt to describe both basic and more advanced Javascript concepts in less than 30 words.

Distilling complex ideas into simple notions is a key tenant of effective communication and I hope this project encourages me and others to practice this skill.

**Contributions are welcome and encouraged.**

[Contributing guidelines](https://github.com/msmfa/javascript-in-30/blob/master/CONTRIBUTING.md)

A side aim of this project is to allow other junior members of the community to learn how to contribute to open source projects. A goal of the project is to crowdsource the easiest to understand and most accurate definitions of various elements of Javascript.

## Run locally

Use Node.js 22 or newer. Building and testing use Node's built-in modules; no dependency installation is required.

```sh
npm run dev
```

Open the local address printed in the terminal. Each concept is a real HTML page, such as `/javascript-closures/`, with its definition and code visible without client-side JavaScript.

## Content and checks

Edit `src/data.js` to change a definition or example. Keep the definition to 30 words or fewer and update `output` to match the example's console output. Preserve existing slugs so shared links keep working.

```sh
npm test
npm run build
```

Tests run all 35 examples, verify the definition word limit, check the rendered HTML and internal links, and validate the sitemap. The generated site is written to `build/`. The original image assets remain in `src/assets/`; code examples are now selectable text.

## Deploy

The existing Netlify project deploys the `master` branch. `netlify.toml` sets the build command, publish directory, Node version, and canonical site origin (`SITE_URL`). The production origin is `https://www.javascriptin30words.com`; connect the registered domain in Netlify and verify HTTPS before publishing this configuration. For another host, override `SITE_URL` when building.

No single-page-app fallback is needed: each route has its own `index.html`, and unknown URLs return the custom 404 page. `sitemap.xml` and `robots.txt` are generated with the selected canonical origin.
