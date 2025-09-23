
import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  TextInput, Modal, Alert, ScrollView, FlatList 
} from "react-native";
import { auth, db } from "../firebase-config";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;


  const [userData, setUserData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });


  const [modalVisible, setModalVisible] = useState(false);
  const [field, setField] = useState("");
  const [newValue, setNewValue] = useState("");
  const [pets, setPets] = useState([]);


  const fetchUserData = async () => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      setUserData((prev) => ({
        ...prev,
        phone: data.phone || "",
        address: data.address || "",
      }));
    }
  };

  
  const fetchPets = async () => {
    const q = query(collection(db, "pets"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const petsData = [];
    querySnapshot.forEach((doc) => petsData.push({ id: doc.id, ...doc.data() }));
    setPets(petsData);
  };

  useEffect(() => {
    fetchUserData();
    fetchPets();
  }, []);


  const saveData = async () => {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { [field]: newValue }, { merge: true });

    if (field === "name") {
      await updateProfile(user, { displayName: newValue });
    }

    setUserData((prev) => ({ ...prev, [field]: newValue }));
    setModalVisible(false);
    Alert.alert("Actualizado", `${field} actualizado correctamente.`);
  };


  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.replace("Login"))
      .catch((error) => Alert.alert("Error", error.message));
  };

  return (
    <ScrollView style={styles.container}>
      {/* --- Header (foto + nombre + correo) --- */}
      <View style={styles.header}>
        <Image 
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png" }} 
          style={styles.avatar} 
        />
        <Text style={styles.title}>{userData.name || "Usuario"}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>

      {/* --- Datos de usuario --- */}
      <View style={styles.card}>
        <Text style={styles.label}>📛 Nombre</Text>
        <Text style={styles.value}>{userData.name}</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => { setField("name"); setNewValue(userData.name); setModalVisible(true); }}
        >
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📧 Correo</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📞 Teléfono</Text>
        <Text style={styles.value}>{userData.phone || "No registrado"}</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => { setField("phone"); setNewValue(userData.phone); setModalVisible(true); }}
        >
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📍 Dirección</Text>
        <Text style={styles.value}>{userData.address || "No registrada"}</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => { setField("address"); setNewValue(userData.address); setModalVisible(true); }}
        >
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* --- Mis Mascotas --- */}
      <Text style={styles.sectionTitle}>🐶 Mis Mascotas</Text>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.petCard}>
            <Text style={styles.petText}>🐾 {item.name} - {item.breed} ({item.age} años)</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color:"#777", marginHorizontal:20 }}>No tienes mascotas registradas.</Text>}
      />

      {/* Botón Comprar Chip */}
      <TouchableOpacity style={styles.chipButton} onPress={() => navigation.navigate("Chip")}>
        <Text style={styles.chipText}>Comprar Chip</Text>
      </TouchableOpacity>

      {/* --- Modal edición --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar {field}</Text>
            <TextInput
              placeholder={`Nuevo ${field}`}
              style={styles.input}
              value={newValue}
              onChangeText={setNewValue}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveData}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.saveText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- Logout --- */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:"#FFF7E6" },
  header: { alignItems:"center", marginVertical:20 },
  avatar: { width:100, height:100, borderRadius:50, marginBottom:10 },
  title: { fontSize:22, fontWeight:"bold", color:"#333" },
  email: { fontSize:16, color:"#555", marginBottom:10 },
  card: { backgroundColor:"#fff", padding:15, marginHorizontal:20, marginBottom:15, borderRadius:10, elevation:2 },
  label: { fontWeight:"bold", fontSize:16, marginBottom:5 },
  value: { color:"#555", marginBottom:10 },
  editButton: { backgroundColor:"#70BFF0", padding:8, borderRadius:6, alignItems:"center" },
  editText: { color:"#fff", fontWeight:"bold" },
  sectionTitle: { fontSize:18, fontWeight:"bold", marginHorizontal:20, marginTop:20, marginBottom:10, color:"#6CC070" },
  petCard: { backgroundColor:"#fff", padding:10, marginVertical:5, borderRadius:8, marginHorizontal:20 },
  petText: { fontSize:16, color:"#444" },
  chipButton: { marginHorizontal:20, marginTop:20, backgroundColor:"#70BFF0", padding:12, borderRadius:8, alignItems:"center" },
  chipText: { color:"#fff", fontSize:16, fontWeight:"bold" },
  modalContainer: { flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"rgba(0,0,0,0.5)" },
  modalContent: { width:"80%", backgroundColor:"#fff", padding:20, borderRadius:10 },
  modalTitle: { fontSize:20, fontWeight:"bold", marginBottom:15 },
  input: { borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10, marginBottom:10 },
  saveButton: { backgroundColor:"#6CC070", padding:12, borderRadius:8, alignItems:"center", marginBottom:10 },
  cancelButton: { backgroundColor:"#FF5C5C", padding:12, borderRadius:8, alignItems:"center" },
  saveText: { color:"#fff", fontWeight:"bold" },
  logoutButton: { margin:20, backgroundColor:"#FF5C5C", padding:12, borderRadius:8, alignItems:"center" },
  logoutText: { color:"#fff", fontSize:16, fontWeight:"bold" }
});
