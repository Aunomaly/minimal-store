// Analytics tracking utilities

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _learnq?: any[];
  }
}

// Initialize dataLayer
export function initDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

// Google Tag Manager
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'pageview',
      page: url,
    });
  }
}

// Product View Event
export function trackProductView(product: {
  id: string;
  name: string;
  price: string;
  currencyCode?: string;
}) {
  if (typeof window !== 'undefined') {
    // GTM/GA4
    window.dataLayer?.push({
      event: 'view_item',
      ecommerce: {
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: parseFloat(product.price),
            currency: product.currencyCode || 'USD',
          },
        ],
      },
    });

    // Facebook Pixel
    window.fbq?.('track', 'ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: parseFloat(product.price),
      currency: product.currencyCode || 'USD',
    });

    // Klaviyo
    window._learnq?.push([
      'track',
      'Viewed Product',
      {
        ProductName: product.name,
        ProductID: product.id,
        Price: parseFloat(product.price),
      },
    ]);
  }
}

// Add to Cart Event
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: string;
  quantity: number;
  variantId?: string;
  currencyCode?: string;
}) {
  if (typeof window !== 'undefined') {
    // GTM/GA4
    window.dataLayer?.push({
      event: 'add_to_cart',
      ecommerce: {
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_variant: product.variantId,
            price: parseFloat(product.price),
            quantity: product.quantity,
            currency: product.currencyCode || 'USD',
          },
        ],
      },
    });

    // Facebook Pixel
    window.fbq?.('track', 'AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: parseFloat(product.price) * product.quantity,
      currency: product.currencyCode || 'USD',
    });

    // Klaviyo
    window._learnq?.push([
      'track',
      'Added to Cart',
      {
        ProductName: product.name,
        ProductID: product.id,
        Price: parseFloat(product.price),
        Quantity: product.quantity,
      },
    ]);
  }
}

// Begin Checkout Event
export function trackBeginCheckout(cart: {
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
  }>;
  currencyCode?: string;
}) {
  if (typeof window !== 'undefined') {
    // GTM/GA4
    window.dataLayer?.push({
      event: 'begin_checkout',
      ecommerce: {
        value: cart.total,
        currency: cart.currencyCode || 'USD',
        items: cart.items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity,
        })),
      },
    });

    // Facebook Pixel
    window.fbq?.('track', 'InitiateCheckout', {
      content_ids: cart.items.map((item) => item.id),
      contents: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
      value: cart.total,
      currency: cart.currencyCode || 'USD',
    });

    // Klaviyo
    window._learnq?.push([
      'track',
      'Started Checkout',
      {
        $value: cart.total,
        ItemNames: cart.items.map((item) => item.name),
      },
    ]);
  }
}

// Custom Event Tracking
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...properties,
    });
  }
}
