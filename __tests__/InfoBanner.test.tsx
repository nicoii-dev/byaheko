import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '../src/config/theme';
import InfoBanner from '../src/components/common/InfoBanner';

const renderWithTheme = (element: React.ReactElement) =>
  render(<PaperProvider theme={lightTheme}>{element}</PaperProvider>);

describe('InfoBanner', () => {
  it('shows a message and invokes its action', async () => {
    const onAction = jest.fn();
    const { getByText, getByRole } = await renderWithTheme(
      <InfoBanner
        message="Unable to refresh the directory."
        tone="error"
        actionLabel="Retry"
        onAction={onAction}
      />,
    );

    expect(getByText('Unable to refresh the directory.')).toBeTruthy();

    await fireEvent.press(getByRole('button'));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders without an action', async () => {
    const { queryByRole, getByText } = await renderWithTheme(
      <InfoBanner message="Demonstration data only." tone="info" />,
    );

    expect(getByText('Demonstration data only.')).toBeTruthy();
    expect(queryByRole('button')).toBeNull();
  });
});
