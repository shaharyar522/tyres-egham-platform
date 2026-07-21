# Backend README

## Overview

This backend provides the API, business logic, authentication, admin operations, and database layer for The Tyres Egham platform.

## Current Backend Stack

- Laravel 11
- PHP 8.2
- Laravel Sanctum
- Stripe PHP SDK
- Eloquent ORM
- MySQL or compatible relational database

## Backend Responsibilities

- Serve public API endpoints for brands, services, pages, blog posts, reviews, tyres, and bookings
- Handle admin authentication and protected admin API routes
- Manage bookings, appointment slots, vouchers, reviews, and site settings
- Process Stripe payment setup and payment confirmation flows
- Store and manage structured business data through migrations and models

## Important API Areas

- Health and bootstrap endpoints
- Tyre search and tyre detail endpoints
- Booking creation, lookup, update, and cancellation
- Review submission
- Contact form submission
- Admin dashboard and management endpoints

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Development

Useful commands:

```bash
php artisan serve
php artisan migrate
php artisan test
composer run dev
```

## Goal

This backend is designed to support a reliable, scalable, and maintainable full-stack application for tyre sales, bookings, and business administration.
