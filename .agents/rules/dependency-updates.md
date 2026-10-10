---
globs:
  - package.json
  - package-lock.json
---

# Dependency update policy

When changing `package.json` or `package-lock.json`:

- Treat seven days from the npm publish timestamp as the default cooldown before adopting a new package version.
- Check the selected version's npm publish timestamp before updating it. A version published less than seven days ago requires an explicit exception with the reason and approval recorded in the change context.
- Check `npm audit` and the package maintainer's official GitHub Security Advisories. Record relevant CVE or GHSA identifiers and whether they apply to this project.
- Prefer exact versions for build-critical packages whose reproducibility depends on the lockfile and keep `package-lock.json` in sync.
- After updating dependencies, run `npm ci`, `npm ls`, `npm run check`, and `npm run build` with Node.js 24.1.0.

The cooldown is a supply-chain precaution, not a substitute for urgent security updates. A security fix may bypass the cooldown when the exception and verification evidence are recorded.
