import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Razorpay from 'npm:razorpay@2.9.2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

// Initialize Razorpay client with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
    key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
  });
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
  throw new Error('Payment service initialization failed');
}

// Initialize Supabase client with error handling
let supabase;
try {
  supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw new Error('Database service initialization failed');
}

// Enhanced CORS headers with security headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'",
};

serve(async (req) => {
  try {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed',
          details: 'Only POST requests are allowed'
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: 'Failed to parse JSON body'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !plan) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'Payment ID, Order ID, Signature, and Plan are required'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Verify signature
    const signatureBody = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = createHmac('sha256', Deno.env.get('RAZORPAY_KEY_SECRET') || '')
      .update(signatureBody.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid signature',
          details: 'Payment signature verification failed'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Update payment status with error handling
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        razorpay_payment_id,
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (paymentError) {
      console.error('Payment update failed:', paymentError);
      throw new Error('Failed to update payment status');
    }

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Create subscription with error handling
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: payment.user_id,
        plan,
        current_period_end: endDate.toISOString(),
      });

    if (subscriptionError) {
      console.error('Subscription creation failed:', subscriptionError);
      throw new Error('Failed to create subscription');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment verified and subscription created successfully'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Function execution failed:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});