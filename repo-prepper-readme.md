# Repo Interview Prepper

Repo Interview Prepper is an AI-powered web application designed to help developers prepare for technical interviews. By analyzing a specific GitHub repository, the tool generates tailored interview questions—ranging from architectural decisions to specific code implementations—simulating a real-world technical deep dive.

## 🚀 Features

* **Repository Analysis**: Scans public GitHub repositories to extract file structure, README context, and key source code.
* **AI Question Generation**: Uses OpenAI's `gpt-4o-mini` to generate relevant questions based on the actual code context.
* **Adaptive Modes**: Choose between Technical, Behavioral, or Mixed question styles.
* **Mock Interview Simulation**: Interactive chat mode to practice answers with AI feedback.
* **Secure Architecture**: Uses a Vercel Serverless Function to proxy API calls, keeping your OpenAI API key hidden from the client-side.
* **Modern UI**: Fully responsive design with Dark/Light mode, glassmorphism effects, and Tailwind CSS.

## 🛠️ Tech Stack

* **Frontend**: React.js, Vite, Tailwind CSS, Lucide React
* **Backend**: Node.js (Vercel Serverless Functions)
* **AI Integration**: OpenAI API (`gpt-4o-mini`)
* **Deployment**: Vercel

## 📂 Project Structure

```
repo-interview-prepper/
├── api/
│   └── chat.js          # Serverless backend proxy (Securely calls OpenAI)
├── public/              # Static assets (favicon, etc.)
├── src/
│   ├── App.jsx          # Main React Application Logic
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles & Tailwind directives
└── ...config files      # Tailwind, PostCSS, Vite configs
```

## 🛡️ Architecture & Security

This project implements a Backend-for-Frontend (BFF) pattern to handle sensitive API interactions securely:

1. **Frontend (React)**: Handles user interaction, state management, and repository scanning logic.
2. **Serverless Proxy (Node.js)**: A dedicated endpoint (`/api/chat`) that acts as a secure gateway.
3. **Security**: The OpenAI API Key is stored exclusively in server-side environment variables (`OPENAI_API_KEY`), ensuring it is never exposed to the client browser.