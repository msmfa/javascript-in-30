# JavaScript in less than 30 words

[Website](https://www.javascriptin30words.com/)

![Browsing the site: the landing page, then the Variables, Functions, Arrow Functions, and Closures concepts](docs/site-walkthrough.gif)

Heading into an interview and need a quick refresher? This is for you.

I built this because I wanted a place to brush up on JavaScript concepts — the kind of things you know but might struggle to explain clearly under pressure. Each concept is described in 30 words or less, which forces clarity over complexity.

If you find a better way to explain something, please share it. Contributions are genuinely welcome.

[Contributing guidelines](https://github.com/msmfa/javascript-in-30/blob/master/CONTRIBUTING.md)

This is also a good place to make your first open source contribution if you've been looking for one. Improving a definition or fixing a typo counts.

## Run locally

You'll need Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open the local address printed in the terminal. Each concept has its own URL (like `/javascript-closures/`) and works even with JavaScript disabled.

## AI panel

Each concept page has a collapsible AI panel. Expand it, connect your OpenAI or Anthropic API key, pick a model, and you can ask it to explain the concept simply, walk through the code, or quiz you on it.

Your key stays in page memory and is never sent to our server — requests go straight from your browser to the provider. It clears when you leave or reload the page, unless you choose to remember it for that tab.

---

## Ready to go further?

Once you're comfortable with the concepts here, [Practice Pad](https://www.practice-pad.app/) is a good next step. It's designed for working through JavaScript interview questions hands-on, so you can go from knowing the theory to actually being able to answer on the spot.
