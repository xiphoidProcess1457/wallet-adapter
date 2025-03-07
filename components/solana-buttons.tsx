"use client"

import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { useState, useCallback } from "react"
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"

// Minimal component that just renders the wallet buttons
export default function SolanaButtons() {
  const { connected, publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Hardcoded recipient address and amount
  const RECIPIENT_ADDRESS = "6RJW9Ybc1hX4iETDgqT33nUr1MA8vif8QgVBw6tXPDPj"
  const AMOUNT_SOL = 0.001 // 0.001 SOL

  const handleSendSol = useCallback(async () => {
    if (!publicKey) {
      setError("Wallet not connected")
      return
    }

    setIsLoading(true)
    setTransactionStatus(null)
    setError(null)

    try {
      // Create a new transaction
      const transaction = new Transaction()

      // Add transfer instruction to transaction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(RECIPIENT_ADDRESS),
          lamports: AMOUNT_SOL * LAMPORTS_PER_SOL,
        }),
      )

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Send the transaction
      const signature = await sendTransaction(transaction, connection)

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      })

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
      }

      setTransactionStatus(`Transaction successful! Signature: ${signature}`)
    } catch (error) {
      console.error("Error sending SOL:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, connection, sendTransaction])

  return (
    <div className="flex flex-col gap-4">
      {/* Just the wallet button */}
      <div className="flex justify-center">
        <WalletMultiButton id="connectWallet" />
      </div>

      {/* Just the send SOL button */}
      {connected && (
        <Button id="sendSol" onClick={handleSendSol} disabled={isLoading || !publicKey} className="w-full">
          {isLoading
            ? "Sending..."
            : `Send ${AMOUNT_SOL} SOL to ${RECIPIENT_ADDRESS.slice(0, 4)}...${RECIPIENT_ADDRESS.slice(-4)}`}
        </Button>
      )}

      {/* Status messages */}
      {transactionStatus && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">{transactionStatus}</div>}
      {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">Error: {error}</div>}
    </div>
  )
}

