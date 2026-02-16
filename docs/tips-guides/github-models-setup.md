# GitHub Models Setup Guide

This guide explains how to use **GitHub Models** (available for free with the GitHub Student Developer Pack and to public beta users) to power the GPT models in TOMO.

## 1. Get a GitHub Personal Access Token (PAT)

You need a Personal Access Token to authenticate with GitHub Models.

1.  Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens).
2.  Click **Generate new token** -> **Generate new token (classic)**.
3.  **Note**: Make sure to select "classic" token. Fine-grained tokens might work but classic are reliable for this beta.
4.  Give it a name like "TOMO Chat Models".
5.  **Scopes**: You do **not** need to select any specific scopes for public model access. Just scroll down and click **Generate token**.
6.  Copy the token (it starts with `ghp_`).

## 2. Configure Environment

1.  Open your `.env` file.
2.  Add or update the following line:

```env
GITHUB_MODELS_API_KEY=ghp_xxxxxxxxxxxx
```

## 3. Restart the Application

Restart your development server:

```bash
npm run dev
# or
pnpm dev
```

## 4. Using the Models

- **GPT-4o-mini**: Select this model in the chat UI. It will now use GitHub Models as the provider.
- **GPT-5-mini**: Select this model. It currently maps to `gpt-4o` on GitHub Models as a powerful placeholder until GPT-5 is released.

## Troubleshooting

- **401 Unauthorized**: Check that your token is correct and has not expired.
- **429 Too Many Requests**: GitHub Models has rate limits. If you hit them, wait a bit or switch to another provider.
