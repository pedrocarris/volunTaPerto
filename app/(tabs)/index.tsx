import { Image, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require("@/assets/images/hand-heart-outline.png")}
        style={styles.reactLogo}
      />
      <ThemedText style={styles.title}>Bem-vindo!</ThemedText>

      <Link href="/VolunteerPage" style={styles.button}>
        <ThemedText style={styles.buttonText}>Quero ser Voluntário</ThemedText>
      </Link>

      <Link href="/ONGPage" style={styles.button}>
        <ThemedText style={styles.buttonText}>Sou uma ONG</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  title: {
    fontSize: 24,
    color: "#003366",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#A8D5BA",
    padding: 15,
    borderRadius: 5,
    margin: 10,
    width: "80%",
    textAlign: "center",
  },
  buttonText: {
    color: "#003366",
    fontSize: 18,
  },
  reactLogo: {
    height: 100,
    width: 100,
    marginBottom: 20,
  },
});
