/**
 * Native asset linking for the React Native CLI.
 *
 * Run `npx react-native-asset` after changing this file. It copies the Nunito
 * font and the MaterialCommunityIcons font into the native projects and keeps
 * their platform manifests in sync.
 */
module.exports = {
  assets: [
    './src/assets/fonts',
    './node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf',
  ],
};
