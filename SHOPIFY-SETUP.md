# Shopify Integration Setup Guide

This guide will walk you through setting up this headless storefront with your Shopify store, including full marketing integrations (Google Tag Manager, Meta/TikTok pixels, and Klaviyo).

## Overview

This is a **hybrid headless setup**:
- **Frontend**: Next.js (this project) - handles UI and animations
- **Backend**: Shopify - manages products, cart, checkout, and orders
- **Marketing**: GTM for pixel management, Klaviyo for email marketing

## Step 1: Set Up Your Shopify Store

### 1.1 Create a Custom App

1. Log into your Shopify Admin
2. Go to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app**
4. Name it (e.g., "Next.js Storefront")
5. Click **Create app**

### 1.2 Configure Storefront API Access

1. In your app, go to **Configuration** tab
2. Under **Storefront API**, click **Configure**
3. Enable the following permissions:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_customers`

4. Click **Save**

### 1.3 Generate Access Token

1. Go to **API credentials** tab
2. Under **Storefront API access token**, click **Install app**
3. Copy the **Access Token** (you'll need this for `.env.local`)
4. Your store domain is: `your-store.myshopify.com`

## Step 2: Configure Environment Variables

1. Open `.env.local` in the project root
2. Update with your credentials:

```env
# Shopify Storefront API
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token_here

# Google Tag Manager (get this from GTM)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Klaviyo (get this from Klaviyo Settings)
NEXT_PUBLIC_KLAVIYO_COMPANY_ID=your_company_id_here
```

## Step 3: Add Products to Shopify

1. In Shopify Admin, go to **Products** → **Add product**
2. Add your products with:
   - Title
   - Description
   - Images
   - Variants (for sizes like S-M, M-L, XL-XXL)
   - Price
3. Make sure products are set to **Active** and available in your sales channel

## Step 4: Set Up Google Tag Manager

### 4.1 Create GTM Account

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new account and container
3. Choose **Web** as the platform
4. Copy your **GTM ID** (format: GTM-XXXXXXX)
5. Add it to `.env.local`

### 4.2 Add Tags via GTM (Recommended Approach)

This is the **hybrid advantage** - manage all pixels from GTM UI without code changes!

#### Add Google Analytics 4

1. In GTM, click **Tags** → **New**
2. Choose **Google Analytics: GA4 Configuration**
3. Add your **Measurement ID**
4. Set trigger to **All Pages**
5. Save and publish

#### Add Meta Pixel

1. In GTM, click **Tags** → **New**
2. Choose **Custom HTML**
3. Paste your Meta Pixel code:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>
```

4. Set trigger to **All Pages**
5. Save and publish

#### Add TikTok Pixel

1. In GTM, click **Tags** → **New**
2. Choose **Custom HTML**
3. Paste your TikTok Pixel code:

```html
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('YOUR_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>
```

4. Set trigger to **All Pages**
5. Save and publish

## Step 5: Set Up Klaviyo

1. Log into [Klaviyo](https://www.klaviyo.com/)
2. Go to **Settings** → **Account**
3. Find your **Public API Key** (Company ID)
4. Add it to `.env.local` as `NEXT_PUBLIC_KLAVIYO_COMPANY_ID`

### Shopify Integration

1. In Klaviyo, go to **Integrations** → **Shopify**
2. Connect your Shopify store
3. Enable these syncs:
   - Placed Order
   - Fulfilled Order
   - Cancelled Order
   - Customer data

This ensures Klaviyo tracks purchases that happen through Shopify checkout!

## Step 6: Test Your Setup

### 6.1 Start Development Server

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

### 6.2 Test Product Loading

- You should see your Shopify products on the homepage
- If products don't load, check:
  - `.env.local` credentials are correct
  - Products are published in Shopify
  - Storefront API permissions are enabled
  - Check browser console for errors

### 6.3 Test Cart & Checkout

1. Click on a product
2. Select a size
3. Add to cart
4. Click cart icon
5. Click **CHECKOUT**
6. You should be redirected to Shopify checkout

### 6.4 Test Tracking

1. Open browser DevTools → Console
2. Click on a product - should see `view_item` in dataLayer
3. Add to cart - should see `add_to_cart` in dataLayer
4. Click checkout - should see `begin_checkout` in dataLayer

#### Verify in GTM

1. Go to GTM → **Preview** mode
2. Enter your site URL
3. Navigate and verify tags fire correctly

## Step 7: Deploy to Production

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables in **Settings** → **Environment Variables**
5. Deploy

### Option B: Other Platforms

- **Netlify**: Similar to Vercel
- **AWS Amplify**: For AWS users
- **Self-hosted**: Use `pnpm build` and `pnpm start`

## Marketing Tools Configuration

### Events Tracked Automatically

The following events are automatically tracked and sent to GTM, Meta Pixel, and Klaviyo:

1. **Page View** - Every page load
2. **View Product** - When viewing product detail page
3. **Add to Cart** - When adding items to cart
4. **Begin Checkout** - When clicking checkout button

### Shopify Checkout Events

Purchase events fire automatically from Shopify checkout since you redirect there. These include:

- **Purchase** (fires on Shopify checkout completion)
- All Meta Pixel purchase tracking
- All Klaviyo order tracking

## Troubleshooting

### Products Not Loading

- Check Shopify credentials in `.env.local`
- Verify products are published
- Check browser console for GraphQL errors
- Verify Storefront API permissions

### Cart Not Working

- Check browser console for errors
- Verify Shopify cart API permissions
- Clear localStorage: `localStorage.removeItem('shopify-cart-id')`

### Tracking Not Working

- Verify GTM ID in `.env.local`
- Check GTM preview mode
- Ensure GTM container is published
- Check browser console for dataLayer events

### Checkout Redirects to 404

- Make sure your Shopify checkout is enabled
- Verify cart has valid items
- Check Shopify store settings

## Advanced Customization

### Map Shopify Variants to Custom Sizes

Edit `components/cart-context.tsx` line 91 to map variant titles to your size system.

### Add More Tracking Events

Edit `lib/analytics.ts` to add custom events like:
- Search
- Product List View
- Remove from Cart

### Customize Checkout Experience

While checkout happens on Shopify, you can customize it in:
- Shopify Admin → **Settings** → **Checkout**

## What's Tracked Where?

| Event | GTM/GA4 | Meta Pixel | TikTok Pixel | Klaviyo | Where Fires |
|-------|---------|------------|--------------|---------|-------------|
| Page View | ✅ | ✅ | ✅ | ✅ | Next.js |
| View Product | ✅ | ✅ | ✅ | ✅ | Next.js |
| Add to Cart | ✅ | ✅ | ✅ | ✅ | Next.js |
| Begin Checkout | ✅ | ✅ | ✅ | ✅ | Next.js |
| Purchase | ✅ | ✅ | ✅ | ✅ | Shopify Checkout |
| Order Fulfillment | - | - | - | ✅ | Shopify (via Klaviyo) |

## Benefits of This Setup

1. ✅ **Beautiful UX** - Keep the animations and performance
2. ✅ **Easy Product Management** - Update products in Shopify
3. ✅ **Shopify Checkout** - PCI compliant, trusted checkout
4. ✅ **Centralized Pixel Management** - All pixels in GTM UI
5. ✅ **Full Tracking** - Complete funnel analytics
6. ✅ **Email Marketing** - Klaviyo integrated with Shopify
7. ✅ **Scalable** - Add more features without Liquid limitations

## Support

- Shopify API Docs: https://shopify.dev/docs/api/storefront
- GTM Docs: https://support.google.com/tagmanager
- Klaviyo Docs: https://help.klaviyo.com/
- Next.js Commerce Reference: https://github.com/vercel/commerce
