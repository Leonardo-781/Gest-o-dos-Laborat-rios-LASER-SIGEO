import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc,
  Unsubscribe 
} from 'firebase/firestore';
import { 
  FirebaseConfig, 
  FixedClass, 
  Reservation, 
  MaintenanceRequest, 
  SoftwareRequest, 
  Equipment, 
  UserAccount, 
  AuditLog 
} from '../types';

const STORAGE_FIREBASE_KEY = 'laser_sigeo_firebase_config_v2';

export function getSavedFirebaseConfig(): FirebaseConfig {
  const saved = localStorage.getItem(STORAGE_FIREBASE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  // Permite ler do import.meta.env se configurado ou usa as credenciais ativas do projeto
  const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'BBLqeWXPLrp0t5oLa0diUDyfJhvz1qRIv9mEBFuj3KYLuHkC5J-nGraM0lRPJNEd_8gdDKk7ANL9wud9lmNVPJs';
  const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'silab-5f612';
  const envAuthDomain = (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`;

  return {
    apiKey: envApiKey,
    authDomain: envAuthDomain,
    projectId: envProjectId,
    storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
    isConnected: true,
    autoSync: true
  };
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(STORAGE_FIREBASE_KEY, JSON.stringify(config));
}

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(config?: FirebaseConfig): FirebaseApp | null {
  const activeConfig = config || getSavedFirebaseConfig();

  if (!activeConfig.apiKey || !activeConfig.projectId) {
    return null;
  }

  try {
    if (getApps().length > 0) {
      firebaseAppInstance = getApp();
    } else {
      firebaseAppInstance = initializeApp({
        apiKey: activeConfig.apiKey,
        authDomain: activeConfig.authDomain || `${activeConfig.projectId}.firebaseapp.com`,
        projectId: activeConfig.projectId,
        storageBucket: activeConfig.storageBucket || `${activeConfig.projectId}.appspot.com`,
        messagingSenderId: activeConfig.messagingSenderId,
        appId: activeConfig.appId
      });
    }
    return firebaseAppInstance;
  } catch (err) {
    console.error('Erro ao inicializar Firebase:', err);
    return null;
  }
}

export function getFirestoreDB(config?: FirebaseConfig): Firestore | null {
  const app = getFirebaseApp(config);
  if (!app) return null;

  try {
    if (!firestoreInstance) {
      firestoreInstance = getFirestore(app);
    }
    return firestoreInstance;
  } catch (err) {
    console.error('Erro ao conectar ao Firestore:', err);
    return null;
  }
}

/**
 * Testa a conexão com o Firestore gravando e lendo um documento de ping
 */
export async function testFirebaseConnection(config: FirebaseConfig): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey || !config.projectId) {
    return {
      success: false,
      message: 'Informe pelo menos a API Key e o Project ID do Firebase.'
    };
  }

  try {
    const db = getFirestoreDB(config);
    if (!db) {
      return { success: false, message: 'Não foi possível inicializar o Firestore SDK.' };
    }

    // Grava um ping de teste no Firestore
    const testRef = doc(db, '_sistema_laser_sigeo', 'health_check');
    await setDoc(testRef, {
      status: 'conectado',
      lab: 'LASER & SIGEO - Agrimensura',
      testedAt: new Date().toISOString(),
      testedBy: 'Apresentação Oficial'
    });

    return {
      success: true,
      message: `Conexão com Firestore do projeto "${config.projectId}" realizada com sucesso!`
    };
  } catch (err: any) {
    console.error('Erro no teste Firebase:', err);
    return {
      success: false,
      message: `Falha na conexão com Firebase: ${err.message || err}`
    };
  }
}

/**
 * Remove recursivamente campos com valor undefined para o Firestore aceitar
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

/**
 * Envia um documento individual para o Firestore
 */
export async function syncDocToFirestore<T extends { id: string }>(
  collectionName: string, 
  item: T, 
  config?: FirebaseConfig
): Promise<boolean> {
  const db = getFirestoreDB(config);
  if (!db) return false;

  try {
    const docRef = doc(db, collectionName, item.id);
    const cleanItem = sanitizeForFirestore(item);
    await setDoc(docRef, cleanItem, { merge: true });
    return true;
  } catch (err) {
    console.error(`Erro ao sincronizar documento em ${collectionName}:`, err);
    return false;
  }
}

/**
 * Remove um documento do Firestore
 */
export async function removeDocFromFirestore(
  collectionName: string,
  docId: string,
  config?: FirebaseConfig
): Promise<boolean> {
  const db = getFirestoreDB(config);
  if (!db) return false;

  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`Erro ao excluir documento de ${collectionName}:`, err);
    return false;
  }
}

/**
 * Escuta atualizações em tempo real de uma coleção do Firestore
 */
export function subscribeToFirestoreCollection<T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  config?: FirebaseConfig
): Unsubscribe | null {
  const db = getFirestoreDB(config);
  if (!db) return null;

  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as T);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn(`Aviso ao ouvir coleção ${collectionName} no Firestore:`, error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`Erro ao assinar coleção ${collectionName}:`, err);
    return null;
  }
}

/**
 * Sobe todos os dados locais iniciais de uma só vez para o Firebase para preparar a apresentação
 */
export async function seedAllDataToFirebase(
  data: {
    fixedClasses: FixedClass[];
    reservations: Reservation[];
    maintenanceRequests: MaintenanceRequest[];
    softwareRequests: SoftwareRequest[];
    equipments: Equipment[];
    usersList: UserAccount[];
    auditLogs: AuditLog[];
  },
  config?: FirebaseConfig
): Promise<{ success: boolean; count: number; message: string }> {
  const db = getFirestoreDB(config);
  if (!db) {
    return { success: false, count: 0, message: 'Firebase não está conectado.' };
  }

  try {
    let count = 0;

    // 1. Classes
    for (const fc of data.fixedClasses) {
      await setDoc(doc(db, 'disciplinas', fc.id), sanitizeForFirestore(fc), { merge: true });
      count++;
    }

    // 2. Reservas
    for (const r of data.reservations) {
      await setDoc(doc(db, 'reservas', r.id), sanitizeForFirestore(r), { merge: true });
      count++;
    }

    // 3. Manutenção
    for (const m of data.maintenanceRequests) {
      await setDoc(doc(db, 'manutencoes', m.id), sanitizeForFirestore(m), { merge: true });
      count++;
    }

    // 4. Softwares
    for (const s of data.softwareRequests) {
      await setDoc(doc(db, 'softwares', s.id), sanitizeForFirestore(s), { merge: true });
      count++;
    }

    // 5. Equipamentos
    for (const e of data.equipments) {
      await setDoc(doc(db, 'equipamentos', e.id), sanitizeForFirestore(e), { merge: true });
      count++;
    }

    // 6. Usuários
    for (const u of data.usersList) {
      await setDoc(doc(db, 'usuarios', u.id), sanitizeForFirestore(u), { merge: true });
      count++;
    }

    // 7. Auditoria
    for (const a of data.auditLogs) {
      await setDoc(doc(db, 'auditoria', a.id), sanitizeForFirestore(a), { merge: true });
      count++;
    }

    return {
      success: true,
      count,
      message: `${count} registros sincronizados com sucesso no Firestore!`
    };
  } catch (err: any) {
    console.error('Erro ao popular dados no Firebase:', err);
    return {
      success: false,
      count: 0,
      message: `Erro ao enviar dados para o Firebase: ${err.message || err}`
    };
  }
}
