# API Interactions

The frontend currently uses a small service layer to interact with backend data. At present, this is implemented with mock data for local development.

## Key service: `frontend/src/services/rewards.ts`

- `fetchRewards(): Promise<Reward[]>` — Returns a list of rewards (mocked). Used by `frontend/src/app/page.tsx`.
- `openReward(rewardId: string): Promise<{ success: boolean; reward: Reward }>` — Simulates opening a reward and decrementing the remaining count.

## How to replace mocks with real API endpoints

1. Identify the service file to modify (e.g., `frontend/src/services/rewards.ts`).
2. Replace the mock implementation with fetch/axios calls to your API:

```ts
export async function fetchRewards(): Promise<Reward[]> {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/rewards');
  if (!res.ok) throw new Error('Failed to fetch rewards');
  return res.json();
}
```

3. Add error handling, retries, and caching as needed.
4. Update tests to mock the network calls.

## Environment variables
- `NEXT_PUBLIC_API_URL` — base URL for API calls

## Notes
- For local development we intentionally use mocked services to make UI dev and tests deterministic.
- If you add real API calls, ensure you add mocks for tests or use MSW (Mock Service Worker) to intercept network calls.
