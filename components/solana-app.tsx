"use client"

import { useState, useMemo, useCallback } from "react"
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Button } from "@/components/ui/button"

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css"

// Main app wrapper that provides wallet context
export default function SolanaApp() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    // Use a reliable public endpoint that doesn't require authentication
    return "https://misty-proportionate-hill.solana-mainnet.quiknode.pro/f257f57ee4b9fc46b2730b19b78d3151d0fda8c7/"
  }, [])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaAppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

// The actual app content that uses the wallet context
function SolanaAppContent() {
  const { connected, publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
      <div className="p-3 bg-blue-100 text-blue-800 rounded-md text-sm">
        <p className="font-semibold">Important:</p>
        <p>This app is configured to use Solana Devnet for testing.</p>
        <p>Please make sure your wallet is set to Devnet before connecting.</p>
      </div>

      <div className="flex justify-center">
        <WalletMultiButton />
      </div>

      {connected && (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-center mb-2 p-2 bg-yellow-100 rounded-md">
            Please ensure your wallet is connected to <strong>Devnet</strong> for testing
          </div>
          <Button id="sendSol" onClick={handleSendSol} disabled={isLoading || !publicKey} className="w-full">
            {isLoading
              ? "Sending..."
              : `Send ${AMOUNT_SOL} SOL to ${RECIPIENT_ADDRESS.slice(0, 4)}...${RECIPIENT_ADDRESS.slice(-4)}`}
          </Button>
        </div>
      )}

      {transactionStatus && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">{transactionStatus}</div>}

      {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">Error: {error}</div>}
    </div>
  )
}

