## Production Readiness Roadmap

This document lists the key areas to focus on to evolve this Solana wallet project from a dev/demo state to a production-ready, real-funds application.

**Priority legend**

- **P0**: Blockers for real users / real funds
- **P1**: Strongly recommended before public launch
- **P2**: Nice-to-have or post-launch hardening

---

## 1. Security & Key Management (P0)

- **Move away from plaintext `localStorage` for secrets**
  - Today: mnemonics, seeds and private keys are stored unencrypted in `localStorage`, which is easily accessible via DevTools, browser extensions, and any XSS.
  - Target:
    - Use a **password-based key** (e.g. PBKDF2/argon2id over a user-chosen passphrase) to encrypt mnemonic/seed/private keys before persisting.
    - Store only encrypted blobs in `localStorage` or `IndexedDB`; never store raw mnemonics/private keys.
    - Implement a **lock screen** / re-auth gate that decrypts keys into memory only when the user explicitly unlocks the wallet, with auto-lock on inactivity or tab close.

- **Explicit non-custodial model and threat model**
  - Clearly define whether the app is **purely client-side non-custodial** (no keys ever touch a server).
  - Document a basic threat model:
    - What happens if device is stolen?
    - What if browser is compromised or malware is installed?
    - What protections the app does and does not provide.

- **Mnemonic and seed handling best practices**
  - Validate mnemonics with `bip39.validateMnemonic()` before converting to seeds or deriving wallets.
  - Enforce allowed word counts (12/15/18/21/24) and provide user-friendly error messages for invalid phrases.
  - Avoid showing the full mnemonic by default; require an explicit user action, with clear warnings, before revealing.
  - For copying mnemonics/private keys to clipboard, add:
    - A confirmation dialog.
    - A visual warning that the clipboard can be read by other apps.

- **Reduce attack surface for secrets in memory**
  - Only derive keypairs when needed (e.g. when sending or signing), not on every render.
  - Avoid keeping seed/mnemonic in long-lived component state if possible; prefer ephemeral variables scoped to operations or locked state.
  - Consider splitting responsibilities:
    - One layer that manages encrypted blobs.
    - One layer that derives short-lived `Keypair`s when needed.

- **Harden against XSS and content injection**
  - Audit all user inputs (mnemonic input, future forms) for any `dangerouslySetInnerHTML` or untrusted HTML usage (currently none, keep it that way).
  - Consider using a CSP (Content Security Policy) in production to reduce risk of inline script injection.
  - Avoid adding libraries that evaluate arbitrary strings or HTML without sanitization.

- **No secret logging**
  - Ensure no `console.log` calls ever print mnemonics, seeds, derivation paths, or private keys (keep this invariant as you add features).
  - Replace generic `console.log(error)` with structured error logging that never includes secret values.

---

## 2. Wallet & Network Features (P1)

- **Network configuration and switching**
  - Replace hardcoded Devnet RPC URLs with **environment-driven configuration**:
    - Example env vars: `NEXT_PUBLIC_SOLANA_RPC_DEVNET`, `NEXT_PUBLIC_SOLANA_RPC_MAINNET`, etc.
  - Add a **network selector** UI (Devnet / Testnet / Mainnet) with clear visual indicators of the current network (color, labels, warnings on Mainnet).
  - Gracefully handle RPC failures (e.g. fallback RPCs, or clear error states when the endpoint is unreachable).

- **Core wallet capabilities**
  - Implement basic **send SOL** flow:
    - Input validation (address format, amount, fee estimation).
    - Confirmation screen summarizing: from wallet, to address, amount, network, fees.
    - Progress and final success/failure states, with a link to explorer.
  - Implement **transaction history** (at least recent transfers):
    - Fetch from RPC or indexer for the selected wallet and network.
    - Provide filters and paging for usability.

- **Multiple wallets & account management**
  - Improve UX around multiple derived accounts:
    - Make index/labeling clearer (e.g. “Wallet #1 (index 0)”, “Wallet #2 (index 1)”).
    - Allow user-defined labels for wallets.
  - Add a high-level dashboard view:
    - Total balance across wallets for the selected network.
    - Quick switch between wallets.

- **Recovery and backup flows**
  - Create a dedicated **backup flow** that:
    - Walks the user through writing the mnemonic down.
    - Confirms they’ve backed it up (e.g. word-position quiz).
    - Explains that losing the phrase means losing funds.
  - For restore:
    - Provide clear guidance and validation errors for malformed mnemonics.

---

## 3. Application Architecture & Backend Strategy (P1–P2)

- **Decide on client-only vs backend-assisted**
  - If staying **client-only**:
    - Double-down on strong local encryption and good UX around secrets.
    - Keep the app stateless on the server (static hosting, no key material ever leaves the browser).
  - If adding a **backend**:
    - Clearly define what moves server-side (e.g. analytics, notifications, optional custodial features).
    - Never send mnemonics or private keys to the backend unless you explicitly design a custodial architecture with strict compliance and security controls.

- **API abstraction layer**
  - Introduce a small **RPC client abstraction**:
    - Single place that configures and instantiates `Connection` from `@solana/web3.js`.
    - Handles retries, timeouts, and error mapping.
    - Makes it easy to swap or add indexer providers in the future.

- **Configuration management**
  - Centralize config (networks, RPC URLs, explorer URLs, feature flags) into a single module.
  - Use typed config objects to avoid stringly-typed RPC URLs throughout the codebase.

---

## 4. Reliability, Error Handling & UX (P1)

- **Robust async and error handling**
  - Replace `alert()` usage with consistent UI toasts and inline error messages.
  - Add loading states for:
    - Balance fetches.
    - Transaction submissions.
    - Wallet generation/restoration.
  - Implement a top-level **React error boundary** to catch unexpected render-time errors and show a friendly fallback, with an option to reload.

- **User-centric error messages**
  - Translate low-level errors (e.g. network timeouts, RPC errors) into:
    - What happened in plain language.
    - What the user can try next (retry, check network, etc.).
  - Keep internal error details for logs, not for end users.

- **Destructive actions confirmations**
  - For actions like:
    - Deleting a wallet.
    - Clearing all stored data.
    - Revealing or copying secrets.
  - Require explicit confirmation (e.g. modal with “type DELETE to confirm” for clear-all).

- **Accessibility and usability**
  - Ensure keyboard navigation works across all key flows.
  - Provide clear focus states and ARIA attributes for dialogs, drawers, and buttons.
  - Make it obvious when the app is using Devnet vs Mainnet to prevent user mistakes.

---

## 5. Observability, Logging & Monitoring (P1–P2)

- **Client-side error tracking**
  - Integrate an error tracking service (e.g. Sentry) to capture:
    - Uncaught exceptions.
    - Promise rejections.
    - Performance metrics.
  - Redact/avoid any fields that could include mnemonics or private keys.

- **Structured logging**
  - Replace ad-hoc `console.log` calls with a simple logging utility that:
    - Annotates logs with context (feature, network, wallet index).
    - Strips out sensitive fields.
  - Use different log levels (`info`, `warn`, `error`) and disable verbose logs in production.

- **Telemetry and basic analytics (optional)**
  - If desired, track anonymous, aggregated metrics:
    - How often wallet creation/restore is used.
    - Error rates on send transactions.
  - Clearly disclose analytics in documentation and/or UI, and provide an opt-out.

---

## 6. Testing & Quality Assurance (P1)

- **Set up a test harness**
  - Choose a test runner (e.g. Jest or Vitest) plus React Testing Library.
  - Add a minimal initial test suite and wire `npm test` into the project.

- **Unit tests for crypto and derivation**
  - Cover:
    - Mnemonic validation and seed generation.
    - Derivation path logic (BIP44 for Solana, indexes, edge cases).
    - Serialization/deserialization of wallet data to/from storage.
  - Include tests for invalid inputs (malformed mnemonics, bad indexes) to guarantee safe failure modes.

- **Integration tests for key flows**
  - Test flows such as:
    - Creating a new wallet, backing up mnemonic, verifying it.
    - Restoring from an existing mnemonic and confirming wallet addresses match expectations.
    - Fetching balances on different networks.
  - Use mocks for RPC or a local validator for stable, reproducible tests.

- **End-to-end (E2E) tests**
  - Add Playwright or Cypress tests for:
    - Onboarding and wallet creation.
    - Unlocking/locking flows.
    - Sending a small Devnet transaction and seeing it confirmed.

---

## 7. CI/CD & Deployment (P1)

- **Continuous integration**
  - Add a GitHub Actions workflow (or equivalent) that, on each push/PR:
    - Installs dependencies.
    - Runs `npm run lint`.
    - Runs the test suite.
    - Builds the Next.js app.
  - Block merges on failing lint/tests to keep main branch healthy.

- **Deployment pipeline**
  - Set up automatic deployments (e.g. Vercel) with:
    - Separate environments for **development**, **staging**, and **production**.
    - Environment-specific RPC endpoints and feature flags.
  - Enable preview deployments per pull request for UX and QA review.

- **Release management**
  - Establish a simple release workflow:
    - Versioning (semantic versioning if you plan to ship frequently).
    - Changelog tracking for user-visible changes.

---

## 8. Documentation, Legal & Compliance (P2)

- **Developer documentation**
  - Expand `README.md` (or add dedicated docs) to include:
    - Architecture overview (client-only vs any backend).
    - How wallet derivation works and which standards you follow.
    - How to set up environment variables for RPC/network config.
    - Security considerations and assumptions.

- **User-facing docs**
  - Provide an in-app or linked help section that explains:
    - How to safely back up and store mnemonics.
    - Risks of losing the mnemonic or sharing it with others.
    - What Devnet/Testnet/Mainnet mean and which is safe for testing.

- **Legal disclaimers (if public-facing)**
  - Add clear disclaimers that:
    - This is non-custodial wallet software.
    - Users are responsible for their own keys and funds.
    - There is no guarantee against loss due to bugs, network issues, or misuse.
  - If you later add fiat ramps, KYC, or custodial features, revisit this section for compliance requirements.

---

## 9. Suggested Implementation Order

1. **P0 Security hardening**
   - Encrypt secrets at rest, add lock/unlock flow, validate mnemonics, and remove any potentially sensitive logging.
2. **Core wallet UX & reliability**
   - Network configuration/switching, send SOL, better error handling and loading states.
3. **Testing & CI**
   - Introduce a solid test harness, cover key flows, and wire everything into CI.
4. **Observability & documentation**
   - Add error tracking, structured logging, and robust developer/user docs.
5. **Advanced features**
   - Transaction history, richer dashboards, optional backend services, and advanced analytics or notifications.

###########################################
This is a **much better approach** than storing wallet data on the server! You're essentially using the password as an encryption key for locally-stored data. Here's what you need to know:

## Security Considerations

**Strengths of your approach:**

- Wallet data never leaves the user's device unencrypted
- Server compromise doesn't expose wallet information
- You're following a "zero-knowledge" principle
- Good for privacy-focused applications

**Critical implementation details:**

1. **Key Derivation** - Don't use the password directly as an encryption key:
   - Use PBKDF2, Argon2, or scrypt to derive the encryption key from the password
   - This protects against rainbow table attacks
   - Use a per-user salt (can be derived from their ID or stored locally)

2. **What to hash vs. what to encrypt with:**
   - **Server**: Store `bcrypt(password)` for authentication
   - **Client**: Derive encryption key from password using PBKDF2/Argon2 to encrypt/decrypt wallet data
   - These should be **different processes** - the hashed password sent to the server should NOT be usable to decrypt local data

3. **Local Storage Security:**
   - Use `localStorage` or `IndexedDB` for encrypted data
   - The encrypted blob is safe to store, but consider adding a "logout" feature that clears it
   - Users on shared computers are at risk if they don't log out

## Potential Vulnerabilities

**Password Reset Problem**: If a user forgets their password, they lose access to their wallet data forever (since the password is the encryption key). You need to:

- Warn users prominently about this
- Suggest they backup their encrypted data
- Consider offering recovery keys or seed phrases

**XSS Attacks**: If your site has an XSS vulnerability, attackers could steal the decrypted data while the user is logged in. Mitigation:

- Strict Content Security Policy (CSP)
- Input sanitization
- Use a well-audited encryption library (Web Crypto API, libsodium.js)

**Password Strength**: Weak passwords = weak encryption. Enforce strong password requirements.

## Sample Architecture

```
User enters password
    ↓
Client: Derive auth hash → Send to server for authentication
    ↓
Server: Verify bcrypt(password) matches DB → Return session token
    ↓
Client: Derive encryption key from same password (different derivation)
    ↓
Client: Decrypt local wallet data using encryption key
    ↓
Display wallet info (never send decrypted data to server)
```

**Is it safe?** Yes, if implemented correctly, this is actually more secure than storing wallet data on your server. But the implementation details matter enormously - use well-tested crypto libraries and be very careful with key derivation.

Would you like guidance on the specific crypto libraries to use or code examples?
