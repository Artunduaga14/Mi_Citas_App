import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { RelatedPersonService } from "../../services/hospital/relatedPerson";
import { RelatedPersonCreate } from "../../models/Gestion/RelatedPerson";
import { HttpService } from "../../services/GenericServices";
import { RelatedPersonList } from "../cards/RelatedPersonCard";

type Relation =
  | "Papá" | "Mamá" | "Hijo" | "Hija" | "Hermano" | "Hermana"
  | "Tío" | "Tía" | "Sobrino" | "Sobrina" | "Abuelo" | "Abuela" | "Otro";

type DocumentType = { id: number; name: string };

export interface RelatedPersonModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
  personId: number;
  documentTypes?: DocumentType[];

  // NUEVO: modo y datos iniciales para editar
  mode?: "create" | "edit";
  initial?: RelatedPersonList;
}

export default function RelatedPersonModal({
  visible,
  onClose,
  onSaved,
  personId,
  documentTypes,
  mode = "create",
  initial,
}: RelatedPersonModalProps) {
  const isEdit = mode === "edit";

  // ----- state -----
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [relation, setRelation] = useState<Relation>("Otro");
  const [documentTypeId, setDocumentTypeId] = useState<number | undefined>(undefined);
  const [idNumero, setIdNumero] = useState("");
  const [saving, setSaving] = useState(false);

  const [types, setTypes] = useState<DocumentType[]>(documentTypes ?? []);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // ----- validators -----
  const nameValid = useMemo(() => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/.test(name.trim()), [name]);
  const lastnameValid = useMemo(() => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/.test(lastname.trim()), [lastname]);
  const docValid = useMemo(() => /^[0-9]{5,}$/.test(idNumero.trim()), [idNumero]);
  const relationValid = useMemo(() => !!relation, [relation]);
  const docTypeValid = useMemo(() => typeof documentTypeId === "number", [documentTypeId]);
  const formValid = nameValid && lastnameValid && docValid && relationValid && docTypeValid;

  // ----- cargar tipos de documento -----
  useEffect(() => {
    let mounted = true;
    if (documentTypes?.length) return;
    (async () => {
      try {
        setLoadingTypes(true);
        const res = await HttpService.get("DocumentType");
        if (!mounted) return;
        setTypes(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("Error cargando tipos de documento:", e);
        setTypes([]);
      } finally {
        mounted && setLoadingTypes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [documentTypes]);

  // ----- precargar datos en modo edición -----
  useEffect(() => {
    if (visible && isEdit && initial) {
      const parts = (initial.fullName || "").trim().split(/\s+/);
      const last = parts.length > 1 ? parts.pop()! : "";
      const first = parts.join(" ");
      setName(first || "");
      setLastname(last || "");
      setRelation((initial.relation as Relation) || "Otro");
      setDocumentTypeId((initial as any).documentTypeId ?? undefined);
      setIdNumero(initial.document || "");
    }
  }, [visible, isEdit, initial]);

  // ----- reset al cerrar -----
  useEffect(() => {
    if (!visible) {
      setName("");
      setLastname("");
      setRelation("Otro");
      setDocumentTypeId(undefined);
      setIdNumero("");
      setSaving(false);
    }
  }, [visible]);

  // ----- guardar / actualizar -----
  const handleSave = async () => {
    if (!formValid || saving) return;
    try {
      setSaving(true);

      const dto: RelatedPersonCreate = {
        personId,
        firstName: name.trim(),
        lastName: lastname.trim(),
        relation,
        documentTypeId: documentTypeId as number,
        document: idNumero.trim(),
      };

      if (isEdit && initial?.id != null) {
        console.log("Updating related person:", { ...dto, id: initial.id });
        await RelatedPersonService.Update( { ...dto, id: initial.id });

        Alert.alert("✅ Listo", "Persona relacionada actualizada.");
      } else {
        await RelatedPersonService.create(dto);
        Alert.alert("✅ Éxito", "Persona relacionada creada correctamente.");
      }

      onClose();
      onSaved?.();
    } catch (e: any) {
      console.error(e);
      const apiMsg =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        (isEdit ? "No se pudo actualizar." : "No se pudo crear la persona relacionada.");
      Alert.alert("❌ Error", String(apiMsg));
    } finally {
      setSaving(false);
    }
  };

  // ----- UI -----
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>
            {isEdit ? "Editar persona relacionada" : "Agregar persona relacionada"}
          </Text>

          <FormField
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Solo letras"
            error={!nameValid && name.length > 0 ? "Mín. 2 letras, sin números" : undefined}
            returnKeyType="next"
          />

          <FormField
            label="Apellido"
            value={lastname}
            onChangeText={setLastname}
            placeholder="Solo letras"
            error={!lastnameValid && lastname.length > 0 ? "Mín. 2 letras, sin números" : undefined}
            returnKeyType="next"
          />

          <View style={styles.field}>
            <Text style={styles.label}>Relación</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={relation} onValueChange={(val) => setRelation(val)}>
                {RELATIONS.map((r) => (
                  <Picker.Item key={r} label={r} value={r} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tipo de documento</Text>
            <View style={styles.pickerWrap}>
              {loadingTypes ? (
                <View style={{ paddingVertical: 10 }}>
                  <ActivityIndicator />
                </View>
              ) : (
                <Picker
                  selectedValue={documentTypeId}
                  onValueChange={(val) => setDocumentTypeId(val)}
                >
                  <Picker.Item label="Seleccione..." value={undefined} />
                  {types.map((t) => (
                    <Picker.Item key={t.id} label={t.name} value={t.id} />
                  ))}
                </Picker>
              )}
            </View>
            {!docTypeValid && <Text style={styles.error}>Seleccione un tipo</Text>}
          </View>

          <FormField
            label="Documento"
            value={idNumero}
            onChangeText={(t) => setIdNumero(t.replace(/[^\d]/g, ""))}
            placeholder="Solo números"
            keyboardType="numeric"
            error={!docValid && idNumero.length > 0 ? "Mín. 5 dígitos" : undefined}
            maxLength={15}
            returnKeyType="done"
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGhost]} disabled={saving}>
              <Text style={[styles.btnText, { color: "#111" }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.btn, styles.btnPrimary, (!formValid || saving) && styles.btnDisabled]}
              disabled={!formValid || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{isEdit ? "Guardar cambios" : "Guardar"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const RELATIONS: Relation[] = [
  "Papá", "Mamá", "Hijo", "Hija", "Hermano", "Hermana",
  "Tío", "Tía", "Sobrino", "Sobrina", "Abuelo", "Abuela", "Otro"
];

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  maxLength,
  returnKeyType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: "default" | "numeric";
  maxLength?: number;
  returnKeyType?: "done" | "next" | "go" | "send" | "search";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={[styles.input, !!error && styles.inputError]}
        autoCapitalize="words"
        autoCorrect={false}
        keyboardType={keyboardType}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 8 },

  field: { marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: "600", color: "#111" },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111",
  },
  inputError: { borderWidth: 1, borderColor: "#EF4444" },
  pickerWrap: { backgroundColor: "#F3F4F6", borderRadius: 12, overflow: "hidden" },
  error: { color: "#EF4444", marginTop: 4, fontSize: 12 },

  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  btnGhost: { backgroundColor: "transparent" },
  btnPrimary: { backgroundColor: "#3B82F6" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700" },
});
