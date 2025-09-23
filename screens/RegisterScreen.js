
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Dimensions } from "react-native";
import { auth, db } from "../firebase-config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!name || !email || !password) return Alert.alert("Error", "Completa todos los campos");

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Guardar nombre en Firebase Auth
        await updateProfile(user, { displayName: name });

        // Guardar datos en Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
        });

        Alert.alert("Cuenta creada", `Bienvenido ${name}!`);
        navigation.replace("Home");
      })
      .catch(error => Alert.alert("Error", error.message));
  };

  return (
    <View style={styles.container}>
      <Image source={{uri:"https://i.pinimg.com/564x/65/0f/5f/650f5fc1c1fbc8c4d2f1e8e5b9b9c4ff.jpg"}} style={styles.backgroundImage}/>
      <View style={styles.overlay}/>
      <View style={styles.content}>
        <Text style={styles.title}>Registro</Text>
        <TextInput style={styles.input} placeholder="Nombre completo" value={name} onChangeText={setName}/>
        <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
        <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry/>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Crear Cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver</Text>
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
  title: { fontSize:36, fontWeight:"bold", color:"#6CC070", marginBottom:20 },
  input: { width:"100%", height:50, borderRadius:12, backgroundColor:"#fff", paddingHorizontal:15, marginBottom:15, fontSize:16 },
  button: { width:"100%", height:50, borderRadius:12, backgroundColor:"#6CC070", justifyContent:"center", alignItems:"center", marginVertical:10 },
  backButton: { backgroundColor:"#70BFF0" },
  buttonText: { color:"#fff", fontSize:18, fontWeight:"bold" }
});
