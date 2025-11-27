import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { addDays, format, startOfWeek, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  initialDate?: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

export const WeekDatePicker = ({ initialDate, onDateChange }: Props) => {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState<Date>(
    initialDate ? new Date(initialDate) : today
  );

  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    generateWeek(currentDate);
    onDateChange(format(currentDate, "yyyy-MM-dd"));
  }, [currentDate]);

  const generateWeek = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDays(days);
  };

  // 🚫 NO permitir retroceder hacia semanas anteriores
  const moveWeek = (direction: number) => {
    if (direction === -1) {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const todayStart = startOfWeek(today, { weekStartsOn: 1 });

      if (start <= todayStart) return; // Bloquear retroceso
    }

    const newDate = addWeeks(currentDate, direction);
    setCurrentDate(newDate);
    generateWeek(newDate);
  };

  // 🚫 NO permitir seleccionar días pasados
  const selectDay = (day: Date) => {
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayMid = new Date(day.getFullYear(), day.getMonth(), day.getDate());

    if (dayMid < todayMid) return; // bloquear
    setCurrentDate(day);
  };

  const isSelected = (day: Date) =>
    format(day, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");

  return (
    <View style={styles.container}>
      {/* Header con flechas */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => moveWeek(-1)}
          style={styles.arrowBtn}
        >
          <MaterialIcons name="chevron-left" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {format(currentDate, "MMM yyyy", { locale: es })}
        </Text>

        <TouchableOpacity
          onPress={() => moveWeek(1)}
          style={styles.arrowBtn}
        >
          <MaterialIcons name="chevron-right" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysRow}
      >
        {weekDays
          // 🚫 filtrar días pasados cuando estamos en la semana actual
          .filter(day => {
            const todayStart = startOfWeek(today, { weekStartsOn: 1 });
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

            if (weekStart.getTime() === todayStart.getTime()) {
              return day >= today;
            }
            return true;
          })
          .map((day, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.dayCard, isSelected(day) && styles.dayCardSelected]}
              onPress={() => selectDay(day)}
            >
              <Text style={[styles.dayName, isSelected(day) && styles.dayNameSelected]}>
                {format(day, "EEE", { locale: es }).slice(0, 3)}
              </Text>
              <Text style={[styles.dayNumber, isSelected(day) && styles.dayNumberSelected]}>
                {format(day, "dd")}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  arrowBtn: {
    padding: 5,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  daysRow: {
    paddingHorizontal: 10,
  },
  dayCard: {
    width: 60,
    height: 70,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#F3F6FA",
    justifyContent: "center",
    alignItems: "center",
  },
  dayCardSelected: {
    backgroundColor: "#4FA8DE",
  },
  dayName: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  dayNameSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  dayNumberSelected: {
    color: "#fff",
  },
});
