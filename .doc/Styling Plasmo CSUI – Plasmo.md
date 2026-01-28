---
title: "Styling Plasmo CSUI – Plasmo"
source: "https://docs.plasmo.com/framework/content-scripts-ui/styling"
author:
  - "[[Plasmo Docs]]"
published:
created: 2026-01-13
description: "Plasmo CSUI's built-in Root Container allows extension developers to safely style their components."
tags:
  - "clippings"
---

## Styling Plasmo CSUI

[Plasmo CSUI's built-in `Root Container`](https://docs.plasmo.com/framework/content-scripts-ui/life-cycle#root-container) allows extension developers to safely style their components. It ensures that for the most part:

- The exported style does not leak to the web page
- The web page's style does not influence the component's styling

See [caveats](https://docs.plasmo.com/framework/content-scripts-ui/styling#caveats) for when it does not work.

## Raw CSS Text

To style your CSUI, export a `getStyle` function:

content.tsx

```ts
import type { PlasmoGetStyle } from "plasmo"



export const getStyle: PlasmoGetStyle = () => {

  const style = document.createElement("style")

  style.textContent = \`

    p {

      background-color: yellow;

    }

  \`

  return style

}
```

## Import Stylesheet

To import CSS/LESS/SASS files, combine the `getStyle` API with the [`data-text` import scheme](https://docs.plasmo.com/framework/import#data-text):

content.tsx

```ts
import styleText from "data-text:./style.scss";

import type { PlasmoGetStyle } from "plasmo";

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");

  style.textContent = styleText;

  return style;
};
```

## CSS-in-JS

The `getStyle` API can also be used to hydrate CSS-in-JS style cache, for example when using [`with emotion`](https://github.com/PlasmoHQ/examples/tree/main/with-emotion):

content.tsx

```ts
import createCache from "@emotion/cache";

import { CacheProvider } from "@emotion/react";

import type { PlasmoGetStyle } from "plasmo";

const styleElement = document.createElement("style");

const styleCache = createCache({
  key: "plasmo-emotion-cache",

  prepend: true,

  container: styleElement,
});

export const getStyle: PlasmoGetStyle = () => styleElement;
```

## CSS Modules

To utilize CSS modules, import the stylesheet twice:

## Custom Font

To use a custom font in your CSUI, you must import the font inside a CSS file and declare it in the `css` property of the [config object](https://docs.plasmo.com/framework/content-scripts#config). The browser does not recognize Font assets if declared inside a ShadowDOM. You have to load them in the global scope.

1. Add your font in the `assets` directory (e.g `/assets/Fascinate.woff2`)
2. Create a `font.css` file next to your content script, importing the font inline using the [`data-base64`](https://docs.plasmo.com/framework/import#data-base64) scheme:

font.css

```css
@font-face {
  font-family: "Fascinate";

  font-style: normal;

  font-weight: 400;

  font-display: swap;

  src: url(data-base64:~assets/Fascinate.woff2) format("woff2");

  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
    U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF,
    U+FFFD;
}
```

1. Declare the file in the `css` property of the content script config:

content.tsx

```tsx
export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*"],

  css: ["font.css"],
};
```

1. Once the browser registers the font, you can reference it inside your CSS style:

style.css

```css
.hw-top {
  background: red;

  color: white;

  font-family: "Fascinate";
}
```

See [with-content-scripts-ui/contents/plasmo-overlay.tsx](https://github.com/PlasmoHQ/examples/blob/main/with-content-scripts-ui/contents/plasmo-overlay.tsx) for a full example.

## Styling the Shadow DOM

Use the IDs `#plasmo-shadow-container` and `plasmo-inline` to alter the `Root Container` styles in your CSS:

style.css

```css
#plasmo-shadow-container {
  z-index: 99999;
}

#plasmo-inline {
  background: blue;
}
```

⚠️

## Inherit the Web Page's Style

To inherit the web page's style, override the built-in `Root Container` to mount your component directly into the web page's DOM. [Click here for more details](https://docs.plasmo.com/framework/content-scripts-ui/life-cycle#custom-root-container).

## Caveats

There are many situations that the framework's generic style encapsulation cannot handle (yet). Here are some common gotchas:

### CSS Variables

CSS Variables are shared across every frame within the same browser tab. This means that if the webpage declares some CSS variables at the `:root` context, it will be prioritized over yours.

To mitigate CSS variable sharing between CSUI and the web page, you can either:

- Declare a unique prefix namespace for your CSS variables
- Hoist your CSS variable under a `:host` scope
- Mount your component inside an iframe, with its own head and body

### Root Container Style

If the host webpage uses a global `*` specifier to style its page, it can potentially override the `Root Container` style. For example:

```css
* {
  display: block;
}
```

The above code will cause the root container to have block display. In cases like these, overriding the root container style with an inline style will help keep the container consistent.

There may exist some CSS styling declarations that cannot be overridden to alter the the `Root Container` styles. In those cases, the `!important` flag can be used as a workaround.

style.css

```css
#plasmo-shadow-container {
  z-index: 2147483646 !important;
}
```
