"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletNotConnectedError } from "@solana/wallet-adapter-base"
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"

interface SendSolButtonProps {
  onTransactionStart: () => void
  onTransactionComplete: (status: string) => void
  onTransactionError: (error: string) => void
  isLoading: boolean
}

export default function SendSolButton({
  onTransactionStart,
  onTransactionComplete,
  onTransactionError,
  isLoading,
}: SendSolButtonProps) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  // Hardcoded recipient address and amount
  const RECIPIENT_ADDRESS = "6RJW9Ybc1hX4iETDgqT33nUr1MA8vif8QgVBw6tXPDPj"
  const AMOUNT_SOL = 0.001 // 0.001 SOL

  const handleSendSol = useCallback(async () => {
    if (!publicKey) {
      onTransactionError("Wallet not connected")
      throw new WalletNotConnectedError()
    }

    onTransactionStart()

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
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      })

      onTransactionComplete(`Transaction successful! Signature: ${signature}`)
    } catch (error) {
      console.error("Error sending SOL:", error)
      onTransactionError(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }, [publicKey, connection, sendTransaction, onTransactionStart, onTransactionComplete, onTransactionError])

  return (
    <Button id="sendSol" onClick={handleSendSol} disabled={isLoading || !publicKey} className="w-full">
      {isLoading
        ? "Sending..."
        : `Send ${AMOUNT_SOL} SOL to ${RECIPIENT_ADDRESS.slice(0, 4)}...${RECIPIENT_ADDRESS.slice(-4)}`}
    </Button>
  )
}

