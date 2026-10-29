import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [
    {
      id: 'mug',
      name: 'Stoneware mug',
      description: 'A slow-morning favorite, finished by hand.',
      price: 18,
      icon: '☕',
      color: '#e9ded0',
    },
    {
      id: 'notebook',
      name: 'Linen notebook',
      description: 'Room for plans, lists, and loose thoughts.',
      price: 14,
      icon: '▤',
      color: '#e4e9dc',
    },
    {
      id: 'candle',
      name: 'Cedar candle',
      description: 'Warm wood and a little quiet at the end of the day.',
      price: 26,
      icon: '♨',
      color: '#e8dfdc',
    },
    {
      id: 'tote',
      name: 'Everyday tote',
      description: 'A sturdy carry-all for the daily essentials.',
      price: 22,
      icon: '▱',
      color: '#e5e2ef',
    },
  ],
  cart: [],
};

const shoppingCartSlice = createSlice({
  name: 'shoppingCart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const cartItem = state.cart.find(
        (item) => item.productId === action.payload,
      );

      if (cartItem) {
        cartItem.quantity += 1;
      } else if (state.products.some((product) => product.id === action.payload)) {
        state.cart.push({ productId: action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action) {
      state.cart = state.cart.filter(
        (item) => item.productId !== action.payload,
      );
    },
    decrementCartItem(state, action) {
      const cartItem = state.cart.find(
        (item) => item.productId === action.payload,
      );

      if (cartItem) {
        if (cartItem.quantity > 1) {
          cartItem.quantity -= 1;
        } else {
          state.cart = state.cart.filter(
            (item) => item.productId !== action.payload,
          );
        }
      }
    },
  },
});

export const { addToCart, removeFromCart, decrementCartItem } =
  shoppingCartSlice.actions;

export default shoppingCartSlice.reducer;
