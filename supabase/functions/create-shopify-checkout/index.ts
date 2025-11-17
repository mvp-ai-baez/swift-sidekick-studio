import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'exclusivos-baez.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cartItems } = await req.json();
    
    // Validate input - prevent abuse and malicious data
    if (!cartItems || !Array.isArray(cartItems)) {
      return new Response(
        JSON.stringify({ error: 'cartItems must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cartItems.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Too many items in cart' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!item.variantId || typeof item.variantId !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid variant ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (item.quantity && (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 99)) {
        return new Response(
          JSON.stringify({ error: 'Invalid quantity' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('Creating Shopify checkout for items:', cartItems);

    // Prepare cart lines for Shopify Cart API
    const lines = cartItems.map((item: any) => ({
      merchandiseId: item.variantId,
      quantity: item.quantity || 1,
    }));

    // Shopify Storefront API GraphQL mutation
    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines,
      },
    };

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query: mutation, variables }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', response.status, errorText);
      throw new Error(`Shopify API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Shopify response:', JSON.stringify(data, null, 2));
    
    // Check for GraphQL errors
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0].message);
    }

    // Check if data exists
    if (!data.data || !data.data.cartCreate) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response from Shopify');
    }
    
    if (data.data.cartCreate.userErrors && data.data.cartCreate.userErrors.length > 0) {
      console.error('Cart errors:', data.data.cartCreate.userErrors);
      throw new Error(data.data.cartCreate.userErrors[0].message);
    }

    let checkoutUrl = data.data.cartCreate.cart?.checkoutUrl;
    if (!checkoutUrl) {
      console.error('Missing checkoutUrl in response:', data);
      throw new Error('Missing checkout URL from Shopify');
    }
    
    // Normalize to myshopify.com domain to ensure checkout works across any custom domain
    try {
      const urlObj = new URL(checkoutUrl);
      if (urlObj.hostname !== SHOPIFY_STORE_DOMAIN) {
        urlObj.hostname = SHOPIFY_STORE_DOMAIN;
        urlObj.protocol = 'https:';
        urlObj.port = '';
      }
      checkoutUrl = urlObj.toString();
    } catch (_) {
      // Fallback: replace host segment if parsing failed
      const pathStart = checkoutUrl.indexOf('/', 8); // after protocol
      const path = pathStart !== -1 ? checkoutUrl.substring(pathStart) : '/';
      checkoutUrl = `https://${SHOPIFY_STORE_DOMAIN}${path}`;
    }
    console.log('Successfully created checkout:', checkoutUrl);

    return new Response(
      JSON.stringify({ checkoutUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating Shopify checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to create Shopify checkout'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
