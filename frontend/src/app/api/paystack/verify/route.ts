export async function POST(request: Request) {
  try {
    const { reference } = await request.json()

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.status && data.data.status === "success") {
      return Response.json({
        status: "success",
        data: {
          reference: data.data.reference,
          amount: data.data.amount / 100, // Convert from kobo back to naira
          status: data.data.status,
          paid_at: data.data.paid_at,
          customer: data.data.customer,
        },
      })
    } else {
      return Response.json(
        {
          status: "failed",
          message: "Payment verification failed",
          data: data.data,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Paystack verification error:", error)
    return Response.json({ status: "error", message: "Failed to verify payment" }, { status: 500 })
  }
}
