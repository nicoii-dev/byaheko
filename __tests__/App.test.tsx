/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders the root app without crashing', async () => {
  jest.useFakeTimers();
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  // Let the splash screen finish its bootstrap delay.
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1000);
  });

  expect(renderer!.toJSON()).toBeTruthy();

  await ReactTestRenderer.act(async () => {
    renderer!.unmount();
  });

  jest.useRealTimers();
});
