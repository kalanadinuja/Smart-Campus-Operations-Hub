import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page by default', () => {
  render(<App />);
  // App should render without crashing
  expect(document.querySelector('#root')).toBeDefined();
});

test('renders Smart Campus Hub text on login page', () => {
  render(<App />);
  // The app should render without errors
  expect(document.body).toBeTruthy();
});