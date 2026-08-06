import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export const BillingService = {
  // PAYSTACK
  async createPaystackTransaction(email: string, amountNGN: number, reference: string) {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: amountNGN * 100, // Paystack expects kobo
        reference,
        currency: 'NGN'
      })
    });
    return response.json();
  },

  async verifyPaystackTransaction(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });
    return response.json();
  },

  // STRIPE
  async createStripeCheckoutSession(email: string, amountNGN: number, reference: string, successUrl: string, cancelUrl: string) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'ngn',
            product_data: {
              name: 'KOVA SaaS Subscription',
            },
            unit_amount: amountNGN * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: reference,
    });
    return session;
  },

  // PAYPAL (Mock/Placeholder for checkout sdk logic)
  async createPayPalOrder(amountNGN: number) {
    // Requires setting up a PayPal App and fetching access token
    return {
      status: 'MOCK_PAYPAL_ORDER_CREATED',
      amount: amountNGN
    };
  }
};
