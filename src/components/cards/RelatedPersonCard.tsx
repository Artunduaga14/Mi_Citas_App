// src/components/cards/RelatedPersonCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export interface RelatedPersonList {
  id: number;
  personId: number;
  fullName: string;
  relation: string;
  documentTypeName: string | null;
  document: string;
  active?: boolean;
  color?: string; // opcional
}

type Props = {
  item: RelatedPersonList;
  onPressDetails?: (item: RelatedPersonList) => void;
  subtitleText?: string;
  /** TestID opcional para pruebas, por defecto: "related-person-card" */
  testID?: string;
};

export default function RelatedPersonCard({
  item,
  onPressDetails,
  subtitleText,
  testID,
}: Props) {
  // Subtítulo: prioridad -> prop, relation, estado activo/inactivo
  const subtitle =
    subtitleText ??
    (item.relation
      ? capitalizeFirst(item.relation)
      : item.active === false
      ? "Inactivo"
      : "Relacionado");

  // “Píldoras” informativas (imitando hora/fecha del otro card)
  const pillLeftText = item.documentTypeName
    ? `${item.documentTypeName}`
    : "Documento";
  const pillRightText = item.document || "N/D";

  return (
    <View
      testID={testID ?? "related-person-card"}
      style={[
        styles.card,
        item.color ? { borderBottomColor: item.color } : null,
      ]}
    >
      {/* Cabecera */}
      <View style={styles.headerRow}>
        <View style={styles.leftIconBubble}>
          <MaterialCommunityIcons
            name="account-outline"
            size={28}
            color="#4B7FD6"
          />
        </View>

        {/* Título: nombre completo */}
        <Text style={styles.title} numberOfLines={1}>
          {item.fullName || "Persona relacionada"}
        </Text>

        <MaterialCommunityIcons
          name="account-check-outline"
          size={28}
          color="#3D7BFF"
          style={styles.headerRightIcon}
        />
      </View>

      {/* Subtítulo */}
      {!!subtitle && (
        <View style={styles.subtitleRow}>
          <View style={styles.dot} />
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      )}

      {/* Fila con “píldoras” y botón */}
      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Ionicons name="id-card-outline" size={18} color="#000" />
          <Text style={styles.infoText}>{pillLeftText}</Text>
        </View>

        <View style={styles.infoPill}>
          <Ionicons name="document-text-outline" size={18} color="#000" />
          <Text style={styles.infoText}>{pillRightText}</Text>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          testID="related-person-detail-button"
          activeOpacity={0.85}
          style={styles.detailBtn}
          onPress={() => onPressDetails?.(item)}
        >
          <Text style={styles.detailBtnText}>Ver detalle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function capitalizeFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
    borderBottomWidth: 4,
    borderBottomColor: "#FFA62B",
  },

  leftIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  headerRightIcon: {
    marginLeft: 8,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#FFA62B",
    marginRight: 8,
  },
  subtitle: {
    color: "#FFA62B",
    fontSize: 16,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#F2F4F7",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 5,
    flexShrink: 1,
    gap: 6,
  },
  infoText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  detailBtn: {
    backgroundColor: "#6B8CFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexShrink: 0,
  },
  detailBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

