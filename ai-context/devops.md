# ai-context/devops.md — DevOps Agent

Authority: CI/CD, deployment, versioning, release gates.

## Commands
npm run dev, npm run build, npm run start, npm run lint, npm run test, npm run preview.

## CI (.github/workflows/ci.yml)
typecheck -> lint -> test -> build. All green before merge.

## Release discipline
Version bump + CHANGELOG entry + git tag + push tag + verify remote ref. Never ship untagged/unversioned. Commits carry AI-Assisted attribution footer.

## Production gate
Named owner authorizes production launch. AI must not deploy directly to production. Approve credentials, migrations, spend cap.
