# OPRF & Nullifier Generation Demo

A Next.js demo project for requesting Human Network **Oblivious Pseudorandom Function (OPRF)** to derieve Human Keys. 

- What are [Human Keys](https://human.tech/blog/human-keys)?
- Human Network [documentations](https://docs.network.human.tech/)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ or later
- pnpm (recommended) or npm

### Installation

1. Clone or navigate to this project directory
2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Start the development server:

```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧮 How It Works

### Oblivious Pseudorandom Function

OPRF (Oblivious Pseudorandom Function) provides enhanced privacy through:
- Cryptographic protocols that hide input data from servers
- Uses the `@holonym-foundation/mishtiwasm` library
- Provides stronger privacy guarantees

**Benefits:**
- Enhanced privacy protection
- Server cannot see input data
- Cryptographically secure
- Prevents correlation attacks

## 🔧 Configuration

The demo allows you to configure on UI:

- **Signer URL**: Request for a demo signer or deploy a singer on your own

[Deploy signer to request Human Network on behalf of users](https://docs.network.human.tech/for-developers/making-requests-to-human-network/signer-on-behalf-of-users)

## 📁 Project Structure

```
src/
├── lib/
│   ├── humanNetwork.ts         # request to the Human Network and helper functions
├── app/
│   ├── page.tsx                # Main demonstration interface
│   ├── layout.tsx              # App layout
│   └── globals.css             # Global styles
└── next.config.ts              # Next.js configuration with WASM support
```

## 🎯 Usage Examples

### Request OPRF

```typescript
import { requestFromSigner } from '@/lib/humanNetwork';

const result = await requestFromSigner({
  value: [string or hash],
  method: 'OPRFSecp256k1',
  signerUrl: [singer url]
});
```

### Derive Human Key from returned response

```typescript
import { requestFromSigner, checkAndDeriveHumanKey } from '@/lib/humanNetwork';

const result = await requestFromSigner({
  value: [string or hash],
  method: 'OPRFSecp256k1',
  signerUrl: [singer url]
});

const derivedResult = await checkAndDeriveHumanKey(result);

// derivedResult contains privateKey, publicKey and address (ethereum address)
```

## ⚠️ Disclaimer

This is a demonstration project for educational purposes. Do not use in production without proper security review and testing.
