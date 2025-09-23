
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image } from "react-native";
import { auth, db } from "../firebase-config";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

export default function PetsScreen() {
  const [pets, setPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPet, setNewPet] = useState({ name: "", age: "", breed: "", color: "", weight: "", vaccines: "" });

  // 🔹 Cargar mascotas en tiempo real
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "pets"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const petsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPets(petsData);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Añadir mascota
  const addPet = async () => {
    if (!newPet.name || !newPet.age || !newPet.breed || !newPet.color) return;
    await addDoc(collection(db, "pets"), {
      ...newPet,
      userId: auth.currentUser.uid,
      chip: "Vinculado ✅",
    });
    setNewPet({ name: "", age: "", breed: "", color: "", weight: "", vaccines: "" });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Mascotas</Text>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.petCard}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/616/616408.png" }} style={styles.petImage} />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{item.name}</Text>
              <Text>Edad: {item.age}</Text>
              <Text>Raza: {item.breed}</Text>
              <Text>Color: {item.color}</Text>
              {item.weight ? <Text>Peso: {item.weight} kg</Text> : null}
              <Text>Chip GPS: {item.chip}</Text>
              {item.vaccines ? <Text>Vacunas: {item.vaccines}</Text> : <Text>Vacunas: No registradas</Text>}
            </View>
          </View>
        )}
      />

      {/* Botón de añadir */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addText}>+ Añadir Mascota</Text>
      </TouchableOpacity>

      {/* Modal para nueva mascota */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Mascota</Text>
            <TextInput placeholder="Nombre" style={styles.input} value={newPet.name} onChangeText={(t) => setNewPet({ ...newPet, name: t })} />
            <TextInput placeholder="Edad" style={styles.input} value={newPet.age} onChangeText={(t) => setNewPet({ ...newPet, age: t })} />
            <TextInput placeholder="Raza" style={styles.input} value={newPet.breed} onChangeText={(t) => setNewPet({ ...newPet, breed: t })} />
            <TextInput placeholder="Color" style={styles.input} value={newPet.color} onChangeText={(t) => setNewPet({ ...newPet, color: t })} />
            <TextInput placeholder="Vacunas (opcional)" style={styles.input} value={newPet.vaccines} onChangeText={(t) => setNewPet({ ...newPet, vaccines: t })} />

            <TouchableOpacity style={styles.saveButton} onPress={addPet}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.saveText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:"#FFF7E6" },
  title: { fontSize:24, fontWeight:"bold", marginBottom:15, color:"#6CC070", textAlign:"center" },
  petCard: { flexDirection:"row", backgroundColor:"#fff", padding:15, marginVertical:8, borderRadius:10, elevation:2 },
  petImage: { width:60, height:60, marginRight:15 },
  petInfo: { flex:1 },
  petName: { fontSize:18, fontWeight:"bold" },
  addButton: { backgroundColor:"#6CC070", padding:15, borderRadius:10, alignItems:"center", marginTop:20 },
  addText: { color:"#fff", fontSize:16, fontWeight:"bold" },
  modalContainer: { flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"rgba(0,0,0,0.5)" },
  modalContent: { width:"80%", backgroundColor:"#fff", padding:20, borderRadius:10 },
  modalTitle: { fontSize:20, fontWeight:"bold", marginBottom:15 },
  input: { borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10, marginBottom:10 },
  saveButton: { backgroundColor:"#6CC070", padding:12, borderRadius:8, alignItems:"center", marginBottom:10 },
  cancelButton: { backgroundColor:"#FF5C5C", padding:12, borderRadius:8, alignItems:"center" },
  saveText: { color:"#fff", fontWeight:"bold" },
});
