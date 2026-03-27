**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

## Google OAuth login setup

The app now uses a dedicated login page and requires Google sign-in before accessing dashboard routes.

1. Create an OAuth Client ID in Google Cloud Console (type: **Web application**)
2. Add your frontend origins (for example `http://localhost:5173` and your production domain)
3. Set the client ID in your frontend environment file:

```bash
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

4. Restart the frontend dev server after updating env vars

The backend validates the Google ID token server-side before issuing an app session token.

## Email + password login (default local account)

For local/demo environments, a default account is seeded:

- Email: `admin@collateral.local`
- Password: `Admin@123`

You can sign in either with this account or with Google OAuth.

For local frontend + local Node backend:

1. Start backend: `npm run backend`
2. In another terminal start frontend: `npm run dev`

## Cloudflare backend deployment

This repo includes a Cloudflare Worker backend at `cloudflare-backend/src/index.js` using D1 for persistence.

1. Install Wrangler (if needed): `npm i -D wrangler`
2. Create a D1 database:

```bash
npx wrangler d1 create collateral-db
```

3. Copy the returned `database_id` into `cloudflare-backend/wrangler.toml`
4. Apply migrations:

```bash
npx wrangler d1 migrations apply collateral-db --config cloudflare-backend/wrangler.toml
```

5. Deploy the worker:

```bash
npx wrangler deploy --config cloudflare-backend/wrangler.toml
```

6. Point frontend to this API by setting `VITE_API_BASE_URL` (for example in `.env.production`):

```bash
VITE_API_BASE_URL=https://<your-worker-subdomain>/api
```

If you use Cloudflare Pages + Functions routes on the same domain, you can also leave `VITE_API_BASE_URL` unset and the frontend will use `/api` in production.

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
