import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { DBAPI_URI } from '@env';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const handleChange = (name, value) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleButtonClick = async () => {
    try {
      if (form.username && form.password) {
        const body = {
          username: form.username,
          password: form.password,
        };
        console.log(body)
        const { data } = await axios.post(
          DBAPI_URI + '/users/sign-in',
          body
        );

        await AsyncStorage.setItem("userData", JSON.stringify(data))

        navigation.navigate('TabNavigator', { screen: 'Menu' });
      } else {
        Alert.alert('Error', 'Please fill out all fields!');
      }
    } catch (e) {
      console.error(e.message);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} // Update path as needed
        style={styles.logo}
      />
      <Text style={styles.title}>
        <Text style={styles.hooText}>Terp</Text>Meals
      </Text>
      <Text style={styles.subtitle}>Welcome back, log in below.</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={(text) => handleChange('username', text)}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleButtonClick}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <Text style={styles.loginText}>
          Don't have an account?{' '}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate('Create')}
          >
            Register
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fad72a',
    marginBottom: 4,
  },
  hooText: {
    color: '#e31717',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 40,
  },
  formContainer: {
    alignItems: 'center',
  },
  input: {
    width: '75%',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    color: '#1e293b',
  },
  button: {
    width: '75%',
    backgroundColor: '#e31717',
    borderRadius: 4,
    padding: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 40,
    color: '#fad72a',
  },
  loginLink: {
    color: '#e31717',
  },
});