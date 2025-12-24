## Dependency update: lucide-react

- Commit: e66880d (pushed to main)
- Change: Added `lucide-react` dependency to `package.json` to resolve build-time imports used across dashboard and components.
- Reason: Netlify build failed with "Module not found: Can't resolve 'lucide-react'" during CI; adding the dependency ensures the package is installed during build.

Notes:
- `lucide-react` currently has a peer dependency range excluding React 19; your project uses React 19 which triggers a pnpm peer dependency warning. This is expected; lucide-react typically works at runtime, but we may replace it or pin versions if you prefer.
