import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);

      // Ensure safe values
      const price = Number(newItem.price ?? newItem.discountedPrice) || 0;
      const image = newItem.image 
        || (Array.isArray(newItem.imageUrls) && newItem.imageUrls.length > 0 
            ? newItem.imageUrls[0] 
            : "/placeholder.png");

      if (existingItem) {
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        state.items.push({
          id: newItem.id,
          name: newItem.name || "Unnamed Product",
          price,
          basePrice: Number(newItem.basePrice) || price,
          image,
          content: newItem.content || '',
          description: newItem.description || '',
          discountPercentage: newItem.discountPercentage || 0,
          quantity: 1,
          totalPrice: price,
        });
      }

      // Recalculate totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
    },

    removeItemFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);

      if (existingItem) {
        if (existingItem.quantity === 1) {
          state.items = state.items.filter(item => item.id !== id);
        } else {
          existingItem.quantity--;
          existingItem.totalPrice = existingItem.price * existingItem.quantity;
        }
      }

      // Recalculate totals
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
    },

    removeCompleteItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);

      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
    },

    updateItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === id);

      if (existingItem && quantity > 0) {
        existingItem.quantity = quantity;
        existingItem.totalPrice = existingItem.price * quantity;
      }

      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    }
  },
});

export const { 
  addItemToCart, 
  removeItemFromCart, 
  updateItemQuantity, 
  removeCompleteItem, 
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;
