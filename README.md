# Heartsync - French Dating App

A modern dating platform focused on honesty and trust, featuring user ratings, mini-challenges, and achievement systems.

## Features

- **Trust-based Rating System**: Women can rate men's profiles for honesty
- **Mini-Challenge System**: Interactive conversation starters in French
- **Achievement System**: Gamified profile completion and engagement tracking
- **Premium Subscriptions**: Stripe-powered payment system
- **Photo Verification**: Upload and verification system for profile photos
- **French Interface**: Complete localization in French

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Payments**: Stripe
- **Deployment**: Replit Autoscale

## Deployment

This app is configured for Replit Autoscale deployment:

1. Click "Deploy" in your Replit workspace
2. Select "Autoscale" deployment type
3. Configure your domain settings
4. Deploy!

## Environment Variables

Required environment variables (automatically handled by Replit):
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key
- `REPL_ID` - Replit application ID
- `REPLIT_DOMAINS` - Allowed domains for authentication

## Production Ready

✅ Complete authentication system
✅ Database schema with migrations
✅ Payment processing
✅ Mobile-responsive design
✅ French localization
✅ Achievement system
✅ Photo upload system
✅ Trust rating system
✅ Mini-challenge system

Ready for production deployment!