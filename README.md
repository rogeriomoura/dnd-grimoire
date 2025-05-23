# D&D 5e Grimoire Builder

A web application that allows Dungeons & Dragons players to create, customize, and print their own spellbooks (grimoires).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Data Source

This application uses the [D&D 5e API](https://www.dnd5eapi.co/) as its data source. The D&D 5e API is a free, open REST API that provides data for spells, monsters, and other game resources from the 5th Edition of Dungeons & Dragons.

### API Features Used

- Spell list retrieval
- Detailed spell information
- Spell filtering and search capabilities

The API is publicly accessible and does not require authentication. For more information about the API and its capabilities, visit:

- API Documentation: [https://www.dnd5eapi.co/docs/](https://www.dnd5eapi.co/docs/)
- Base API URL: [https://www.dnd5eapi.co/api/](https://www.dnd5eapi.co/api/)

## Deployment

This application is deployed on GitHub Pages and can be accessed at:
[https://rogeriomoura.github.io/dnd-grimoire](https://rogeriomoura.github.io/dnd-grimoire)

## Available Scripts

In the project directory, you can run:

### `pnpm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `pnpm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `pnpm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Deployment

You have multiple ways to deploy this application to GitHub Pages:

### Method 1: Using the Deploy Script

The simplest method is to use the provided deploy script:

```bash
./deploy.sh
```

This script will build the application and deploy it to GitHub Pages.

### Method 2: Using pnpm

You can use pnpm with the explicit run command:

```bash
pnpm run deploy
```

Note: Using just `pnpm deploy` won't work as it conflicts with pnpm's built-in workspace commands.

### Method 3: Using the Custom Script

For convenience, there's also a custom script defined:

```bash
pnpm run publish-site
```

This script is just an alias for `pnpm run deploy`.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Deploying to GitHub Pages

To deploy the latest version of the application to GitHub Pages:

1. Make your changes to the codebase
2. Run `npm run deploy` or `pnpm deploy`

This will build the application and deploy it to the `gh-pages` branch of the repository, which is configured to serve the GitHub Pages site.
