'use client';

import React, { createContext, use, useState, useCallback, useEffect } from 'react';
import { type Product } from '@/lib/products';
import {
  createCart,
  addToCart as shopifyAddToCart,
  updateCartLines,
  getCart,
  type ShopifyCart,
} from '@/lib/shopify';

interface CartItem extends Product {
  quantity: number;
  size: number;
  lineId?: string; // Shopify cart line ID
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: number, variantId?: string) => Promise<void>;
  updateQuantity: (id: string, size: number, change: number, lineId?: string) => Promise<void>;
  total: number;
  checkoutUrl: string | null;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = 'shopify-cart-id';

// Helper to get Shopify cart ID from localStorage
function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CART_ID_KEY);
}

// Helper to store Shopify cart ID
function storeCartId(cartId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_ID_KEY, cartId);
}

// Helper to clear cart ID
function clearCartId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_ID_KEY);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
      // Optionally fetch cart to sync state
      getCart(storedCartId).then((cart) => {
        if (cart) {
          syncCartState(cart);
        } else {
          // Cart might be expired, clear it
          clearCartId();
          setCartId(null);
        }
      });
    }
  }, []);

  // Sync local state with Shopify cart
  const syncCartState = useCallback((cart: ShopifyCart) => {
    setCheckoutUrl(cart.checkoutUrl);

    const cartItems: CartItem[] = cart.lines.edges.map((edge) => {
      const { node } = edge;
      const product = node.merchandise.product;

      return {
        id: product.handle,
        name: product.title,
        image: product.images.edges[0]?.node.url || '',
        handle: product.handle,
        price: node.merchandise.price.amount,
        currencyCode: node.merchandise.price.currencyCode,
        variantId: node.merchandise.id,
        quantity: node.quantity,
        size: 0, // We'll need to map variant title to size
        lineId: node.id,
      };
    });

    setItems(cartItems);
  }, []);

  const addToCart = useCallback(
    async (product: Product, size: number, variantId?: string) => {
      // Optimistic update
      setItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.id === product.id && item.size === size,
        );
        if (existingItemIndex > -1) {
          return prevItems.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        } else {
          return [...prevItems, { ...product, quantity: 1, size }];
        }
      });

      setIsLoading(true);

      try {
        const merchandiseId = variantId || product.variantId;

        if (!merchandiseId) {
          console.error('No variant ID available for product:', product);
          return;
        }

        let cart: ShopifyCart | null;

        if (cartId) {
          // Add to existing cart
          cart = await shopifyAddToCart(cartId, [
            { merchandiseId, quantity: 1 },
          ]);
        } else {
          // Create new cart
          cart = await createCart([{ merchandiseId, quantity: 1 }]);

          if (cart) {
            setCartId(cart.id);
            storeCartId(cart.id);
          }
        }

        if (cart) {
          syncCartState(cart);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        // Revert optimistic update on error
        setItems((prevItems) =>
          prevItems.filter((item) => !(item.id === product.id && item.size === size)),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, syncCartState],
  );

  const updateQuantity = useCallback(
    async (id: string, size: number, change: number, lineId?: string) => {
      // Optimistic update
      const previousItems = items;
      setItems((prevItems) =>
        prevItems.reduce((acc, item) => {
          if (item.id === id && item.size === size) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0
              ? [...acc, { ...item, quantity: newQuantity }]
              : acc;
          }
          return [...acc, item];
        }, [] as CartItem[]),
      );

      setIsLoading(true);

      try {
        if (!cartId || !lineId) {
          console.error('Missing cartId or lineId for update');
          return;
        }

        const itemToUpdate = items.find((item) => item.id === id && item.size === size);
        if (!itemToUpdate) return;

        const newQuantity = itemToUpdate.quantity + change;

        if (newQuantity > 0) {
          const cart = await updateCartLines(cartId, [
            { id: lineId, quantity: newQuantity },
          ]);

          if (cart) {
            syncCartState(cart);
          }
        } else {
          // Remove item by setting quantity to 0 is not supported
          // You'd need a cartLinesRemove mutation
          const cart = await updateCartLines(cartId, [
            { id: lineId, quantity: 0 },
          ]);

          if (cart) {
            syncCartState(cart);
          }
        }
      } catch (error) {
        console.error('Error updating cart:', error);
        // Revert optimistic update
        setItems(previousItems);
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, items, syncCartState],
  );

  const total = items.reduce((acc, item) => {
    const price = parseFloat(item.price || '20');
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, total, checkoutUrl, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = use(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
