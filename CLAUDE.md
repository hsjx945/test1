# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Flux Image Generator - an AI-powered image generation website built with Next.js 14. Users input text descriptions and the system calls Replicate's Flux model to generate images.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Environment Setup

1. Copy environment template: `cp .env.example .env.local`
2. Add your Replicate API token to `.env.local`:
   ```
   REPLICATE_API_TOKEN=your_token_here
   ```
3. Get token from: https://replicate.com/account/api-tokens

## Architecture

- **Frontend**: Next.js 14 App Router with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes (`/api/generate`)
- **AI Service**: Replicate Flux model (`black-forest-labs/flux-dev`)
- **State Management**: React hooks (useState, useEffect)
- **Storage**: Browser localStorage for usage limits and history
- **Styling**: Pure Tailwind CSS with custom animations

## Key Features

- Daily usage limit (10 generations per day) via localStorage
- Generation history with thumbnail gallery and modal view
- Image download functionality
- Responsive design (mobile-first approach)
- Loading states and error handling
- Real-time character count for prompts

## Project Structure

```
flux-image-generator/
├── src/app/
│   ├── api/generate/route.ts    # Replicate API integration
│   ├── globals.css              # Global styles and animations
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application (client component)
├── .env.local                   # Environment variables (create from .env.example)
└── package.json                 # Dependencies including replicate SDK
```

## Development Notes

- Main component is a client component (`'use client'`) with comprehensive state management
- API route handles Replicate integration with proper error handling
- Uses Next.js Image component for optimized image loading
- localStorage keys use date-based format: `flux_usage_${date}` and `flux_history`
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)
- Purple gradient theme (#8b5cf6 to #7c3aed) on dark background
请始终用简体中文回答，包括代码注释在内。