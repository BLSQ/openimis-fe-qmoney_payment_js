import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import { setupStore } from '../app/store'

const setupStore = preloadedState => {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  });
};

const initialState = {};

const rootReducer = combineReducers({
  policy: (state = initialState, _action) => {
    return state;
  }
});

export function renderWithProviders(ui, extendedRenderOptions = {}) {
  const {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  } = extendedRenderOptions;

  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
}
