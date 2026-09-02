import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = {
  apiKey: "BBLqeWXPLrp0t5oLa0diUDyfJhvz1qRIv9mEBFuj3KYLuHkC5J-nGraM0lRPJNEd_8gdDKk7ANL9wud9lmNVPJs",
  authDomain: "silab-5f612.firebaseapp.com",
  projectId: "silab-5f612",
  storageBucket: "silab-5f612.firebasestorage.app",
};

const app = initializeApp(config);
const db = getFirestore(app);

async function seed() {
  console.log("Iniciando envio de dados para o Firestore silab-5f612...");

  // Health check document
  await setDoc(doc(db, "_sistema_laser_sigeo", "health_check"), {
    status: "online",
    sistema: "SILAB - Sistema Integrado de Gestão dos Laboratórios",
    laboratorios: ["LASER (1B209)", "SIGEO (1B307)", "Sala dos Técnicos (1B308)"],
    conectadoEm: new Date().toISOString(),
    apresentacaoPronta: true
  });
  console.log("✓ Documento de status gravado!");

  // Informações dos Laboratórios
  await setDoc(doc(db, "laboratorios", "laser"), {
    id: "laser",
    name: "LASER - Laboratório de Sensoriamento Remoto",
    room: "Sala 1B209",
    capacity: 25,
    description: "Especializado em escaneamento 3D laser, GNSS RTK de alta precisão, estações totais e fotogrametria."
  });

  await setDoc(doc(db, "laboratorios", "sigeo"), {
    id: "sigeo",
    name: "SIGEO - Laboratório de SIG e Geoprocessamento",
    room: "Sala 1B307",
    capacity: 35,
    description: "Especializado em 24 Workstations RTX 4070 para processamento de nuvens de pontos, SIG e Plotter A0."
  });

  await setDoc(doc(db, "laboratorios", "tecnicos"), {
    id: "tecnicos",
    name: "Sala dos Técnicos de Laboratório",
    room: "Sala 1B308",
    capacity: 10,
    description: "Ponto focal de atendimento presencial, calibração, manutenção e entrega de equipamentos."
  });
  console.log("✓ Dados dos laboratórios cadastrados no Firestore!");

  console.log("Banco de dados do SILAB está 100% povoado e sincronizado no Firebase!");
}

seed().catch(err => console.error("Erro:", err));
