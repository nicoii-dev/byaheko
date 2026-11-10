import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAppSelector } from "../../redux/hooks";
import { useAppDispatch } from "../../redux/hooks";
import { loadTransportationData } from "../../redux/slices/transportationSlice";

const HomeScreen = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentLocation } = useAppSelector((state) => state.location);
  const { categories, nearbyBoardingPoints, loading } = useAppSelector(
    (state) => state.transportation
  );

  useEffect(() => {
    dispatch(loadTransportationData());
  }, [dispatch]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.onPrimary }]}>
            Hello, {user?.firstName || "Commuter"}!
          </Text>
          <Text style={[styles.location, { color: theme.colors.onPrimary + "CC" }]}>
            {currentLocation?.address || "Your current location"}
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: theme.colors.onPrimary + "33" }]}>
          <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
            {(user?.firstName || "U").charAt(0)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={[styles.searchPlaceholder, { color: theme.colors.onSurfaceVariant }]}>
            Where do you want to go?
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Transportation Categories
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {loading ? "Loading..." : `${categories.length} categories available`}
          </Text>
        </View>

        <View style={styles.grid}>
          {categories.slice(0, 4).map((category) => (
            <View
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={styles.categoryEmoji}>
                {category.category === "jeepney" ? "🛻" :
                 category.category === "bus" ? "🚌" :
                 category.category === "tricycle" ? "🏍️" :
                 category.category === "ferry" ? "⛵" :
                 category.category === "train" ? "🚆" : "🚗"}
              </Text>
              <Text style={[styles.categoryName, { color: theme.colors.onSurface }]}>
                {category.name}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Nearby Boarding Points
          </Text>
          {nearbyBoardingPoints.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No nearby boarding points found
            </Text>
          ) : (
            nearbyBoardingPoints.slice(0, 3).map((bp) => (
              <View
                key={bp.id}
                style={[styles.boardingCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={[styles.boardingIcon, { backgroundColor: theme.colors.primary + "20" }]}>
                  <Text style={[styles.boardingEmoji]}>📍</Text>
                </View>
                <View style={styles.boardingInfo}>
                  <Text style={[styles.boardingName, { color: theme.colors.onSurface }]}>
                    {bp.name}
                  </Text>
                  <Text style={[styles.boardingTypes, { color: theme.colors.onSurfaceVariant }]}>
                    {bp.transportationTypes.join(", ")}
                  </Text>
                </View>
              </View>
            ))
          )}
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
    paddingTop: hp(6),
    paddingBottom: hp(3),
    paddingHorizontal: wp(6),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
    marginBottom: hp(0.5),
  },
  location: {
    fontSize: wp(3.5),
    fontFamily: "Nunito-Regular",
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: wp(5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  content: {
    padding: wp(6),
    gap: hp(3),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    gap: wp(3),
  },
  searchIcon: {
    fontSize: wp(5),
  },
  searchPlaceholder: {
    fontSize: wp(4),
    flex: 1,
    fontFamily: "Nunito-Regular",
  },
  section: {
    gap: hp(1),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  sectionSubtitle: {
    fontSize: wp(3.5),
    fontFamily: "Nunito-Regular",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(3),
  },
  categoryCard: {
    flex: 1,
    minWidth: "42%",
    padding: wp(4),
    borderRadius: wp(3),
    alignItems: "center",
    gap: hp(1),
  },
  categoryEmoji: {
    fontSize: wp(8),
  },
  categoryName: {
    fontSize: wp(3.5),
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Nunito-SemiBold",
  },
  boardingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(4),
    borderRadius: wp(3),
    gap: wp(3),
    marginBottom: hp(1.5),
  },
  boardingIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  boardingEmoji: {
    fontSize: wp(5),
  },
  boardingInfo: {
    flex: 1,
  },
  boardingName: {
    fontSize: wp(4),
    fontWeight: "600",
    fontFamily: "Nunito-SemiBold",
    marginBottom: hp(0.3),
  },
  boardingTypes: {
    fontSize: wp(3.2),
    fontFamily: "Nunito-Regular",
  },
  emptyText: {
    fontSize: wp(3.8),
    fontFamily: "Nunito-Regular",
  },
});

export default HomeScreen;