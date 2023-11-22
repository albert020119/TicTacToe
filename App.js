import React, { useState } from 'react';
import { StatusBar, TextInput, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import md5, { str_md5 } from "react-native-md5";

const firebaseConfig = {
  apiKey: "AIzaSyAx1fkbBA9XRVfy_goTGs95VCoS5tm1fOM",
  authDomain: "tictactoe-5f583.firebaseapp.com",
  projectId: "tictactoe-5f583",
  storageBucket: "tictactoe-5f583.appspot.com",
  messagingSenderId: "340949978979",
  appId: "1:340949978979:web:622b9c16d69cad11f7cd56",
  measurementId: "G-8HYCE4ED9E"
};

const app = initializeApp(firebaseConfig);

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const database = getDatabase(app);
    const userRef = ref(database, 'users/' + username);

    try {
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const storedPasswordHash = snapshot.val().password;
        const enteredPasswordHash = md5.str_md5(password + "");

        if (storedPasswordHash === enteredPasswordHash) {
          console.log('Login successful');
        } else {
          console.log('Incorrect password');
        }
      } else {
        console.log('User does not exist');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
    }
  };

  const handleRegister = async () => {
    const database = getDatabase(app);
    let hash = md5.str_md5(password + "");
    set(ref(database, 'users/' + username), {
      password: hash
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 20, // Make it rounder
    width: '80%',
    marginVertical: 10,
    paddingLeft: 10,
    color: '#fff',
  },
  button: {
    backgroundColor: '#2980b9',
    padding: 10,
    marginVertical: 10,
    borderRadius: 20, // Make it rounder
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
