import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '../../src/components/Common/ErrorBoundary.jsx';

function Problem() {
  throw new Error('boom');
}

test('shows fallback UI when child throws', () => {
  render(
    <ErrorBoundary>
      <Problem />
    </ErrorBoundary>
  );
  expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
});
