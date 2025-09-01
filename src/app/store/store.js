import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("cartState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state", err);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("cartState", serializedState);
  } catch (err) {
    console.error("Could not save state", err);
  }
};

const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState: loadState(), // Restore previous state
});

// Subscribe to store changes to persist them
store.subscribe(() => {
  saveState({
    cart: store.getState().cart,
  });
});

export default store;
