# AI Resume Builder

A full-stack AI-powered Resume Builder and Analyzer built with React Router, TailwindCSS, and [Puter.js](https://puter.com).

## Overview

This application leverages Puter's cloud OS capabilities to provide a seamless resume building experience. It uses Puter.js for:
- 🔐 **Authentication**: User sign-in and session management.
- 🤖 **AI Integration**: AI-driven resume analysis and chat features.
- 💾 **File System (FS)**: Uploading and reading resume files.
- 🗄️ **Key-Value Storage (KV)**: Storing application state and user data.

## Deployment

This project is deployed and hosted on **[Puter.com](https://puter.com)**. By deploying on Puter, the application natively integrates with the Puter.js SDK without requiring API keys or backend setup for auth, AI, and storage.

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`. 
*Note: Some Puter.js functionalities might require you to run the app within the Puter environment or log in via the Puter.js popup.*

## Building for Production

Create a production build:

```bash
npm run build
```

## Tech Stack

- **Framework**: React Router v7
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **PDF Parsing**: PDF.js
- **Cloud/Backend**: Puter.js
- **Language**: TypeScript
