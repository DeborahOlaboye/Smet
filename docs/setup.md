# Setup — Frontend

Follow these steps to set up the frontend locally:

1. Install dependencies

```bash
cd frontend
pnpm install
# or npm install
```

2. Create environment variables

Copy `.env.example` to `.env.local` and fill in any required keys (RPC URL, API endpoint, NEXT_PUBLIC_* keys).

3. Run the development server

```bash
pnpm dev
# or npm run dev
```

4. Running tests

- Unit tests: `pnpm test` (vitest/jest depending on setup)
- Accessibility tests: `pnpm test:accessibility`

5. Building for production

```bash
pnpm build
pnpm start
```

Troubleshooting
- If types fail, run `pnpm build` to view TypeScript errors
- For linting issues: `pnpm lint`
