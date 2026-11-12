import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { APP_NAME, APP_TAGLINE } from '../../config/constants';
import { useAppTheme } from '../../config/theme';

interface AppLogoProps {
  size?: 'small' | 'large';
  showTagline?: boolean;
  inverted?: boolean;
}

export const AppLogo = ({
  size = 'large',
  showTagline = false,
  inverted = false,
}: AppLogoProps) => {
  const theme = useAppTheme();
  const isLarge = size === 'large';
  const markSize = isLarge ? 84 : 44;
  const textColor = inverted ? theme.colors.onPrimary : theme.colors.onBackground;
  const subTextColor = inverted
    ? theme.colors.onPrimary
    : theme.colors.onSurfaceVariant;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mark,
          {
            width: markSize,
            height: markSize,
            borderRadius: markSize / 2,
            backgroundColor: inverted
              ? theme.colors.onPrimary
              : theme.colors.primary,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="bus-side"
          size={markSize * 0.48}
          color={inverted ? theme.colors.primary : theme.colors.onPrimary}
        />
        <View
          style={[
            styles.routeDot,
            {
              backgroundColor: inverted
                ? theme.colors.primary
                : theme.colors.secondary,
            },
          ]}
        />
      </View>
      <Text
        variant={isLarge ? 'displaySmall' : 'titleLarge'}
        style={[styles.name, { color: textColor }]}
      >
        {APP_NAME}
      </Text>
      {showTagline ? (
        <Text
          variant="bodyMedium"
          style={[styles.tagline, { color: subTextColor }]}
        >
          {APP_TAGLINE}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  routeDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    right: 8,
    bottom: 8,
  },
  name: {
    letterSpacing: 0.4,
  },
  tagline: {
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default AppLogo;
