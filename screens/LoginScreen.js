import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Dimensions } from "react-native";
import { auth } from "../firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) return Alert.alert("Error", "Completa todos los campos");

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("¡Bienvenido!");
        navigation.replace("Home");
      })
      .catch(error => Alert.alert("Error", error.message));
  };

  return (
    <View style={styles.container}>
  <Image source={require('../assets/casa-de-mascotas.png')} style={styles.decorativeImage}/>
      <View style={styles.overlay}/>
      <View style={styles.content}>
        <Text style={styles.title}>Mi Huella</Text>
        <Text style={styles.subtitle}>Bienvenido a la app de mascotas</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Correo electrónico" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" 
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:"center", alignItems:"center" },
  backgroundImage: { position:"absolute", width, height:"100%", resizeMode:"cover" },
  overlay: { position:"absolute", width, height:"100%", backgroundColor:"rgba(255,247,230,0.4)" },
  content: { flex:1, width:"90%", justifyContent:"center", alignItems:"center", padding:20 },
  title: { fontSize:36, fontWeight:"bold", color:"#6CC070", marginBottom:10, textShadowColor:"#000", textShadowOffset:{width:1,height:1}, textShadowRadius:4 },
  subtitle: { fontSize:16, color:"#333", marginBottom:30 },
  input: { width:"100%", height:50, borderRadius:12, backgroundColor:"#fff", paddingHorizontal:15, marginBottom:15, fontSize:16, shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:4, elevation:2 },
  button: { width:"100%", height:50, borderRadius:12, backgroundColor:"#6CC070", justifyContent:"center", alignItems:"center", marginVertical:10, shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.2, shadowRadius:4, elevation:3 },
  registerButton: { backgroundColor:"#70BFF0" },
  buttonText: { color:"#fff", fontSize:18, fontWeight:"bold" }, decorativeImage: {
  position: 'absolute',     
  top: 60,                 
  left: '10%',            
  width: '80%',             
  height: 200,            
  resizeMode: 'contain',    
  opacity: 0.40,            
  zIndex: 1                 
}

});
