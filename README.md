# create-next-wallet@latest

Client-only Next.js app for generating Solana mnemonics, deriving multiple wallets, and viewing Devnet balances. Keys and mnemonics are kept in `localStorage`; there is no backend.

## Features
- Generate BIP39 mnemonic and seed, persist in `localStorage`.
- Derive multiple Solana wallets via BIP44 path `m/44'/501'/{index}'/0'` using `@solana/web3.js` + `ed25519-hd-key`.
- Paste existing mnemonic to restore/extend wallets.
- View/copy public and private keys; toggle private key visibility.
- Fetch Devnet balance for each wallet; delete individual wallets or clear all.
- Simple UI built with Tailwind + shadcn-inspired components.

## Tech Stack
- Next.js 16 (App Router) + React 19
- TypeScript, Tailwind CSS 4
- `@solana/web3.js`, `bip39`, `ed25519-hd-key`
- `sonner` for toasts, `lucide-react` icons, Radix/vaul drawers

## Prerequisites
- Node.js 18+ recommended
- npm (or pnpm/yarn/bun)

## Setup
```bash
npm install
npm run dev
# then open http://localhost:3000
```

## Usage Flow
1) On `/`, click **Generate** to create a mnemonic + seed, or paste an existing mnemonic and click **Add**. Data is saved to `localStorage`.  
2) You’re redirected to `/seed` where you can:
   - View mnemonic words (and copy them).
   - Add more wallets; each new wallet increments the derivation index.
   - Open a wallet card to view/copy keys and fetch Devnet balance.
   - Delete a wallet or clear everything (mnemonic, seed, wallets).

## Security Notes
- Keys/mnemonics never leave the browser; they persist in `localStorage`. Clear storage on shared devices.
- Private keys are shown only when toggled; copying sends them to the clipboard.
- Devnet endpoint: `https://api.devnet.solana.com`. For mainnet, change the RPC URL and tighten UX around secrets.

## Scripts
- `npm run dev` – start Next dev server
- `npm run build` – production build
- `npm run start` – start built app
- `npm run lint` – run ESLint

## Project Structure (high level)
- `app/page.tsx` – landing + mnemonic/seed generation and redirect
- `app/seed/page.tsx` – wallet management UI
- `components/components/*` – wallet header, mnemonic drawer, wallet cards, balance drawer
- `components/ui/*` – shared UI primitives

## Roadmap Ideas
- Add env-configurable RPC endpoints (Devnet/Mainnet/Testnet) and network switcher.
- Replace `localStorage` with encrypted storage (e.g., password-derived key) or a backend key vault; add logout/wipe flows.
- Add transaction actions: airdrop (Devnet), send SOL, recent activity view.
- Form validation for mnemonic input (word count/wordlist check) and guardrails around derivation path changes.
- Add unit/integration tests (wallet derivation, storage lifecycle, balance fetch) and CI lint/test.
- Improve UX: loading states, error toasts, clipboard feedback, responsive polish, dark mode toggle.
- Publish a read-only demo deployment (e.g., Vercel) with a clear “not for production funds” warning.
