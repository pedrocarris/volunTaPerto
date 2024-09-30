import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, TextInput, Button, Alert } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { API_URL, MAPS_KEY } from "react-native-dotenv";

const NGOFormScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [objective, setObjective] = useState("");
  const [needs, setNeeds] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
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

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            1000
          );
        }
      } else {
        Alert.alert(
          "Permissão de localização negada",
          "Por favor, permita o acesso à sua localização."
        );
      }
    };

    requestLocationPermission();
  }, []);

  const handleMarkerPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setLatitude(latitude);
    setLongitude(longitude);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        1000
      );
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPS_KEY}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        Alert.alert("Error", "Não foi possível encontrar o endereço.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Erro ao obter o endereço.");
    }
  };
  const handleSubmit = async () => {
    const ngoData = {
      name,
      address,
      objective,
      needs,
      latitude: parseFloat(latitude.toString()),
      longitude: parseFloat(longitude.toString()),
    };

    try {
      const response = await fetch(`${API_URL}/ngos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ngoData),
      });

      if (response.ok) {
        Alert.alert("Success", "ONG cadastrada com sucesso!");
        setName("");
        setAddress("");
        setObjective("");
        setNeeds("");
        setLatitude(0);
        setLongitude(0);
        setMarker(null);
      } else {
        Alert.alert("Error", "Erro ao cadastrar a ONG. Tente novamente.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Erro ao conectar ao servidor. Tente novamente. ${error}`
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Cadastrar ONG</ThemedText>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={
          userLocation || {
            latitude: -23.5505,
            longitude: -46.6333,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }
        }
        onPress={handleMarkerPress}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="Você está aqui" />
        )}
        {marker && <Marker coordinate={marker} title="Localização da ONG" />}
      </MapView>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome da ONG"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Endereço da ONG"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Objetivo da ONG"
          value={objective}
          onChangeText={setObjective}
        />
        <TextInput
          style={styles.input}
          placeholder="O que precisa?"
          value={needs}
          onChangeText={setNeeds}
        />

        <Button title="Cadastrar ONG" onPress={handleSubmit} color="#003366" />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: "#003366",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  map: {
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  input: {
    height: 40,
    borderColor: "#A8D5BA",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
});

export default NGOFormScreen;
