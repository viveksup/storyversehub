import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';
let supabase: any;

try {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

async function createRazorpayOrder(amount: number, currency: string) {
  const key_id = Deno.env.get('RAZORPAY_KEY_ID');
  const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');
  
  if (!key_id || !key_secret) {
    throw new Error('Missing Razorpay credentials');
  }

  const auth = btoa(`${key_id}:${key_secret}`);
  
  const response = await fetch(`${RAZORPAY_API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `order_${Date.now()}`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Razorpay API error: ${error.error?.description || 'Unknown error'}`);
  }

  return response.json();
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Supabase client is initialized
    if (!supabase) {
      throw new Error('Payment service is not properly configured');
    }

    const { plan, userId } = await req.json();

    if (!plan || !userId) {
      throw new Error('Missing required parameters: plan and userId');
    }

    // Get plan amount
    const amount = plan === 'premium' ? 1299 : 2999; // Amount in INR
    const currency = 'INR';

    // Create Razorpay order using direct API call
    const order = await createRazorpayOrder(amount, currency);

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: amount * 100,
        currency,
        razorpay_order_id: order.id,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing the payment'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});