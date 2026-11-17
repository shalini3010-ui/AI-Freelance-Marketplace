import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders the updated HandyFix logo brand', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const logoElements = screen.getAllByText(/HandyFix/i);
  expect(logoElements.length).toBeGreaterThan(0);
});