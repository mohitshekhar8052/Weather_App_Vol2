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

## Features

- Modern UI with glassmorphism design and responsive layout
- Real-time weather data from OpenWeatherMap API (with mock data fallback)
- Light/dark theme support
- Weather alerts display for severe weather conditions
- Support for multiple saved locations
- Dedicated section for Indian cities
- Hourly and daily weather forecasts

## How to add your OpenWeatherMap API Key

1. Sign up for a free account at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
2. Once registered, go to your [API Keys](https://home.openweathermap.org/api_keys) page
3. Generate a new API key if you don't already have one
4. Create a `.env` file in your project root (copy the contents from `.env.example`)
5. Add your API key to the `.env` file:

```
VITE_WEATHER_API_KEY=your_actual_api_key_here
```

**Note:** The app will work without an API key by showing mock weather data. This allows you to test the UI without needing to sign up for an API key immediately.

**Alternative Method:** You can also directly edit the API key in `/src/services/weatherService.ts` if you prefer, but using environment variables is the recommended approach.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e33ee921-52e0-4ebc-a914-a5fbe3df14c0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
