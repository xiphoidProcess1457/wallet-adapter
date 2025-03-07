import SolanaApp from "@/components/solana-app"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Solana Wallet App</h1>
        <SolanaApp />
      </div>
    </main>
  )
}

