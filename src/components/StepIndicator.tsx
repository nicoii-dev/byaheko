import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ totalSteps, currentStep }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <View key={stepNumber} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: isCompleted || isCurrent
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
                  borderColor: isCurrent ? theme.colors.primary : "transparent",
                  borderWidth: isCurrent ? 2 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.stepText,
                  {
                    color: isCompleted || isCurrent
                      ? theme.colors.onPrimary
                      : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {isCompleted ? "✓" : stepNumber}
              </Text>
            </View>
            {stepNumber < totalSteps && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: isCompleted ? theme.colors.primary : theme.colors.surfaceVariant },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: wp(4),
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: {
    fontSize: wp(3.5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  stepLine: {
    width: wp(6),
    height: 2,
    marginHorizontal: wp(1),
  },
});

export default StepIndicator;