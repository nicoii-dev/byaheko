import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAppSelector } from "../redux/hooks";
import { useAppDispatch } from "../redux/hooks";
import { logout } from "../redux/slices/authSlice";
import { setThemeMode } from "../redux/slices/themeSlice";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user, themeMode } = useAppSelector((state) => ({
    user: state.auth.user,
    themeMode: state.theme.mode,
  }));

  const handleLogout = async () => {
    await dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleToggleTheme = () => {
    dispatch(setThemeMode(themeMode === "light" ? "dark" : "light"));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.primary }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.onPrimary + "33" }]}>
            <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
              {(user?.firstName || "U").charAt(0)}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.onPrimary }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: theme.colors.onPrimary + "CC" }]}>
            {user?.email || "No email"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Account
          </Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
              Edit Profile
            </Text>
            <Text style={[styles.menuItemArrow, { color: theme.colors.onSurfaceVariant }]}>
              →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
              Saved Places
            </Text>
            <Text style={[styles.menuItemArrow, { color: theme.colors.onSurfaceVariant }]}>
              →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
              Favorite Routes
            </Text>
            <Text style={[styles.menuItemArrow, { color: theme.colors.onSurfaceVariant }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Preferences
          </Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={handleToggleTheme}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
              Dark Mode
            </Text>
            <Text style={[styles.menuItemValue, { color: theme.colors.onSurfaceVariant }]}>
              {themeMode === "dark" ? "On" : "Off"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
              Notification Preferences
            </Text>
            <Text style={[styles.menuItemArrow, { color: theme.colors.onSurfaceVariant }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            About
          </Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
              Privacy Policy
            </Text>
            <Text style={[styles.menuItemArrow, { color: theme.colors.onSurfaceVariant }]}>
              →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
              Terms and Conditions
            </Text>
            <Text style={[styles.menuItemArrow, { color: theme.colors.onSurfaceVariant }]}>
              →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
              About ByaheKo
            </Text>
            <Text style={[styles.menuItemArrow, { color: theme.colors.onSurfaceVariant }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error + "15" }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            Logout
          </Text>
        </TouchableOpacity>
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
    paddingBottom: hp(6),
  },
  profileHeader: {
    padding: hp(4),
    borderRadius: wp(3),
    alignItems: "center",
    marginBottom: hp(3),
  },
  avatar: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  avatarText: {
    fontSize: wp(10),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  name: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  email: {
    fontSize: wp(4),
    marginTop: hp(0.5),
    fontFamily: "Nunito-Regular",
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    marginBottom: hp(1.5),
    textTransform: "uppercase",
    fontFamily: "Nunito-Bold",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(1),
  },
  menuItemText: {
    fontSize: wp(4.5),
    flex: 1,
    fontFamily: "Nunito-Regular",
  },
  menuItemArrow: {
    fontSize: wp(5),
    fontWeight: "bold",
  },
  menuItemValue: {
    fontSize: wp(4),
    fontFamily: "Nunito-Regular",
  },
  logoutButton: {
    padding: hp(2),
    borderRadius: wp(3),
    alignItems: "center",
    marginTop: hp(2),
  },
  logoutText: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
});

export default ProfileScreen;