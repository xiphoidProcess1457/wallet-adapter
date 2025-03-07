import { Connection } from "@solana/web3.js"
import { NextResponse } from "next/server"

// Add CORS headers to allow cross-origin requests
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { signedTransaction } = body

    if (!signedTransaction) {
      return NextResponse.json({ error: "Missing signed transaction" }, { status: 400, headers: corsHeaders() })
    }

    // Create connection to Solana network
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      "confirmed",
    )

    // Deserialize the transaction
    const transactionBuffer = Buffer.from(signedTransaction, "base64")

    // Send the transaction
    const signature = await connection.sendRawTransaction(transactionBuffer)

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, "confirmed")

    if (confirmation.value.err) {
      return NextResponse.json(
        { error: `Transaction failed: ${confirmation.value.err}` },
        { status: 500, headers: corsHeaders() },
      )
    }

    return NextResponse.json(
      {
        signature,
        message: "Transaction confirmed successfully",
      },
      { headers: corsHeaders() },
    )
  } catch (error) {
    console.error("Error confirming transaction:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500, headers: corsHeaders() },
    )
  }
}

