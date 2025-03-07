# Solana Wallet Integration with Vercel

This project demonstrates how to integrate Solana wallets with a React frontend using the official Solana wallet adapter libraries.

## Features

- Connect to multiple Solana wallets (Phantom, Solflare, Backpack, etc.)
- Send SOL transactions directly from the browser
- Proper transaction handling with the Solana blockchain

## Implementation Details

- Uses the official Solana wallet adapter libraries
- Sends 0.001 SOL to a hardcoded recipient address: `6RJW9Ybc1hX4iETDgqT33nUr1MA8vif8QgVBw6tXPDPj`
- Handles transaction confirmation and error states

## Dependencies

```bash
npm install --save \
    @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-react-ui \
    @solana/wallet-adapter-wallets \
    @solana/web3.js

