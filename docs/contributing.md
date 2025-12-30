# Contributing to the Frontend

Thank you for contributing — we welcome improvements, bug fixes, and documentation updates.

## Getting started
1. Fork the repo and create a feature branch: `git checkout -b issues/<number>-short-description`.
2. Follow the commit message format: `type(scope): short description` (e.g., `feat(ui): add rewards grid`).

## Branches & PRs
- Create a dedicated branch per issue/feature.
- PRs should reference an issue and include screenshots or video if UI changes are involved.
- Keep PRs small and focused when possible.

## Tests
- Add unit tests for new components (Vitest/Jest configured).
- Run `npm test` and ensure all tests pass locally.

> New contributors: see `docs/DEVELOPER_ONBOARDING.md` for a step-by-step setup and checklist.

## Code style
- Use TypeScript types for props and state.
- Run `pnpm lint` and `pnpm format` before opening a PR.

## Accessibility
- Ensure components are accessible (keyboard focus, aria attributes, semantic HTML).
- Add accessibility tests where relevant.

## Documentation
- Update or add component docs under `docs/components/` with examples and screenshots.

## Review checklist
- [ ] Adds/updates tests
- [ ] Lints cleanly
- [ ] Documented (README or docs/)
- [ ] Accessibility considered

Thank you for helping improve the project! 🎉
