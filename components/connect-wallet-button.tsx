"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ConnectWalletButton() {
  const { wallets, selectedWallet, connected, connectWallet, disconnectWallet } = useWallet()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  const handleConnect = () => {
    if (!connected) {
      setIsDialogOpen(true)
    } else {
      setShowDisconnectConfirm(true)
    }
  }

  const handleWalletSelect = async (wallet: any) => {
    try {
      await connectWallet(wallet)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
      setShowDisconnectConfirm(false)
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const shortenAddress = (address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <>
      <Button id="connectWallet" onClick={handleConnect} className="w-full" variant={connected ? "outline" : "default"}>
        {connected ? `Connected: ${shortenAddress(selectedWallet?.publicKey)}` : "Connect Wallet"}
      </Button>

      {/* Wallet Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a wallet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {wallets.length > 0 ? (
              wallets.map((wallet, index) => (
                <Button
                  key={index}
                  onClick={() => handleWalletSelect(wallet)}
                  className="flex justify-between items-center"
                  variant="outline"
                >
                  <span>{wallet.name}</span>
                  {wallet.icon && (
                    <img src={wallet.icon || "/placeholder.svg"} alt={`${wallet.name} icon`} className="h-6 w-6 ml-2" />
                  )}
                </Button>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No Solana wallets detected. Please install a wallet extension.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect Wallet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center mb-4">Are you sure you want to disconnect your wallet?</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setShowDisconnectConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

