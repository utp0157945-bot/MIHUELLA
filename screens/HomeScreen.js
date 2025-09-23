import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function Home() {
  return (
    <View style={styles.container}>
      <Image source={{uri:""}} style={styles.image}/>
      <Text style={styles.title}>¡Bienvenido a Mi Huella!</Text>
      <Text style={styles.subtitle}>Tu app confiable de mascotas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#FFF7E6", padding:20 },
  image: { width: width-40, height:250, resizeMode:"cover", borderRadius:15, marginBottom:20 },
  title: { fontSize:28, fontWeight:"bold", color:"#6CC070", marginBottom:10 },
  subtitle: { fontSize:18, color:"#555" }
});
