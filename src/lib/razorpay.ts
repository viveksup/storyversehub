import { supabase } from './supabase';

export async function initializePayment(plan: 'premium' | 'family') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan, userId: user.id }),
    });

    if (!response.ok) throw new Error('Failed to initialize payment');

    const { orderId, amount, currency } = await response.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: 'StoryVerse Hub',
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
      order_id: orderId,
      handler: async function (response: any) {
        await verifyPayment(response, plan);
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: '#6f5cd4',
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error;
  }
}

async function verifyPayment(response: any, plan: string) {
  try {
    const verifyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        plan,
      }),
    });

    if (!verifyResponse.ok) throw new Error('Payment verification failed');

    // Reload user data or update UI as needed
    window.location.reload();
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
}