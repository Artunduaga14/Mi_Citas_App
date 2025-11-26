// src/components/StarRating.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
};

export const StarRating = ({ value, onChange, size = 28 }: Props) => {
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={0.7}
          onPress={() => onChange?.(i)}
        >
          <Ionicons
            name={i <= value ? "star" : "star-outline"}
            size={size}
            color={i <= value ? "#fbbf24" : "#999"}
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};
