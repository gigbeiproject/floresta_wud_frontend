// Com/ReduxProvider.js
"use client";
import { Provider } from 'react-redux';
import store from '../app/store/store'; // Adjust path to your store location

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}