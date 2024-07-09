# BattleBucks Backend


## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js installed (see [nodejs.org](https://nodejs.org/) for installation instructions)
- A package manager like npm (comes with Node.js) or yarn or bun

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installation

1. Step One

```bash
bun install
```

2. Step Two: run the migrations

```bash
    cd prisma/migrations/20240708043736_init
    npx prisma migrate dev
    npx prisma generate
```

3. Step Three: start the server

```bash
    npm run dev
```

## Usage

```
npx prisma studio # open the prisma studio
navigate to http://localhost:5000/trpc-playground # open the trpc playground
```
