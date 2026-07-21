# The Tyres Egham



## Overview

The Tyres Egham is a full-stack tyre service and booking platform. It combines a modern customer-facing frontend with a Laravel-powered backend for catalogue management, bookings, reviews, content, and admin operations.

This repository currently contains:

- `frontend` - customer website and admin interface built with React, TypeScript, and Vite
- `backend` - REST API and admin backend built with Laravel 11 and PHP 8.2
- `assets`, `images`, `videos` - static project resources
- `api` - additional API-related project material

## Key Features

- Tyre search and product detail pages
- Brand and service pages
- Basket and checkout flow
- Booking creation and management
- Customer reviews and contact forms
- Blog and CMS-style content pages
- Admin dashboard for tyres, brands, vouchers, bookings, content, and settings
- Stripe payment integration

## Frontend Skills Used

The frontend is focused on a modern, responsive, and maintainable user experience.

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod validation
- Tailwind CSS
- Radix UI components

## Backend Skills Used

The backend is built to support business operations, data management, and secure API access.

- Laravel 11
- PHP 8.2
- REST API architecture
- Laravel Sanctum authentication
- Stripe payment handling
- Eloquent ORM
- Database migrations
- Admin and content management workflows

## Project Structure

```text
thetyrese/
|- frontend/
|- backend/
|- assets/
|- images/
|- videos/
|- api/
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Development Notes

- The frontend and backend are separated for cleaner development and deployment
- The frontend consumes backend API endpoints for live data
- The backend includes admin-focused endpoints for managing bookings, tyres, reviews, content, and settings

## Why This README Is GitHub Ready

This documentation is designed to help any visitor quickly understand:

- what the project does
- which technologies are being used
- what the frontend and backend are responsible for
- how to start working with the codebase

## Status

This project is currently an active full-stack web platform with both frontend and backend development in place.
