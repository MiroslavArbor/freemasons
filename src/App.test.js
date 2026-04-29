import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders guild home', () => {
  render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );
  expect(
    screen.getByRole('heading', {
      level: 1,
      name: /welcome to freemason/i,
    })
  ).toBeInTheDocument();
});
