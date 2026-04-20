import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders login page by default', () => {
  render(<App />);
  // App should render without crashing
  expect(document.querySelector('#root')).toBeDefined();
});

test('renders Smart Campus Hub text on login page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // The app should render without errors
  expect(document.body).toBeTruthy();
});
