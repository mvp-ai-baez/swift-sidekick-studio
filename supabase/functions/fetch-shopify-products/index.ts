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
    console.log('Fetching products from Shopify store:', SHOPIFY_STORE_DOMAIN);

    // Shopify Storefront API GraphQL query
    const query = `
      {
        products(first: 20) {
          edges {
            node {
              id
              title
              description
              handle
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', response.status, errorText);
      throw new Error(`Shopify API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched products from Shopify');

    // Transform Shopify products to our format
    const products = data.data.products.edges.map((edge: any) => {
      const node = edge.node;
      const price = parseFloat(node.priceRange.minVariantPrice.amount);
      const image = node.images.edges[0]?.node.url || '';
      const variantId = node.variants.edges[0]?.node.id || '';
      const availableForSale = node.variants.edges[0]?.node.availableForSale || false;

      return {
        id: node.id,
        variantId,
        name: node.title,
        price,
        currencyCode: node.priceRange.minVariantPrice.currencyCode,
        image,
        description: node.description,
        handle: node.handle,
        availableForSale,
      };
    });

    return new Response(
      JSON.stringify({ products }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to fetch products from Shopify'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
