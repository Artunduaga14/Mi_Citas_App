// src/components/common/Collapsible.tsx
import React, { useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import ThemedText from "../ui/ThemedText";
import { IconSymbol } from "../ui/IconSymbol";
import ThemedView from "../ui/ThemedView";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function Collapsible({ title, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <ThemedView style={styles.container}>
      {/* Header que abre/cierra */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setOpen(!open)}
        testID="collapsible-header"
      >
        <IconSymbol
          name={open ? "chevron.down" : "chevron.right"}
          size={22}
          color="#444"
        />

        <ThemedText style={styles.title}>{title}</ThemedText>
      </TouchableOpacity>

      {/* SOLO se renderiza cuando está abierto */}
      {open && (
        <View style={styles.content} testID="collapsible-content">
          {children}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    marginTop: 8,
    paddingLeft: 30,
  },
});
