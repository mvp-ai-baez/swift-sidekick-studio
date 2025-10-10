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
    console.log('Creating Shopify checkout for items:', cartItems);

    // Create line items for Shopify checkout
    const lineItems = cartItems.map((item: any) => ({
      variantId: item.variantId,
      quantity: item.quantity || 1,
    }));

    // Shopify Storefront API GraphQL mutation
    const mutation = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lineItems,
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
    if (!data.data || !data.data.checkoutCreate) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response from Shopify');
    }
    
    if (data.data.checkoutCreate.checkoutUserErrors && data.data.checkoutCreate.checkoutUserErrors.length > 0) {
      console.error('Checkout errors:', data.data.checkoutCreate.checkoutUserErrors);
      throw new Error(data.data.checkoutCreate.checkoutUserErrors[0].message);
    }

    const checkoutUrl = data.data.checkoutCreate.checkout.webUrl;
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
