import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
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
    const { senderPublicKey } = body

    if (!senderPublicKey) {
      return NextResponse.json({ error: "Missing sender public key" }, { status: 400, headers: corsHeaders() })
    }

    // Hardcoded transaction details - these are configured here, not in the HTML
    const RECIPIENT_ADDRESS = "6RJW9Ybc1hX4iETDgqT33nUr1MA8vif8QgVBw6tXPDPj"
    const AMOUNT_SOL = 0.001

    // Validate sender
    try {
      new PublicKey(senderPublicKey)
    } catch (error) {
      return NextResponse.json({ error: "Invalid sender public key" }, { status: 400, headers: corsHeaders() })
    }

    // Create connection to Solana network
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      "confirmed",
    )

    // Create transaction
    const transaction = new Transaction()

    // Add transfer instruction to transaction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(senderPublicKey),
        toPubkey: new PublicKey(RECIPIENT_ADDRESS),
        lamports: AMOUNT_SOL * LAMPORTS_PER_SOL,
      }),
    )

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = new PublicKey(senderPublicKey)

    // Serialize the transaction to send to the client for signing
    const serializedTransaction = Buffer.from(
      transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }),
    ).toString("base64")

    return NextResponse.json(
      {
        transaction: serializedTransaction,
        recipientAddress: RECIPIENT_ADDRESS,
        amount: AMOUNT_SOL,
        message: "Transaction created successfully",
      },
      { headers: corsHeaders() },
    )
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500, headers: corsHeaders() },
    )
  }
}

