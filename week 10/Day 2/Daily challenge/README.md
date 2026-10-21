# Generic Recipe Data Fetcher

A React + TypeScript recipe search app demonstrating a reusable generic results component and Redux Toolkit async state.

## Run locally

1. Create a RapidAPI account and subscribe to the Spoonacular Recipe - Food - Nutrition API.
2. Copy `.env.example` to `.env` and set `VITE_RAPIDAPI_KEY` to your RapidAPI key.
3. Install dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

Use `npm run build` to type-check and create a production build. The `.env` file is ignored by Git.

RapidAPI credentials in a Vite client app are visible to browser users. This setup is suitable for a learning project; production applications should proxy API calls through a server.
