import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { RootStackParamList } from "@/types/navigation";

type ONGDetailsNavigationProp = RouteProp<RootStackParamList, "ONGDetails">;

const ONGDetailsScreen: React.FC = () => {
  const route = useRoute<ONGDetailsNavigationProp>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [ngo, setNgo] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    const fetchNgoDetails = async () => {
      try {
        const response = await fetch(`http://192.168.1.115:3000/ngos/${id}`);
        const data = await response.json();
        console.log("data", data);
        setNgo(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível carregar os detalhes da ONG.");
      }
    };

    fetchNgoDetails();
  }, [id]);

  const renderDetailItem = ({
    item,
  }: {
    item: { title: string; value: string };
  }) => (
    <View style={styles.detailItem}>
      <ThemedText style={styles.detailTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.detailValue}>{item.value}</ThemedText>
    </View>
  );

  if (!ngo) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  const details = [
    { title: "Nome", value: ngo.name },
    { title: "Endereço", value: ngo.address },
    { title: "Objetivo", value: ngo.objective },
    { title: "Necessidades", value: ngo.needs },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>{ngo.name}</ThemedText>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: ngo.latitude,
            longitude: ngo.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{ latitude: ngo.latitude, longitude: ngo.longitude }}
            title={ngo.name}
          />
        </MapView>
      </View>
      <View style={styles.content}>
        <FlatList
          data={details}
          renderItem={renderDetailItem}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContainer}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: "#003366",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  mapContainer: {
    height: 300,
    borderRadius: 5,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  listContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  detailItem: {
    backgroundColor: "#A8D5BA",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 18,
    color: "#003366",
  },
  detailValue: {
    fontSize: 16,
    color: "#333333",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#003366",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: "#003366",
  },
});

export default ONGDetailsScreen;
