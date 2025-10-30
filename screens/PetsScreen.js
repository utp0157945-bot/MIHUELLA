import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { auth, db } from "../firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import * as Location from "expo-location";
import * as Animatable from "react-native-animatable";
import * as Notifications from "expo-notifications";

// --- Configuración de notificaciones locales ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PetsScreen() {
  const [pets, setPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    age: "",
    breed: "",
    color: "",
    type: "",
    weight: "",
    vaccines: "",
  });
  const [saving, setSaving] = useState(false);

  // 🐾 Escucha las mascotas del usuario
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "pets"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const petsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPets(petsData);
    });
    return () => unsubscribe();
  }, []);

  // 🧭 Obtener ubicación actual
  const getCurrentCoords = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Activa la ubicación para continuar.");
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({});
      return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    } catch (e) {
      console.warn("⚠️ No se pudo obtener ubicación:", e);
      return null;
    }
  };

  // 🐶 Agregar mascota
  const addPet = async () => {
    if (!newPet.name || !newPet.type) {
      Alert.alert("Error", "Por favor completa el nombre y el tipo.");
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      const coords = await getCurrentCoords();

      const docRef = await addDoc(collection(db, "pets"), {
        ...newPet,
        userId: user.uid,
        chip: "Vinculado ✅",
        createdAt: new Date().toISOString(),
        location: coords || null,
      });

      // 🔔 Notificación por nueva mascota
      await createAndSaveNotification(
        `Nueva mascota agregada`,
        `Has registrado a ${newPet.name}.`
      );

      setNewPet({
        name: "",
        age: "",
        breed: "",
        color: "",
        type: "",
        weight: "",
        vaccines: "",
      });
      setModalVisible(false);
      Alert.alert("Éxito", "Mascota guardada correctamente.");
    } catch (e) {
      console.error("Error al guardar mascota:", e);
      Alert.alert("Error", "No se pudo guardar la mascota.");
    } finally {
      setSaving(false);
    }
  };

  // 📍 Actualizar ubicación manualmente
  const updatePetLocation = async (petId, petName) => {
    try {
      const coords = await getCurrentCoords();
      if (!coords) return;
      await updateDoc(doc(db, "pets", petId), { location: coords });

      // 🔔 Notificación al actualizar ubicación manualmente
      await createAndSaveNotification(
        `Ubicación actualizada`,
        `Has actualizado la ubicación de ${petName}.`
      );

      Alert.alert("✅ Ubicación actualizada", "Se ha guardado la nueva ubicación.");
    } catch (e) {
      console.error("Error al actualizar ubicación:", e);
      Alert.alert("Error", "No se pudo actualizar la ubicación.");
    }
  };

  // ❌ Eliminar mascota
  const deletePet = async (petId, petName) => {
    Alert.alert(
      "Eliminar mascota",
      `¿Seguro que quieres eliminar a ${petName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "pets", petId));

              // 🔔 Notificación al eliminar mascota
              await createAndSaveNotification(
                `Mascota eliminada`,
                `${petName} ha sido eliminada de tu lista.`
              );

              Alert.alert("Eliminada", `${petName} fue eliminada correctamente.`);
            } catch (e) {
              console.error("Error al eliminar mascota:", e);
              Alert.alert("Error", "No se pudo eliminar la mascota.");
            }
          },
        },
      ]
    );
  };

  // 🔔 Crear y guardar notificación
  async function createAndSaveNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null,
      });

      const user = auth.currentUser;
      if (!user) return;
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title,
        body,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Error al crear notificación:", e);
    }
  }

  // 🐾 Íconos según tipo
  const getPetIcon = (type = "") => {
    const key = type.trim().toLowerCase();
    const icons = {
      perro: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
      gato: "https://cdn-icons-png.flaticon.com/512/616/616430.png",
      ave: "https://cdn-icons-png.flaticon.com/512/6031/6031612.png",
      pez: "https://cdn-icons-png.flaticon.com/512/2241/2241046.png",
      conejo: "https://cdn-icons-png.flaticon.com/512/3831/3831225.png",
      tortuga: "https://cdn-icons-png.flaticon.com/512/1623/1623835.png",
      hamster: "https://cdn-icons-png.flaticon.com/512/1405/1405497.png",
      cobaya: "https://cdn-icons-png.flaticon.com/512/7699/7699663.png",
      chinchilla: "https://cdn-icons-png.flaticon.com/512/2808/2808845.png",
      raton: "https://cdn-icons-png.flaticon.com/512/4734/47342.png",
      serpiente: "https://cdn-icons-png.flaticon.com/512/5375/5375880.png",
      iguana: "https://cdn-icons-png.flaticon.com/512/3060/3060599.png",
      axolote: "https://cdn-icons-png.flaticon.com/512/9599/9599605.png",
      loro: "https://cdn-icons-png.flaticon.com/512/2808/2808884.png",
      default: "https://cdn-icons-png.flaticon.com/512/616/616554.png",
    };
    return icons[key] || icons.default;
  };

  return (
    <View style={styles.container}>
      <Animatable.Text animation="bounceInDown" duration={800} style={styles.title}>
        🐾 Mis Mascotas
      </Animatable.Text>

      <Animatable.View animation="fadeInUp" delay={120} style={[styles.whiteSection, { flex: 1 }]}>
        {pets.length === 0 ? (
          <Animatable.Text animation="fadeIn" style={styles.emptyText}>
            No tienes mascotas registradas aún 🐾
          </Animatable.Text>
        ) : (
          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animatable.View animation="zoomIn" delay={index * 80} style={styles.petCard}>
                <Image source={{ uri: getPetIcon(item.type) }} style={styles.petImage} />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{item.name}</Text>
                  <Text>🐾 Tipo: {item.type}</Text>
                  <Text>🎂 Edad: {item.age || "N/A"} años</Text>
                  <Text>🧬 Raza: {item.breed || "N/A"}</Text>
                  <Text>🎨 Color: {item.color || "No registrado"}</Text>
                  <Text>⚖️ Peso: {item.weight || "No registrado"} kg</Text>
                  <Text>💉 Vacunas: {item.vaccines || "No registradas"}</Text>

                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => updatePetLocation(item.id, item.name)}
                  >
                    <Text style={styles.updateText}>📍 Actualizar ubicación</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deletePet(item.id, item.name)}
                  >
                    <Text style={styles.deleteText}>🗑️ Eliminar mascota</Text>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animatable.View>

      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={2200}
        style={styles.addButtonContainer}
      >
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addText}>+ Añadir Mascota</Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* MODAL NUEVA MASCOTA */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <Animatable.View animation="zoomInUp" duration={600} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Mascota</Text>
            <ScrollView>
              <TextInput placeholder="Nombre" placeholderTextColor="#555" style={styles.input} value={newPet.name} onChangeText={(t) => setNewPet({ ...newPet, name: t })} />
              <TextInput placeholder="Tipo (Perro, Gato, Ave...)" placeholderTextColor="#555" style={styles.input} value={newPet.type} onChangeText={(t) => setNewPet({ ...newPet, type: t })} />
              <TextInput placeholder="Edad" placeholderTextColor="#555" style={styles.input} value={newPet.age} onChangeText={(t) => setNewPet({ ...newPet, age: t })} />
              <TextInput placeholder="Raza" placeholderTextColor="#555" style={styles.input} value={newPet.breed} onChangeText={(t) => setNewPet({ ...newPet, breed: t })} />
              <TextInput placeholder="Color" placeholderTextColor="#555" style={styles.input} value={newPet.color} onChangeText={(t) => setNewPet({ ...newPet, color: t })} />
              <TextInput placeholder="Peso (kg)" placeholderTextColor="#555" style={styles.input} value={newPet.weight} onChangeText={(t) => setNewPet({ ...newPet, weight: t })} />
              <TextInput placeholder="Vacunas (opcional)" placeholderTextColor="#555" style={styles.input} value={newPet.vaccines} onChangeText={(t) => setNewPet({ ...newPet, vaccines: t })} />
              <TouchableOpacity style={styles.saveButton} onPress={addPet} disabled={saving}>
                <Text style={styles.saveText}>{saving ? "Guardando..." : "Guardar"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.saveText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#E8FFFF" },
  title: { fontSize: 28, fontWeight: "800", color: "#00C2C7", textAlign: "center", marginBottom: 12 },
  whiteSection: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 16, padding: 12, elevation: 3 },
  petCard: { flexDirection: "row", padding: 12, borderRadius: 12, marginVertical: 8, elevation: 1, backgroundColor: "rgba(255,255,255,0.95)" },
  petImage: { width: 65, height: 65, marginRight: 12, borderRadius: 40 },
  petInfo: { flex: 1 },
  petName: { fontSize: 18, fontWeight: "700", color: "#007B7B", marginBottom: 4 },
  emptyText: { textAlign: "center", color: "#777", fontSize: 15, paddingVertical: 20 },
  addButtonContainer: { alignItems: "center", position: "absolute", bottom: 20, left: 0, right: 0 },
  addButton: { backgroundColor: "#00C2C7", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, elevation: 6 },
  addText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  modalContent: { width: "88%", backgroundColor: "#fff", padding: 18, borderRadius: 14, elevation: 6 },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 12, textAlign: "center", color: "#00C2C7" },
  input: { borderWidth: 1, borderColor: "#E6E6E6", borderRadius: 10, padding: 12, marginBottom: 10, color: "#000" },
  saveButton: { backgroundColor: "#00C2C7", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 8 },
  cancelButton: { backgroundColor: "#FF5C5C", padding: 12, borderRadius: 10, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "800" },
  updateButton: { backgroundColor: "#00C2C7", padding: 8, borderRadius: 8, marginTop: 8, alignItems: "center", alignSelf: "flex-start" },
  updateText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  deleteButton: { backgroundColor: "#FF5C5C", padding: 8, borderRadius: 8, marginTop: 6, alignItems: "center", alignSelf: "flex-start" },
  deleteText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
