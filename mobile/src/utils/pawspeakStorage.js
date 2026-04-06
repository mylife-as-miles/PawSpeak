import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "pawspeak:favorites";

export async function listFavorites() {
  const rawValue = await AsyncStorage.getItem(FAVORITES_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function saveFavorite(item) {
  const favorites = await listFavorites();
  const nextFavorites = [
    item,
    ...favorites.filter((favorite) => favorite.id !== item.id),
  ];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
  return nextFavorites;
}

export async function removeFavorite(id) {
  const favorites = await listFavorites();
  const nextFavorites = favorites.filter((favorite) => favorite.id !== id);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
  return nextFavorites;
}
