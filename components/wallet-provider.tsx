"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Connection, Transaction } from "@solana/web3.js"

// Define wallet adapter interface
interface WalletAdapter {
  name: string
  icon: string
  publicKey: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transaction: any) => Promise<any>
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
}

// Define wallet context
interface WalletContextType {
  wallets: WalletAdapter[]
  selectedWallet: WalletAdapter | null
  connecting: boolean
  connected: boolean
  connectWallet: (adapter: WalletAdapter) => Promise<void>
  disconnectWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export default function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<WalletAdapter[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletAdapter | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)

  // Detect available wallets
  useEffect(() => {
    const detectWallets = () => {
      const detectedWallets: WalletAdapter[] = []

      // Detect Phantom
      if (window.phantom?.solana) {
        detectedWallets.push({
          name: "Phantom",
          icon: "https://www.phantom.app/img/logo.png",
          publicKey: null,
          connect: async () => {
            try {
              const resp = await window.phantom.solana.connect()
              return resp.publicKey.toString()
            } catch (error) {
              console.error("Connection error:", error)
              throw error
            }
          },
          disconnect: async () => {
            await window.phantom.solana.disconnect()
          },
          signTransaction: async (transaction) => {
            return await window.phantom.solana.signTransaction(transaction)
          },
          sendTransaction: async (transaction, connection) => {
            const { signature } = await window.phantom.solana.signAndSendTransaction(transaction)
            return signature
          },
        })
      }

      // Detect Solflare
      if (window.solflare) {
        detectedWallets.push({
          name: "Solflare",
          icon: "https://solflare.com/assets/logo.svg",
          publicKey: null,
          connect: async () => {
            try {
              const resp = await window.solflare.connect()
              return resp.publicKey.toString()
            } catch (error) {
              console.error("Connection error:", error)
              throw error
            }
          },
          disconnect: async () => {
            await window.solflare.disconnect()
          },
          signTransaction: async (transaction) => {
            return await window.solflare.signTransaction(transaction)
          },
          sendTransaction: async (transaction, connection) => {
            const { signature } = await window.solflare.signAndSendTransaction(transaction)
            return signature
          },
        })
      }

      // Detect Backpack
      if (window.backpack?.solana) {
        detectedWallets.push({
          name: "Backpack",
          icon: "https://backpack.app/assets/backpack-logo.svg",
          publicKey: null,
          connect: async () => {
            try {
              const resp = await window.backpack.solana.connect()
              return resp.publicKey.toString()
            } catch (error) {
              console.error("Connection error:", error)
              throw error
            }
          },
          disconnect: async () => {
            await window.backpack.solana.disconnect()
          },
          signTransaction: async (transaction) => {
            return await window.backpack.solana.signTransaction(transaction)
          },
          sendTransaction: async (transaction, connection) => {
            const { signature } = await window.backpack.solana.signAndSendTransaction(transaction)
            return signature
          },
        })
      }

      setWallets(detectedWallets)
    }

    // Wait for window to be defined (client-side only)
    if (typeof window !== "undefined") {
      detectWallets()
    }
  }, [])

  const connectWallet = async (adapter: WalletAdapter) => {
    try {
      setConnecting(true)
      const publicKey = await adapter.connect()

      // Update the adapter with the public key
      const updatedAdapter = {
        ...adapter,
        publicKey,
      }

      setSelectedWallet(updatedAdapter)
      setConnected(true)
      return publicKey
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    if (selectedWallet) {
      try {
        await selectedWallet.disconnect()
        setSelectedWallet(null)
        setConnected(false)
      } catch (error) {
        console.error("Failed to disconnect wallet:", error)
        throw error
      }
    }
  }

  return (
    <WalletContext.Provider
      value={{
        wallets,
        selectedWallet,
        connecting,
        connected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Add TypeScript declarations for wallet extensions
declare global {
  interface Window {
    phantom?: {
      solana: {
        connect: () => Promise<{ publicKey: { toString: () => string } }>
        disconnect: () => Promise<void>
        signTransaction: (transaction: any) => Promise<any>
        signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>
      }
    }
    solflare?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
      signTransaction: (transaction: any) => Promise<any>
      signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>
    }
    backpack?: {
      solana: {
        connect: () => Promise<{ publicKey: { toString: () => string } }>
        disconnect: () => Promise<void>
        signTransaction: (transaction: any) => Promise<any>
        signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>
      }
    }
  }
}

