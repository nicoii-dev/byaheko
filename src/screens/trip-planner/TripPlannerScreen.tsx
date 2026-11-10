import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAppSelector } from "../../redux/hooks";
import { useAppDispatch } from "../../redux/hooks";
import {
  swapOriginDestination,
} from "../../redux/slices/locationSlice";
import { planTrip } from "../../redux/slices/routesSlice";
import { useNavigation } from "@react-navigation/native";

const TripPlannerScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { currentLocation, selectedOrigin, selectedDestination } = useAppSelector(
    (state) => state.location
  );
  const { routeOptions, loading } = useAppSelector((state) => state.routes);

  const handlePlanTrip = async () => {
    const origin = selectedOrigin || currentLocation;
    const destination = selectedDestination;
    if (!origin || !destination) {
      return;
    }
    try {
      await dispatch(planTrip({ origin, destination }));
    } catch {
      console.error("Trip planning failed");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Plan Your Trip
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Find the best route for your journey
        </Text>

        <View style={styles.locationContainer}>
          <View style={[styles.locationInput, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.dot, { backgroundColor: "#2E7D52" }]} />
            <Text style={[styles.locationText, { color: theme.colors.onSurface }]}>
              {selectedOrigin?.name || currentLocation?.name || "Current Location"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.swapButton}
            onPress={() => dispatch(swapOriginDestination())}
          >
            <Text style={[styles.swapEmoji]}>🔄</Text>
          </TouchableOpacity>

          <View style={[styles.locationInput, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.dot, { backgroundColor: theme.colors.error }]} />
            <Text style={[styles.locationText, { color: theme.colors.onSurface }]}>
              {selectedDestination?.name || "Select destination"}
            </Text>
          </View>
        </View>

        <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.mapEmoji]}>🗺️</Text>
          <Text style={[styles.mapText, { color: theme.colors.onSurfaceVariant }]}>
            Map preview will appear here
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.planButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlanTrip}
          disabled={loading || !selectedDestination}
        >
          <Text style={[styles.planButtonText, { color: theme.colors.onPrimary }]}>
            {loading ? "Planning..." : "Find Routes"}
          </Text>
        </TouchableOpacity>

        {routeOptions.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: theme.colors.onBackground }]}>
              {routeOptions.length} Route Options
            </Text>
            {routeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.routeCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate("RouteDetails", { routeOption: option })}
              >
                <Text style={[styles.routeSummary, { color: theme.colors.onSurface }]}>
                  {option.summary}
                </Text>
                <View style={styles.routeDetails}>
                  <Text style={[styles.routeDetailText, { color: theme.colors.onSurfaceVariant }]}>
                    ⏱️ {option.estimatedTravelTime} min
                  </Text>
                  <Text style={[styles.routeDetailText, { color: theme.colors.onSurfaceVariant }]}>
                    ₱{option.estimatedFare}
                  </Text>
                  <Text style={[styles.routeDetailText, { color: theme.colors.onSurfaceVariant }]}>
                    🔄 {option.transfers} transfer{option.transfers !== 1 ? "s" : ""}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(6),
    paddingTop: hp(6),
    paddingBottom: hp(4),
    gap: hp(2),
  },
  title: {
    fontSize: wp(8),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  subtitle: {
    fontSize: wp(4),
    marginTop: hp(0.5),
    marginBottom: hp(3),
    fontFamily: "Nunito-Regular",
  },
  locationContainer: {
    gap: hp(1.5),
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(4),
    borderRadius: wp(3),
    gap: wp(3),
  },
  dot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
  },
  locationText: {
    fontSize: wp(4),
    flex: 1,
    fontFamily: "Nunito-Regular",
  },
  swapButton: {
    alignItems: "center",
    paddingVertical: hp(0.5),
  },
  swapEmoji: {
    fontSize: wp(5),
  },
  mapPlaceholder: {
    height: hp(25),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp(3),
    gap: hp(1.5),
  },
  mapEmoji: {
    fontSize: wp(12),
  },
  mapText: {
    fontSize: wp(4),
    fontFamily: "Nunito-Regular",
  },
  planButton: {
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: "center",
    minHeight: hp(6.5),
    justifyContent: "center",
  },
  planButtonText: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  resultsContainer: {
    marginTop: hp(2),
    gap: hp(1.5),
  },
  resultsTitle: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  routeCard: {
    padding: wp(4),
    borderRadius: wp(3),
  },
  routeSummary: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    marginBottom: hp(1),
    fontFamily: "Nunito-Bold",
  },
  routeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  routeDetailText: {
    fontSize: wp(3.5),
    fontFamily: "Nunito-Regular",
  },
});

export default TripPlannerScreen;