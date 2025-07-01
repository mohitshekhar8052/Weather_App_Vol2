# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e33ee921-52e0-4ebc-a914-a5fbe3df14c0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e33ee921-52e0-4ebc-a914-a5fbe3df14c0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- OpenWeatherMap API

## How to add your OpenWeatherMap API Key

1. Sign up for a free account at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
2. Once registered, go to your [API Keys](https://home.openweathermap.org/api_keys) page
3. Generate a new API key if you don't already have one
4. Open `/src/services/weatherService.ts` in your project
5. Replace `YOUR_API_KEY` with your actual API key:

```typescript
const API_KEY = 'your_actual_api_key_here'; // Replace with your actual API key
```

**Note:** The app will work without an API key by showing mock weather data. This allows you to test the UI without needing to sign up for an API key immediately.

**Important Note for Production:** In a production application, you should store your API key in environment variables using `.env` files, and access it with `import.meta.env.VITE_WEATHER_API_KEY`.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e33ee921-52e0-4ebc-a914-a5fbe3df14c0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
