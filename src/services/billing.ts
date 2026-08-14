import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

const isMock = 
  process.env.MOCK_PAYMENTS === 'true' || 
  process.env.NODE_ENV === 'development' || 
  !process.env.PAYSTACK_SECRET_KEY || 
  process.env.PAYSTACK_SECRET_KEY.startsWith('re_placeholder') || 
  !process.env.STRIPE_SECRET_KEY || 
  process.env.STRIPE_SECRET_KEY === 'sk_test_mock';

export const BillingService = {
  // PAYSTACK
  async createPaystackTransaction(email: string, amountNGN: number, reference: string) {
    if (isMock) {
      return {
        status: true,
        data: {
          authorization_url: `/mock-checkout?gateway=paystack&reference=${reference}&amount=${amountNGN}`
        }
      };
    }

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
    if (isMock) {
      return { status: true, data: { status: 'success' } };
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });
    return response.json();
  },

  // STRIPE
  async createStripeCheckoutSession(email: string, amountNGN: number, reference: string, successUrl: string, cancelUrl: string) {
    if (isMock) {
      return {
        url: `/mock-checkout?gateway=stripe&reference=${reference}&amount=${amountNGN}`
      };
    }

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
    return {
      status: 'MOCK_PAYPAL_ORDER_CREATED',
      amount: amountNGN
    };
  }
};
