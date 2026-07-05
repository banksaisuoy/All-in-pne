1. **Fix `eslint` issues.**
   - In `app/shop/visual-search/page.tsx` and `app/admin/upload/page.tsx`, replace `<img>` with `<Image>` from `next/image` ensuring we use `unoptimized` for local blob URLs and appropriate layout props (with a relative parent constraint). Make sure to configure `sizes` if needed.
   - For remote images, update `next.config.ts` to allow `placehold.co` (or other remote domains) in `images.remotePatterns`.
   - Update `lib/actions/visual-search.ts` to fix the `any` type on `item` (use `Record<string, unknown>` and cast).

2. **Add Jest Configuration and Tests for Core Flows**
   - Create `jest.config.mjs` config handling `next/jest.js` properly.
   - Write tests for `app/shop/visual-search/page.tsx`. Use `act(...)` around async file reader operations. Mock `window.URL.createObjectURL`.
   - Write tests for `app/admin/upload/page.tsx`. Use `act(...)` and ensure robust testing coverage (100% core flow).
   - Test server actions (can be stubbed out during component tests, but provide isolated logic testing if needed).

3. **Performance and Best Practices**
   - Use `useCallback` for event handlers where appropriate.
   - Address console warnings and absolute position layout bugs by ensuring `relative` on parent elements of `<Image fill />`.

4. **Verify changes and complete pre-commit instructions.**
   - Run linter (`npx eslint .`).
   - Run tests (`npm run test`).
