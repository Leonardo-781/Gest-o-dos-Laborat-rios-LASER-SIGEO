import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const config = {
  apiKey: "BBLqeWXPLrp0t5oLa0diUDyfJhvz1qRIv9mEBFuj3KYLuHkC5J-nGraM0lRPJNEd_8gdDKk7ANL9wud9lmNVPJs",
  authDomain: "silab-5f612.firebaseapp.com",
  projectId: "silab-5f612",
  storageBucket: "silab-5f612.firebasestorage.app",
};

const app = initializeApp(config);
const db = getFirestore(app);

try {
  await setDoc(doc(db, "_sistema_laser_sigeo", "health_check"), {
    status: "ok",
    date: new Date().toISOString()
  });
  console.log("SUCESSO: Conectado com sucesso ao Firestore!");
} catch (err) {
  console.error("ERRO:", err.message);
}
