# Madziowe Bingo

A 5×5 party bingo game with a free center square. Open `?seed=party` to select a layout, or open the page without a seed to generate a new one. **Copy board link** shares the layout. Each player marks their own squares, and refreshing clears their marks. Rows, columns, and diagonals all count for bingo.

## Run locally

With Node.js 24 and npm installed:

```sh
npm ci
npm run dev
```

Run `npm test` for the unit tests and `npm run build` to produce the static site in `dist/`. Use `npm run preview` to serve that build locally.

## Customize the board

- Edit the string array in [`src/captions.js`](src/captions.js). Keep at least 24 distinct, non-empty captions. The seed chooses and orders 24 captions from this list. Editing the list can change layouts for previously shared seeds.
- Replace [`src/center.jpg`](src/center.jpg) with your square image. Update the image description in [`src/main.jsx`](src/main.jsx) to match.

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. In the repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.
3. From the **Actions** tab, run **Test, build, and deploy to GitHub Pages** on the default branch, or push a commit to that branch.

The workflow runs the tests and production build on pull requests. Default-branch runs also upload the built site and publish it to Pages. The published URL appears in the deployment job and in **Settings → Pages**.
