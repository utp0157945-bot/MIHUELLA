import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert } from "react-native";
import { db, auth } from "./firebase-config";
import { collection, query, where, getDocs, updateDoc, doc, setDoc, addDoc } from "firebase/firestore";
// import { db, auth } from "./firebase-config";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert("Notificaciones", "Solo disponibles en dispositivos físicos.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Permiso denegado", "No se concedió permiso para notificaciones.");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "mihuella-9eedf",
  });

  const token = tokenData.data;
  console.log("Expo Push Token:", token);

  const user = auth.currentUser;
  if (user && token) {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(doc(db, "users", snapshot.docs[0].id), { expoPushToken: token });
    } else {
      await setDoc(doc(db, "users", user.uid), { uid: user.uid, expoPushToken: token });
    }
  }

  return token;
}

export async function sendPushNotification(expoPushToken, title, message) {
  if (!expoPushToken) return;

  // Enviar push a Expo
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      title,
      body: message,
    }),
  });

  // 🔹 Guardar la notificación en Firestore
  const user = auth.currentUser;
  if (user) {
    await addDoc(collection(db, "notifications"), {
      userId: user.uid,
      title,
      body: message,
      createdAt: new Date().toISOString(),
    });
  }
}
