
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { auth, db } from "../firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ChipScreen() {
  const user = auth.currentUser;
  const [address, setAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Ninguno");
  const [history, setHistory] = useState([]);


  const fetchShopData = async () => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      setAddress(data.address || "");
      setPaymentMethod(data.paymentMethod || "Ninguno");
      setHistory(data.history || []);
    }
  };


  const saveAddress = async () => {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { address: newAddress }, { merge: true });
    setAddress(newAddress);
    setNewAddress("");
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compra de Chip</Text>


      <View style={styles.card}>
        <Text style={styles.label}>📍 Dirección de envío:</Text>
        <Text style={styles.value}>{address || "No registrada"}</Text>
        <TextInput
          placeholder="Escribe nueva dirección"
          style={styles.input}
          value={newAddress}
          onChangeText={setNewAddress}
        />
        <TouchableOpacity style={styles.saveButton} onPress={saveAddress}>
          <Text style={styles.saveText}>Guardar Dirección</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.card}>
        <Text style={styles.label}>💳 Método de pago:</Text>
        <Text style={styles.value}>{paymentMethod}</Text>
      </View>


      <View style={styles.card}>
        <Text style={styles.label}>🛒 Historial de compras:</Text>
        {history.length > 0 ? (
          <FlatList
            data={history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text style={styles.value}>- {item}</Text>}
          />
        ) : (
          <Text style={styles.value}>No hay compras registradas</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:"#FFF7E6" },
  title: { fontSize:24, fontWeight:"bold", marginBottom:20, color:"#6CC070", textAlign:"center" },
  card: { backgroundColor:"#fff", padding:15, borderRadius:10, marginBottom:15, elevation:2 },
  label: { fontWeight:"bold", fontSize:16, marginBottom:5 },
  value: { color:"#555", marginBottom:10 },
  input: { borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10, marginBottom:10 },
  saveButton: { backgroundColor:"#6CC070", padding:12, borderRadius:8, alignItems:"center" },
  saveText: { color:"#fff", fontWeight:"bold" },
});
