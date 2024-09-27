import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../FirebaseConfig'


const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between sign up and login


  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("สำเร็จ", "สมัครรหัสผู้ใช้สำเร็จ");
        navigation.navigate('Home'); // Navigate to Home after successful sign up
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("สำเร็จ", "ล็อคอินสำเร็จ");
        navigation.navigate('Home'); // Navigate to Home after successful login
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? "สร้างบัญชี" : "เข้าสู่ระบบ"}</Text>
      <TextInput
        style={styles.input}
        placeholder="อีเมล"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="รหัสผ่าน"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isSignUp ? "สร้างบัญชี" : "เข้าสู่ระบบ"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsSignUp(!isSignUp)}
      >
        <Text style={styles.toggleText}>
          {isSignUp ? "มีรหัสอยู่แล้ว ? ล็อคอินเลย " : "หรือยังไม่มีรหัส ? สมัครรหัสผ่านเลย"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleText: {
    marginTop: 15,
    color: '#007BFF',
  },
});

export default AuthScreen;
