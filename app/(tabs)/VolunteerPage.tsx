import React, { useEffect, useState } from "react";
import { API_URL } from 'react-native-dotenv';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { RootStackParamList } from "@/types/navigation";

interface ONG {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  distance?: string;
}

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type ONGDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ONGDetails"
>;

const VolunteerScreen: React.FC = () => {
  const navigation = useNavigation<ONGDetailsNavigationProp>();
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [ngos, setNgos] = useState<ONG[]>([]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } else {
      Alert.alert(
        "Permissão de localização negada",
        "Por favor, permita o acesso à sua localização."
      );
    }
  };

  useEffect(() => {
    if (!userLocation) {
      requestLocationPermission();
    }
    const fetchNgos = async () => {
      try {
        const response = await fetch(`${API_URL}/ngos`);
        const data: ONG[] = await response.json();

        if (userLocation) {
          const updatedNgos = data.map((ngo) => {
            const distance = haversineDistance(
              userLocation.latitude,
              userLocation.longitude,
              ngo.latitude,
              ngo.longitude
            );
            return { ...ngo, distance: distance.toFixed(2) };
          });

          updatedNgos.sort(
            (a, b) => parseFloat(a.distance!) - parseFloat(b.distance!)
          );
          setNgos(updatedNgos);
        }
      } catch (error) {
        console.error("fetchNgos", error);
        Alert.alert("Erro", "Não foi possível carregar as ONGs.");
      }
    };

    fetchNgos();
  }, [userLocation]);

  const renderItem = ({ item }: { item: ONG }) => (
    <TouchableOpacity
      style={styles.ongItem}
      onPress={() => navigation.navigate("ONGDetails", { id: item.id })}
    >
      <ThemedText style={styles.ongName}>{item.name}</ThemedText>
      <ThemedText style={styles.ongDistance}>{item.distance} km</ThemedText>
    </TouchableOpacity>
  );

  const initialRegion: Region = {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>ONGs Próximas</ThemedText>
      </View>
      <MapView style={styles.map} region={userLocation || initialRegion}>
        {userLocation && (
          <Marker coordinate={userLocation} title="Você está aqui" />
        )}
        {ngos.map((ngo) => (
          <Marker
            key={ngo.id}
            coordinate={{ latitude: ngo.latitude, longitude: ngo.longitude }}
            title={ngo.name}
          />
        ))}
      </MapView>
      <ThemedView style={styles.listContainer}>
        <FlatList
          data={ngos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: "#003366",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  map: {
    width: "100%",
    height: "50%",
    marginTop: 20,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 4,
  },
  ongItem: {
    backgroundColor: "#A8D5BA",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  ongName: {
    fontSize: 18,
    color: "#003366",
  },
  ongDistance: {
    fontSize: 14,
    color: "#666666",
  },
});

export default VolunteerScreen;
