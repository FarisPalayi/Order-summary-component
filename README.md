[![Netlify Status](https://api.netlify.com/api/v1/badges/bdc28dd2-a71f-4bd7-ba37-7a908b4ee778/deploy-status)](https://app.netlify.com/sites/order-summary-page-farisp/deploys)

# Frontend Mentor - Order summary card solution

This is a solution to the [Order summary card challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/order-summary-component-QlPmajDUj). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Frontend Mentor - Order summary card solution](#frontend-mentor---order-summary-card-solution)
  - [Table of contents](#table-of-contents)
  - [Overview](#overview)
    - [The challenge 🎯](#the-challenge-)
    - [Screenshot 📸](#screenshot-)
    - [Features ✨](#features-)
    - [Supported Browsers 🌐](#supported-browsers-)
    - [Project File Structure 🏗](#project-file-structure-)
    - [Links 🔗](#links-)
  - [My process](#my-process)
    - [Built with 🛠](#built-with-)
      - [Deployed on:](#deployed-on)
    - [What I learned](#what-i-learned)
    - [How it's done](#how-its-done)
      - [Blur-up image loading](#blur-up-image-loading)
    - [Continued development](#continued-development)
    - [Useful resources](#useful-resources)
  - [Author](#author)

## Overview

### The challenge 🎯

Users should be able to:

- See hover states for interactive elements
- Make it support IE10 and IE11.
- Do not use any pollyfills or tools like typescript or babel to achieve that.

### Screenshot 📸

- On 1440px width 900px height (desktop)

![site screenshot on desktop](./frontend/images/screenshot/desktop.png)

- On 375px width 709px height (mobile)

![site screenshot on mobile](./frontend/images/screenshot/mobile.png)

### Features ✨

- Blur image loading
- Button ripple effect
- Fluidly responsive
- Stripe payment
- Conventional loading spinner on button
- IE10, IE11 compatible
- Error snackbar on request failure

### Supported Browsers 🌐

- Chrome
- Firefox
- Edge
- Brave
- Opera
- IE11
- IE10

### Project File Structure 🏗

```
.
├── design
├── images
├── sass
│   ├── abstracts
|       ├── _colors.scss
|       └── _functions.scss
|       └── _mixins.scss
│   └── components
|       ├── _plan.scss
│   └── _global.scss
│   └── style.scss
├── scripts
│   ├── index.js
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
└── snowpack.config.js
```

### Links 🔗

- Solution URL: [Add solution URL here](https://your-solution-url.com)
- Live Site URL: [Add live site URL here](https://your-live-site-url.com)

## My process

### Built with 🛠

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- Mobile-first workflow
- Sass
- Snowpack
- ExpressJs
- Typescript
- Ts-node
- Stripe

#### Deployed on:

- Netlify
- Heroku

### What I learned

I learned **a lot of stuff** while doing this project.

- Firstly, I learned how to use Stripe to make basic payments. Though, I have a long way to go before I understand all its APIs and how it actually works.
- Since I wrote javascript code that needed to be compatible with IE, I got an overview of which js features works with IE and which does not. Some things that IE does not support:

  - CSS

    - CSS Custom Properties (CSS Variables)
    - Full support of Flexbox
    - Full support of CSS Grid
    - `min()`, `max()` and `clamp()`
    - CSS logical properties. Eg: `inset`
    - `fit-content`, `min-content`, `max-content`

  - Javascript

    - Arrow functions
    - Promises
    - Fetch API
    - Async await
    - Destructuring
    - Spread, rest syntax
    - Template literals
    - `let` and `const` (IE10 and below)
    - `addEventListener()` (IE8 and below)
    - Array methods like `forEach()`, `reduce()`, `map()` (IE8 and below)

- Got to know a built-in Sass function `math.is-unitless()`. Which checks if the passed argument has a unit or not, and returns a boolean based on that. I used it in the `toRem()` function to avoid accidentally passing values that has units.
- Learned how to use a base64 encoded image in an SVG.

<!-- prettier-ignore -->
```html
<!-- unrelated attributes and stuff are omitted for brevity -->
<svg>
  <image xlink:href="data:image/png;base64,iVBORw0KG..." /> <!-- 👈 base64 image goes here -->
</svg>
```

- Also, learned how to make an XMLHttpRequest(xhr). This was what used to make requests before the Fetch API.
- Learned how to get a recommended vscode extension notification using the .vscode/extensions.json file.
  By adding an extension's identifier as the value of `recommendations` in the extensions.json file in the .vscode directory. For example: vscode .env syntax highlighter extension's identifier is "esbenp.prettier-vscode". To show that as a recommended extension, add

  ```json
  // .vscode/extensions.json
  {
    "recommendations": ["irongeek.vscode-env"]
  }
  ```

  ![Extension recommendation notifcation on vscode screenshot](frontend/images/screenshot/extension-recommendation-alert-vscode.png)

  <details>
    Identifier can be found in the extension's page.

  ![Extensions page in vscode screenshot](frontend/images/screenshot/extension-identifier-window.jpg)
    <summary>Get the identifier of a vscode extension</summary>
  </details>

- I used certain format to commits. by adding certain keywords like **chore:**, **build:**, **feat:** to make the commit messages more organized and readable, which I got from the VueJs github repository.

  - chore: if it is a small/mundane task
  - feat: when added new feature
  - build: build, deployment related changes
  - refactor: when rewriting existing code(refactoring)

- I learned some new git commands as well:
  - `git add -p` : It can be used to stage only the desired changes to git. ie. it'll make it possible to stage chunks/hunks of changes rather all the changes.
  - `git reflog` - Kinda like `git log`, but gives more info. It can be used to undo even a hard rest.
  - `git merge --abort` - To abort a merge

```css
.proud-of-this-css {
  color: papayawhip;
}
```

```js
const proudOfThisFunc = () => {
  console.log("🎉");
};
```

If you want more help with writing markdown, we'd recommend checking out [The Markdown Guide](https://www.markdownguide.org/) to learn more.

**Note: Delete this note and the content within this section and replace with your own learnings.**

### How it's done

#### Blur-up image loading

<details>
Popular apps like whatsapp, facebook, and sites like medium uses the blur-up technique to load images on their site/app. Where, a blurred version of the image is shown until the image has loaded.

<br />
<br />

I followed this [article]() from CSS-Tricks to create the effect. Though, I have done a few things slightly differently.

steps:

1. Take the image and create a smaller version of that. It should be around 40 pixels height and width (but keep the aspect-ratio).
2. Convert it to base64.
3. Put that into a Gausean Blur applied svg's image tag.

```html
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="1500"
  height="823"
  viewBox="0 0 1500 823"
>
  <filter
    id="blur"
    filterUnits="userSpaceOnUse"
    color-interpolation-filters="sRGB"
  >
    <feGaussianBlur stdDeviation="20 20" edgeMode="duplicate" />
    <feComponentTransfer>
      <feFuncA type="discrete" tableValues="1 1" />
    </feComponentTransfer>
  </filter>
  <image
    filter="url(#blur)"
    xlink:href="data:image/png;base64,iVBORw0KG..." <!-- add the base64 image here -->
    x="0"
    y="0"
    height="100%"
    width="100%"
  />
</svg>
```

1. Now, convert that svg to base64
2. show that as the image until the actual image is loaded.
3. Show the actual image when it's loaded using javascript
  <summary>Blur up loading</summary>
</details>

### Continued development

Use this section to outline areas that you want to continue focusing on in future projects. These could be concepts you're still not completely comfortable with or techniques you found useful that you want to refine and perfect.

**Note: Delete this note and the content within this section and replace with your own plans for continued development.**

### Useful resources

- [Example resource 1](https://www.example.com) - This helped me for XYZ reason. I really liked this pattern and will use it going forward.
- [Example resource 2](https://www.example.com) - This is an amazing article which helped me finally understand XYZ. I'd recommend it to anyone still learning this concept.

**Note: Delete this note and replace the list above with resources that helped you during the challenge. These could come in handy for anyone viewing your solution or for yourself when you look back on this project in the future.**

## Author

- Frontend Mentor - [@farispalayi](https://www.frontendmentor.io/profile/yourusername)
- Twitter - [@farispalayi](https://www.twitter.com/yourusername)
- LinkedIn - [@farispalayi](https://www.linkedin.com/in/farispalayi/)
