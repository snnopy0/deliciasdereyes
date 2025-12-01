import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';

const LoginScreen: React.FC = () => {
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login(username.trim(), password.trim());
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Error al iniciar sesión');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Delicias de Reyes App</Text>
        <Text style={styles.subtitle}>
          Control de ventas, pedidos e inventario
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario (ventas / produccion)"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña (1234)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>Usuarios de prueba:</Text>
          <Text style={styles.hintText}>
            ventas / 1234 → acceso completo
          </Text>
          <Text style={styles.hintText}>
            produccion / 1234 → pedidos e inventario
          </Text>
        </View>

        <View style={styles.creditsBox}>
          <Text style={styles.credits}>
            Claudia Cancino · Amelia Rodríguez · Joaquín Díaz
          </Text>
          <Text style={styles.credits}>
            Profesor: Víctor Escobar
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  error: {
    color: '#b91c1c',
    fontSize: 12,
    marginBottom: 4,
  },
  hintBox: {
    marginTop: 16,
    backgroundColor: '#f3f4ff',
    padding: 10,
    borderRadius: 12,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#4b5563',
  },
  hintText: {
    fontSize: 11,
    color: '#4b5563',
  },
  creditsBox: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  credits: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default LoginScreen;
