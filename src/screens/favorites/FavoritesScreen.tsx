import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAppSelector } from "../redux/hooks";
import { useAppDispatch } from "../redux/hooks";
import { loadFavorites, removeFavorite } from "../redux/slices/favoritesSlice";
import { useNavigation } from "@react-navigation/native";

const FavoritesScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  const handleRemove = (id: string) => {
    dispatch(removeFavorite(id));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
          Favorites
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onPrimary + "CC" }]}>
          Your saved places and routes
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyEmoji]}>☆</Text>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No favorites yet
            </Text>
            <Text style={[styles.emptyHint, { color: theme.colors.onSurfaceVariant }]}>
              Save destinations, routes, and boarding points for quick access.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  {item.name}
                </Text>
                <TouchableOpacity onPress={() => handleRemove(item.id)}>
                  <Text style={[styles.removeText, { color: theme.colors.error }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.cardType, { color: theme.colors.onSurfaceVariant }]}>
                {item.type.replace("_", " ")}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(10),
    gap: hp(1),
  },
  emptyEmoji: {
    fontSize: wp(16),
    marginBottom: hp(2),
  },
  emptyText: {
    fontSize: wp(5),
    fontWeight: "bold",
    fontFamily: "Nunito-Bold",
  },
  emptyHint: {
    fontSize: wp(4),
    textAlign: "center",
    fontFamily: "Nunito-Regular",
  },
  card: {
    padding: wp(4),
    borderRadius: wp(3),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  cardTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    flex: 1,
    fontFamily: "Nunito-Bold",
  },
  removeText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    fontFamily: "Nunito-SemiBold",
  },
  cardType: {
    fontSize: wp(3.5),
    textTransform: "capitalize",
    fontFamily: "Nunito-Regular",
  },
});

export default FavoritesScreen;