'use server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession({
  bookId, bookTitle, coverImage, deliveryFee,
  bookSlug, userId, userName, userEmail, librarianId,
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Delivery — ${bookTitle}`,
            images: [coverImage],
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { bookId, bookTitle, coverImage, deliveryFee, bookSlug, userId, userName, userEmail, librarianId },
    success_url: `${baseUrl}/browse/${bookSlug}?payment=success&bookId=${bookId}&userId=${userId}&userName=${encodeURIComponent(userName)}&userEmail=${encodeURIComponent(userEmail)}&librarianId=${librarianId}&deliveryFee=${deliveryFee}&bookTitle=${encodeURIComponent(bookTitle)}&coverImage=${encodeURIComponent(coverImage)}`,
    cancel_url: `${baseUrl}/browse/${bookSlug}?payment=cancelled`,
  });

  return { url: session.url };
}