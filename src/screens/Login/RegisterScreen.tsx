import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { AuthLayout } from '../../layout/AuthLayout';
import { PersonUserCreateDto, Gender, HealthRegime, DocumentTypes, Eps } from '../../models/Gestion/Register';
import { LoadingOverlay } from '../../utils/LoadingOverlay';
import RegisterService from '../../services/registerService';

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Catálogos
  const [documentTypes, setDocumentTypes] = useState<DocumentTypes[]>([]);
  const [epsList, setEpsList] = useState<Eps[]>([]);
  const [catalogsLoaded, setCatalogsLoaded] = useState(false);

  // Formulario
  const [fullName, setFullName] = useState('');
  const [fullLastName, setFullLastName] = useState('');
  const [documentTypeId, setDocumentTypeId] = useState<number | null>(null);
  const [document, setDocument] = useState('');
  const [dateBorn, setDateBorn] = useState('');
  const [gender, setGender] = useState<string>('');
  const [healthRegime, setHealthRegime] = useState<string>('');
  const [epsId, setEpsId] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Errores
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      setCatalogsLoaded(false);
      
      const [types, eps] = await Promise.all([
        RegisterService.getDocumentTypes(),
        RegisterService.getEpsList()
      ]);

      console.log('📋 Tipos de documento cargados:', types);
      console.log('📋 Cantidad:', types?.length);
      console.log('🏥 EPS cargadas:', eps);
      console.log('🏥 Cantidad:', eps?.length);

      // Forzar actualización
      setDocumentTypes([]);
      setEpsList([]);
      
      setTimeout(() => {
        setDocumentTypes(types || []);
        setEpsList(eps || []);
        setCatalogsLoaded(true);
        console.log('✅ Estados actualizados');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error cargando catálogos:', error);
      Alert.alert('Error', 'No se pudieron cargar los catálogos.');
      setCatalogsLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!fullName.trim()) newErrors.fullName = 'Nombre es obligatorio';
      if (!fullLastName.trim()) newErrors.fullLastName = 'Apellidos son obligatorios';
      if (!documentTypeId) newErrors.documentTypeId = 'Tipo de documento es obligatorio';
      if (!document.trim()) newErrors.document = 'Número de documento es obligatorio';
      if (!dateBorn.trim()) newErrors.dateBorn = 'Fecha de nacimiento es obligatoria';
    } else if (step === 2) {
      if (!gender) newErrors.gender = 'Género es obligatorio';
      if (!healthRegime) newErrors.healthRegime = 'Régimen de salud es obligatorio';
      if (!epsId) newErrors.epsId = 'EPS es obligatoria';
    } else if (step === 3) {
      if (!phoneNumber.trim()) newErrors.phoneNumber = 'Teléfono es obligatorio';
    } else if (step === 4) {
      if (!email.trim()) newErrors.email = 'Correo es obligatorio';
      if (!password.trim()) newErrors.password = 'Contraseña es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      Alert.alert('❌ Error', 'Completa todos los campos obligatorios');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
      setErrors({});
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);

      // Mapear gender a número
      const genderMap: Record<string, number> = {
        'Masculino': 1,
        'Femenino': 2
      };

      // Mapear healthRegime a número
      const healthRegimeMap: Record<string, number> = {
        'Contributivo': 1,
        'Subsidiado': 2,
        'Excepcion': 3
      };

      const dto: PersonUserCreateDto = {
        fullName,
        fullLastName,
        documentTypeId: documentTypeId!,
        document,
        dateBorn,
        phoneNumber,
        gender: genderMap[gender] as any, // Convertir a número
        healthRegime: healthRegimeMap[healthRegime] as any, // Convertir a número
        epsId: epsId!,
        address: address || undefined,
        email,
        password,
        rescheduling: false,
        restrictionPoint: 3
      };

      console.log('📤 DTO a enviar:', JSON.stringify(dto, null, 2));

      await RegisterService.createPersonUser(dto);

      Alert.alert(
        '✅ Registro exitoso',
        'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
        [
          {
            text: 'Ir a login',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      Alert.alert(
        '⚠️ Error',
        error.response?.data?.message || 'No se pudo completar el registro.'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    } else {
      navigation.goBack();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Datos personales';
      case 2: return 'Género y salud';
      case 3: return 'Información de contacto';
      case 4: return 'Credenciales de acceso';
      default: return 'Registro';
    }
  };

  return (
    <>
      <AuthLayout>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Registro</Text>
          <Text style={styles.subtitle}>{getStepTitle()}</Text>
          
         

          {/* Indicador de pasos */}
          <View style={styles.stepIndicator}>
            {[1, 2, 3, 4].map(s => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  s === step && styles.stepDotActive,
                  s < step && styles.stepDotCompleted
                ]}
              />
            ))}
          </View>

          {/* ==================== PASO 1: Datos Personales ==================== */}
          {step === 1 && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre completo *</Text>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="Ingresa tu nombre"
                  value={fullName}
                  onChangeText={setFullName}
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Apellidos *</Text>
                <TextInput
                  style={[styles.input, errors.fullLastName && styles.inputError]}
                  placeholder="Ingresa tus apellidos"
                  value={fullLastName}
                  onChangeText={setFullLastName}
                />
                {errors.fullLastName && <Text style={styles.errorText}>{errors.fullLastName}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tipo de documento *</Text>
                <View style={[styles.selectBox, errors.documentTypeId && styles.inputError]}>
                  <Picker
                    selectedValue={documentTypeId}
                    onValueChange={(value) => {
                      console.log('🔄 Documento seleccionado:', value);
                      setDocumentTypeId(value as number);
                    }}
                    enabled={catalogsLoaded && documentTypes.length > 0}
                  >
                    <Picker.Item label="Seleccione..." value={null} />
                    {catalogsLoaded && documentTypes.length > 0 ? (
                      documentTypes.map((type) => {
                        console.log('📄 Renderizando tipo:', type.name, type.id);
                        return (
                          <Picker.Item key={type.id} label={type.name} value={type.id} />
                        );
                      })
                    ) : (
                      <Picker.Item label="Cargando..." value={null} />
                    )}
                  </Picker>
                </View>
                {errors.documentTypeId && <Text style={styles.errorText}>{errors.documentTypeId}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Número de documento *</Text>
                <TextInput
                  style={[styles.input, errors.document && styles.inputError]}
                  placeholder="Ingresa tu documento"
                  value={document}
                  onChangeText={setDocument}
                  keyboardType="numeric"
                />
                {errors.document && <Text style={styles.errorText}>{errors.document}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fecha de nacimiento (YYYY-MM-DD) *</Text>
                <TextInput
                  style={[styles.input, errors.dateBorn && styles.inputError]}
                  placeholder="2000-01-15"
                  value={dateBorn}
                  onChangeText={setDateBorn}
                />
                {errors.dateBorn && <Text style={styles.errorText}>{errors.dateBorn}</Text>}
              </View>
            </>
          )}

          {/* ==================== PASO 2: Género y Salud ==================== */}
          {step === 2 && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Género *</Text>
                <View style={[styles.selectBox, errors.gender && styles.inputError]}>
                  <Picker
                    selectedValue={gender}
                    onValueChange={(value) => setGender(value as string)}
                  >
                    <Picker.Item label="Seleccione..." value="" />
                    <Picker.Item label="Masculino" value="Masculino" />
                    <Picker.Item label="Femenino" value="Femenino" />
                  </Picker>
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Régimen de salud *</Text>
                <View style={[styles.selectBox, errors.healthRegime && styles.inputError]}>
                  <Picker
                    selectedValue={healthRegime}
                    onValueChange={(value) => setHealthRegime(value as string)}
                  >
                    <Picker.Item label="Seleccione..." value="" />
                    <Picker.Item label="Contributivo" value="Contributivo" />
                    <Picker.Item label="Subsidiado" value="Subsidiado" />
                    <Picker.Item label="Excepción" value="Excepcion" />
                  </Picker>
                </View>
                {errors.healthRegime && <Text style={styles.errorText}>{errors.healthRegime}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>EPS *</Text>
                <View style={[styles.selectBox, errors.epsId && styles.inputError]}>
                  <Picker
                    selectedValue={epsId}
                    onValueChange={(value) => {
                      console.log('🔄 EPS seleccionada:', value);
                      setEpsId(value as number);
                    }}
                    enabled={catalogsLoaded && epsList.length > 0}
                  >
                    <Picker.Item label="Seleccione..." value={null} />
                    {catalogsLoaded && epsList.length > 0 ? (
                      epsList.map((eps) => {
                        console.log('🏥 Renderizando EPS:', eps.name, eps.id);
                        return (
                          <Picker.Item key={eps.id} label={eps.name} value={eps.id} />
                        );
                      })
                    ) : (
                      <Picker.Item label="Cargando..." value={null} />
                    )}
                  </Picker>
                </View>
                {errors.epsId && <Text style={styles.errorText}>{errors.epsId}</Text>}
              </View>
            </>
          )}

          {/* ==================== PASO 3: Contacto ==================== */}
          {step === 3 && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono *</Text>
                <TextInput
                  style={[styles.input, errors.phoneNumber && styles.inputError]}
                  placeholder="Ingresa tu teléfono"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu dirección (opcional)"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </>
          )}

          {/* ==================== PASO 4: Credenciales ==================== */}
          {step === 4 && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo electrónico *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña *</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
            </>
          )}

          {/* Botón de continuar/finalizar */}
          <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
            <Text style={styles.submitText}>
              {step === 4 ? 'Finalizar registro' : 'Continuar'}
            </Text>
          </TouchableOpacity>

          {/* Botón de volver */}
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>
              {step === 1 ? '← Volver al login' : '← Paso anterior'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </AuthLayout>

      <LoadingOverlay visible={loading} />
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5A9FD4',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0'
  },
  stepDotActive: {
    backgroundColor: '#5A9FD4',
    width: 14,
    height: 14,
    borderRadius: 7
  },
  stepDotCompleted: {
    backgroundColor: '#2ECC71'
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#B8D4E7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F8FBFD',
    color: '#2C3E50',
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FDEDED',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  selectBox: {
    borderWidth: 2,
    borderColor: '#B8D4E7',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FBFD',
  },
  submitButton: {
    backgroundColor: '#5A9FD4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  backText: {
    fontSize: 14,
    color: '#5A9FD4',
    fontWeight: '500'
  }
});