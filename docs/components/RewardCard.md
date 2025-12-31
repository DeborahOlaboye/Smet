# RewardCard Component

Location: `frontend/src/components/rewards/RewardCard.tsx`

## Purpose
Displays a reward item with an image, name, probability, availability and claim progress.

## Props
- `reward: Reward` — reward object (see `frontend/src/types/reward.ts`)
- `onClaim?: (id: string) => void` — optional claim handler

## Accessibility
- Ensure images have alt text
- Buttons should have accessible labels

## Example
```tsx
<RewardCard reward={sampleReward} onClaim={() => openReward(reward.id)} />
```

## Tests
- Unit tests should cover: rendering, click handlers, and empty states.
- Add snapshot or visual regression tests for UI changes.
