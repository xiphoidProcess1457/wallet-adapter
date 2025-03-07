import { Connection, type PublicKey, Transaction } from "@solana/web3.js"

// Default RPC URL
const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com"

// Create a Solana connection
export const createConnection = (rpcUrl = DEFAULT_RPC_URL) => {
  return new Connection(rpcUrl, "confirmed")
}

// Decode a base64 transaction
export const decodeTransaction = (encodedTransaction: string): Transaction => {
  const buffer = Buffer.from(encodedTransaction, "base64")
  return Transaction.from(buffer)
}

// Encode a transaction to base64
export const encodeTransaction = (transaction: Transaction): string => {
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  })
  return serializedTransaction.toString("base64")
}

// Format a public key for display
export const formatPublicKey = (publicKey: string | PublicKey, length = 4): string => {
  const address = typeof publicKey === "string" ? publicKey : publicKey.toString()
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

