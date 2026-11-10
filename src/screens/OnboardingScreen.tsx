import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../services/storage";
import { STORAGE_KEYS } from "../config/constants";
import ByaheKoLogo from "../components/ByaheKoLogo";
import AppButton from "../components/shared/AppButton";

const { width: screenWidth } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "Find Public Transportation Near You",
    description: "Discover jeepneys, buses, tricycles, and other public transport options around your location.",
    icon: "location-on",
    color: "#163D32",
  },
  {
    id: 2,
    title: "Discover Routes to Your Destination",
    description: "Get step-by-step route recommendations with boarding points, drop-offs, and transfer instructions.",
    icon: "route",
    color: "#B8E65A",
  },
  {
    id: 3,
    title: "Estimate Fares and Travel Time",
    description: "Know the approximate cost and duration of your trip before you even leave your home.",
    icon: "schedule",
    color: "#F5B942",
  },
];

const OnboardingScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = onboardingData[currentIndex];
  const isLast = currentIndex === onboardingData.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleGetStarted();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    setCurrentIndex(onboardingData.length - 1);
  };

  const handleGetStarted = async () => {
    await storage.setItem(STORAGE_KEYS.ONBOARDING_SEEN, "true");
    navigation.navigate("Login");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <ByaheKoLogo />
        {!isLast && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: theme.colors.onSurfaceVariant }]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: current.color + "20" }]}>
          <Text style={[styles.emoji, { color: current.color }]}>
            {current.icon === "location-on" ? "📍" :
             current.icon === "route" ? "🗺️" :
             current.icon === "schedule" ? "⏱️" : "📍"}
          </Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {current.title}
        </Text>
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {current.description}
        </Text>

        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    index === currentIndex
                      ? theme.colors.primary
                      : theme.colors.surfaceVariant,
                  width: index === currentIndex ? wp(6) : wp(3),
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          title={isLast ? "Get Started" : "Next"}
          onPress={handleNext}
          mode="contained"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(6),
    paddingTop: hp(6),
  },
  skipButton: {
    padding: hp(1.5),
  },
  skipText: {
    fontSize: wp(4),
    fontWeight: "600",
    fontFamily: "Nunito-SemiBold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(10),
  },
  iconContainer: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(4),
  },
  emoji: {
    fontSize: wp(18),
    fontWeight: "bold",
  },
  title: {
    fontSize: wp(7),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp(2),
    fontFamily: "Nunito-Bold",
  },
  description: {
    fontSize: wp(4),
    textAlign: "center",
    lineHeight: wp(5.5),
    marginBottom: hp(5),
    fontFamily: "Nunito-Regular",
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
  },
  indicator: {
    height: hp(0.8),
    borderRadius: wp(1),
  },
  footer: {
    padding: wp(6),
    paddingBottom: hp(4),
  },
});

export default OnboardingScreen;