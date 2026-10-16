import { createSelector } from '@reduxjs/toolkit';

export const selectProducts = (state) => state.shoppingCart.products;
export const selectCartContents = (state) => state.shoppingCart.cart;

export const selectCartItems = createSelector(
  [selectProducts, selectCartContents],
  (products, cart) =>
    cart.map((item) => ({
      ...products.find((product) => product.id === item.productId),
      quantity: item.quantity,
    })),
);

export const calculateTotalPrice = createSelector(
  [selectCartItems],
  (cartItems) =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
);
