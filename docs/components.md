# Component Documentation

This file documents frontend components and guidelines for creating or updating components.

## Where to find components

Most components are in `frontend/src/components/` organized by feature.

## Documentation format

For each component, include:
- Purpose and description
- Props (type, shape, default)
- Accessibility considerations
- Visual examples / screenshots
- Related tests

## Example: RewardCard
- Location: `frontend/src/components/rewards/RewardCard.tsx`
- Purpose: Displays a reward with image, name, probability and progress
- Props:
  - `reward: Reward` — reward object
  - `onClaim: () => void` — claim handler

## Writing docs for a component
Add a markdown file under `docs/components/` named like `ComponentName.md` with the sections above. Add storybook stories or story files when possible.
