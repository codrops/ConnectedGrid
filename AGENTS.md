# AGENTS.md

Notes for coding agents working on this repo. Read [README.md](README.md) first for what the demo is.

## Setup

- There is no build step, no package.json and nothing to install. Plain HTML, CSS and ES modules.
- Serve the root with any static server (`npx serve .` or `python3 -m http.server`). ES modules don't load from `file://`.
- GSAP 3.15, ScrollTrigger and Lenis 1.3 are vendored in `js/` and loaded as classic scripts before the page's module, so `gsap`, `ScrollTrigger` and `Lenis` are globals. Don't import them. To upgrade one, replace its file with the same file from `https://cdn.jsdelivr.net/npm/<pkg>@<version>/dist/`.
- There are no automated tests. Check a change in a browser: scroll each page from top to bottom (wheel and touch), resize across 53em (848px) halfway down, try it with reduced motion on, and look at the console.

## Map

| Path                                                    | What it is                                                                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `index.html`…`index4.html`                              | One page per variation (01 is `index.html`). Same structure; they differ in images, grid positions, palette and script. |
| `js/index.js`…`js/index4.js`                            | One script per page: the Lenis setup, the per-item scroll timelines and start-up. Each is self-contained, so the Lenis setup repeats in every file. |
| `js/utils.js`                                           | `preloadImages` (decodes the grid's background images before the page shows) and `fadeOnScroll` (the reduced motion version). |
| `js/gsap.min.js`, `js/ScrollTrigger.min.js`, `js/lenis.min.js` | The vendored libraries.                                                                                   |
| `css/base.css`                                          | All styles: the loader, frame, grid, captions, outro cards and each page's palette (`.demo-2`…`.demo-4`).      |
| `css/lenis.css`                                         | Lenis's own stylesheet, vendored with it.                                                                       |
| `img/`                                                  | `1`–`13` for page 01, `14`–`26` for 02, `27`–`39` for 03, `40`–`54` for 04. Generated with Midjourney.          |

## How a page works

- The grid is `.grid` > `figure.grid__item`, each with three layers the animation moves separately: `.grid__item-img` (the frame, `overflow: hidden`), `.grid__item-img-inner` (the picture, as a CSS background) and `.grid__item-caption`.
- From 53em the grid has 8 columns and every item sits on its own row, placed by inline variables: `--r` row, `--c` first column, `--s` span (the default comes from `:root` or the page's `.demo-<N>` class). Each item starts right after the previous one ends, or ends right where it starts, and the grid has no gap from 53em up, so each image's corner touches the previous one's. That touch is the "connected" layout the demo is named for: it's set by hand in the markup, and any gap at desktop width breaks it. Below 53em it's one column with a 4rem gap.
- The script waits for `preloadImages('.grid__item-img-inner')`, then starts Lenis and builds one scrubbed ScrollTrigger timeline per item, then removes `loading` from the body. With reduced motion it calls `fadeOnScroll` instead: no Lenis, no transforms, each item only fades in. The setting is read once at load.
- Per item, `isLeftSide()` tells whether the item sits to the left of the previous one, and `originX()` turns that into 100 or 0 for `transformOrigin`, so each image moves out of the corner it shares with the one before. They're functions, used as function-based values with `invalidateOnRefresh: true`, so ScrollTrigger measures them again when it refreshes after a resize. Anything new that depends on the layout has to work the same way.
- Every tween ends at the item's rest state (scale 1, no offset or rotation, opacity 1, filter at 100%), so the grid at rest is the plain CSS layout.

## Variations

| #  | Page          | What it does                                                                                                   | Notes                                                                    |
| -- | ------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 01 | `index.html`  | Each image grows from nothing out of the corner it shares with the previous one while the picture inside zooms out from 5×; the caption slides in from the side. | `power4`, from `top bottom-=15%` over `+=100%`. Dark palette.            |
| 02 | `index2.html` | Each image slides in diagonally from the previous one's position while the picture moves the opposite way, settling from overexposed (brightness 200%, contrast 300%) to normal; the caption rises in. | Linear, over `+=50%`. Red palette (`.demo-2`).                           |
| 03 | `index3.html` | Each image swings open in 3D, hinged on the edge towards the previous one (`perspective: 500` on the item); the picture zooms from 2× and the caption swings in with it. | `power3`, from `top bottom`. Black and pink palette, items alternate between columns 5 and 1, span 4 (`.demo-3`). |
| 04 | `index4.html` | Square images rotate 45° into place around their top corner and fade in; captions fly in from below.          | `power2`, over `+=75%`. Grey palette, square images (`--img-ratio: 1`), span 2 (`.demo-4`). 15 items. |

## Adding a variation

1. Copy a page to `index<N>.html`. Change the `demo-<N>` body class, the images, the grid positions (`--r`, `--c`, `--s`, keeping each item a corner-to-corner neighbour of the one before) and the script tag (`js/index<N>.js`).
2. In its head, change the `<title>`, meta description, canonical, `og:` and `twitter:` title, description and URL, the JSON-LD, `theme-color` (the page's background) and the preloaded first image.
3. Copy a page script to `js/index<N>.js` and change only the timeline in `scroll()`. Keep the function-based values for anything that uses `isLeftSide()` or `originX()`, keep `invalidateOnRefresh: true`, and keep the start-up block at the bottom so reduced motion still gets `fadeOnScroll`.
4. If it has its own palette, add `.demo-<N>` to `css/base.css` with the same variables as the others (`--color-text`, `--color-bg`, `--color-link`, `--color-link-hover`, `--color-title`, `--color-year`, and optionally `--img-ratio` and `--s`).
5. Add the link to the `.frame__demos` nav on **every** page. The current page's entry is a `<span class="frame__demo frame__demo--current" aria-current="page">`, not a link. Numbers are two digits.
6. Add its row to the Variations table above.

## Scroll conventions

- Lenis runs on GSAP's ticker (`gsap.ticker.add((time) => lenis.raf(time * 1000))` with `lagSmoothing(0)`) and calls `ScrollTrigger.update` on scroll, so the scroll and the scrubbed timelines update in the same frame. Don't add a separate `requestAnimationFrame` loop for it.
- Reduced motion is read once at load, with `window.matchMedia`.
- `.grid` has `overflow-x: clip`, so items that start off to the side (page 02) don't make the page wider than the screen. Keep it `clip`: `hidden` would turn the grid into a scroll container.
- The analytics and sponsor scripts are commented out in the repo. They're added on the live server only.

## Style

- Tabs for indentation (the first lines of `utils.js` use four spaces), single quotes, semicolons. Follow what's in the file.
- Timelines are written as one chain: `gsap` on its own line, then `.timeline({ defaults, scrollTrigger })` and a `.fromTo()` per layer, positioned at `0`.
- Comments are short lines above the code saying what it does ("Get all grid items within the grid"). Some commented-out options (`//duration: 1`) are the author's and stay.
- No dependencies and no build tooling unless asked.

## Ask before changing

- The pages' `<title>`, meta description and keywords, the canonical and social tags, the `frame__title` heading and the tags.
- The frame links: Article (stays the `?p=73283` permalink), All demos and GitHub. The outro cards and the credits.
- The four variations, which are the author's own: their effects, timings, layouts, palettes, images and captions.
