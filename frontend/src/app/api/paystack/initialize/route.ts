export async function POST(request: Request) {
  try {
    const { email, amount, reference, metadata } = await request.json()

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo (subunit)
        reference,
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/paystack/callback`,
      }),
    })

    const data = await response.json()

    if (data.status) {
      return Response.json({
        status: "success",
        data: {
          access_code: data.data.access_code,
          reference: data.data.reference,
        },
      })
    } else {
      return Response.json({ status: "error", message: data.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Paystack initialization error:", error)
    return Response.json({ status: "error", message: "Failed to initialize payment" }, { status: 400 })
  }
}
