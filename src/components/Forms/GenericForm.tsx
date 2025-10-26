import { FieldConfig } from "../../models/Models";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,

  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

interface Props {
  fields: FieldConfig[];                // definición de campos
  onSubmit: (values: Record<string, any>) => void; // función callback
  submitLabel?: string;                 // texto del botón
}

export const GenericForm: React.FC<Props> = ({ fields, onSubmit, submitLabel = "Enviar" }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cambiar valor de un campo
  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // Validar y enviar
  const handleSubmit = () => {
    let newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.name]) {
        newErrors[f.name] = `${f.label} es obligatorio`;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    } else {
      Alert.alert("❌ Error", "Corrige los errores antes de enviar");
    }
  };

  return (
    <View>
      {fields.map((field) => (
        <View key={field.name} style={styles.inputContainer}>
          <Text style={styles.label}>{field.label}</Text>

          {field.type === "select" ? (
            <View style={styles.selectBox}>
              <Picker
                selectedValue={values[field.name]}
                onValueChange={(value) => handleChange(field.name, value)}
              >
                <Picker.Item label="Seleccione..." value="" />
                {field.options?.map((opt) => (
                  <Picker.Item key={opt} label={opt} value={opt} />
                ))}
              </Picker>
            </View>
          ) : (
            <TextInput
              style={[
                styles.input,
                errors[field.name] ? styles.inputError : null,
              ]}
              placeholder={field.placeholder}
              secureTextEntry={field.type === "password"}
              keyboardType={field.type === "email" ? "email-address" : "default"}
              value={values[field.name] || ""}
              onChangeText={(text) => handleChange(field.name, text)}
            />
          )}

          {errors[field.name] && (
            <Text style={styles.errorText}>{errors[field.name]}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🔹 estilos igual que en login
const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#B8D4E7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#F8FBFD",
    color: "#2C3E50",
  },
  inputError: {
    borderColor: "#E74C3C",
    backgroundColor: "#FDEDED",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  selectBox: {
    borderWidth: 2,
    borderColor: "#B8D4E7",
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButton: {
    backgroundColor: "#5A9FD4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
