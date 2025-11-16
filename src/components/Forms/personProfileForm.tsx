// src/components/Forms/personProfileForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DocumentTypeDto, EpsDto } from "../../services/hospital/personServices";

export interface PersonUpdate {
  id: number;
  fullName: string;
  fullLastName: string;
  documentTypeId: number;
  document: string;
  dateBorn: string;
  phoneNumber: string;
  epsId: number;
  gender: string;
  healthRegime: string;
}

type Props = {
  initial: PersonUpdate;
  docTypes: DocumentTypeDto[];
  epsList: EpsDto[];
  onSubmit: (data: PersonUpdate) => void;
  onCancel: () => void;
  saving?: boolean;
};

const genders = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
];

const regimes = [
  { value: "contributivo", label: "Contributivo" },
  { value: "subsidiado", label: "Subsidiado" },
  { value: "especial", label: "Especial" },
  { value: "otros", label: "Otros" },
];

export default function PerfilForm({
  initial,
  docTypes,
  epsList,
  onSubmit,
  onCancel,
  saving,
}: Props) {
  const [form, setForm] = useState<PersonUpdate>({ ...initial });

  const set = <K extends keyof PersonUpdate>(key: K, value: PersonUpdate[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.sheet}
    >
      <View style={styles.card}>
        {/* Mango superior */}
        <View style={styles.handle} />

        <Text style={styles.title}>Editar información</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Nombre */}
          <Text style={styles.label}>Nombres</Text>
          <TextInput
            style={styles.input}
            value={form.fullName}
            onChangeText={(t) => set("fullName", t)}
            placeholder="Nombres"
          />

          {/* Apellidos */}
          <Text style={styles.label}>Apellidos</Text>
          <TextInput
            style={styles.input}
            value={form.fullLastName}
            onChangeText={(t) => set("fullLastName", t)}
            placeholder="Apellidos"
          />

          {/* Tipo de documento */}
          <Text style={styles.label}>Tipo de documento</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={form.documentTypeId || 0}
              onValueChange={(v) => set("documentTypeId", Number(v))}
            >
              {form.documentTypeId === 0 && (
                <Picker.Item label="Seleccione..." value={0} />
              )}
              {docTypes.map((dt) => (
                <Picker.Item
                  key={dt.id}
                  label={dt.acronym ? `${dt.acronym} - ${dt.name}` : dt.name}
                  value={dt.id}
                />
              ))}
            </Picker>
          </View>

          {/* Documento */}
          <Text style={styles.label}>Documento</Text>
          <TextInput
            style={styles.input}
            value={String(form.document)}
            onChangeText={(t) => set("document", t)}
            placeholder="Número de documento"
            keyboardType="numeric"
          />

          {/* Fecha de nacimiento */}
          <Text style={styles.label}>Fecha de nacimiento (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={form.dateBorn}
            onChangeText={(t) => set("dateBorn", t)}
            placeholder="1990-01-30"
          />

          {/* Teléfono */}
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={form.phoneNumber}
            onChangeText={(t) => set("phoneNumber", t)}
            placeholder="Celular"
            keyboardType="phone-pad"
          />

          {/* EPS */}
          <Text style={styles.label}>EPS</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={form.epsId || 0}
              onValueChange={(v) => set("epsId", Number(v))}
            >
              {form.epsId === 0 && (
                <Picker.Item label="Seleccione..." value={0} />
              )}
              {epsList.map((e) => (
                <Picker.Item key={e.id} label={e.name} value={e.id} />
              ))}
            </Picker>
          </View>

          {/* Género */}
          <Text style={styles.label}>Género</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={form.gender}
              onValueChange={(v) => set("gender", String(v))}
            >
              {genders.map((g) => (
                <Picker.Item key={g.value} label={g.label} value={g.value} />
              ))}
            </Picker>
          </View>

          {/* Régimen de salud */}
          <Text style={styles.label}>Régimen de salud</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={form.healthRegime}
              onValueChange={(v) => set("healthRegime", String(v))}
            >
              {regimes.map((r) => (
                <Picker.Item key={r.value} label={r.label} value={r.value} />
              ))}
            </Picker>
          </View>

          {/* Botones */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={onCancel}
              disabled={!!saving}
            >
              <Text style={[styles.btnText, { color: "#111827" }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => onSubmit(form)}
              disabled={!!saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Ocupa el ancho abajo (bottom sheet)
  sheet: {
    flex: 1,
    justifyContent: "flex-end",
  },
  // Carta blanca
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  content: {
    paddingBottom: 10,
  },
  handle: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    marginBottom: 6,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: {
    backgroundColor: "#F3F4F6",
  },
  btnPrimary: {
    backgroundColor: "#2F80ED",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
