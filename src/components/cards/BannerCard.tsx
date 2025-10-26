import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";
import  ThemedText  from "../ui/ThemedText";

type Props = {
  image: any; // require() o { uri }
  title: string;
  subtitle?: string;
};

export default function BannerCard({ image, title, subtitle }: Props) {
  return (
    <ImageBackground
      source={image}
      style={styles.banner}
      imageStyle={styles.image}
    >
      <View style={styles.overlay}>
        {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 12,
    marginBottom: 16,
  },
  image: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    //backgroundColor: "rgba(0,0,0,0.35)", // capa oscura encima
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  title: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
  subtitle: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 5,
  },
});
