import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  initialDate?: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

export const DateNavigator = ({ initialDate, onDateChange }: Props) => {
  const [currentDate, setCurrentDate] = useState<Date>(
    initialDate ? new Date(initialDate) : new Date()
  );

  useEffect(() => {
    onDateChange(format(currentDate, "yyyy-MM-dd"));
  }, [currentDate]);

  const move = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.arrow} onPress={() => move(-1)}>
        <MaterialIcons name="chevron-left" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.month}>
          {format(currentDate, "MMM yyyy", { locale: es }).toUpperCase()}
        </Text>

        <Text style={styles.dayName}>
          {format(currentDate, "EEE dd", { locale: es })}
        </Text>
      </View>

      <TouchableOpacity style={styles.arrow} onPress={() => move(1)}>
        <MaterialIcons name="chevron-right" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3
  },
  arrow: {
    padding: 5
  },
  center: {
    alignItems: "center"
  },
  month: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333"
  },
  dayName: {
    fontSize: 14,
    color: "#666",
    marginTop: 3
  }
});
