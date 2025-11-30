import { waitUntil } from "@vercel/functions";
import type { Payment } from "@whop/sdk/resources.js";
import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

export async function POST(request: NextRequest): Promise<Response> {
  // Validate the webhook to ensure it's from Whop
  const requestBodyText = await request.text();
  const headers = Object.fromEntries(request.headers);
  const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });

  console.log("[WEBHOOK DATA]", webhookData);

  // Handle the webhook event
  if (webhookData.type === "payment.succeeded") {
    waitUntil(handlePaymentSucceeded(webhookData.data));
  }

  // Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
  return new Response("OK", { status: 200 });
}

async function handlePaymentSucceeded(payment: Payment) {
  // This is a placeholder for a potentially long running operation
  // In a real scenario, you might need to fetch user data, update a database, etc.

  if (!payment.membership) throw new Error("Membership not found");
  const membership = await whopsdk.memberships.retrieve(payment.membership.id);
  console.log("[MEMBERSHIP]", membership);

  console.log("[PAYMENT SUCCEEDED]", payment);
}
