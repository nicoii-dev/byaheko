import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const ExploreScreen = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
          Explore
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onPrimary + "CC" }]}>
          Discover transportation options
        </Text>
      </View>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Transportation Directory
          </Text>
          <Text style={[styles.cardDesc, { color: theme.colors.onSurfaceVariant }]}>
            Browse all available transportation categories and boarding points.
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Map View
          </Text>
          <Text style={[styles.cardDesc, { color: theme.colors.onSurfaceVariant }]}>
            See nearby boarding points and terminals on the map.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: wp(6),
    paddingTop: hp(6),
    paddingBottom: hp(3),
  },
  title: {
    fontSize: wp(8),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  subtitle: {
    fontSize: wp(4),
    marginTop: hp(0.5),
    fontFamily: "Nunito-Regular",
  },
  content: {
    padding: wp(6),
    gap: hp(2),
  },
  card: {
    padding: wp(5),
    borderRadius: wp(3),
  },
  cardTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    marginBottom: hp(1),
    fontFamily: "Nunito-Bold",
  },
  cardDesc: {
    fontSize: wp(4),
    lineHeight: wp(5.5),
    fontFamily: "Nunito-Regular",
  },
});

export default ExploreScreen;