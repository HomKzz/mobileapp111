import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../FirebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const FloralInput = ({ placeholder, value, onChangeText, secureTextEntry }) => (
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#7c7c7c"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const FloralButton = ({ onPress, title }) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
    <LinearGradient
      colors={['#ff9a9e', '#fad0c4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("สมัครรหัสผู้ใช้สำเร็จ");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("ล็อคอินสำเร็จ");
      }
      navigation.navigate('Home');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://example.com/floral-background.jpg' }}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>{isSignUp ? "สร้างบัญชี" : "เข้าสู่ระบบ"}</Text>
          <FloralInput
            placeholder="อีเมล"
            value={email}
            onChangeText={setEmail}
          />
          <FloralInput
            placeholder="รหัสผ่าน"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <FloralButton onPress={handleAuth} title={isSignUp ? "สร้างบัญชี" : "เข้าสู่ระบบ"} />
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.toggleText}>
              {isSignUp 
                ? "มีรหัสอยู่แล้ว ? ล็อคอินเลย" 
                : "หรือยังไม่มีรหัส ? สมัครรหัสผ่านเลย"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#fad0c4',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  toggleText: {
    marginTop: 20,
    color: '#ff9a9e',
    fontSize: 16,
  },
});

export default AuthScreen;