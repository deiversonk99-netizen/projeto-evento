
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { AppEvent, Product, ExtraCost, Package } from './types';

/**
 * CONFIGURAÇÃO REAL DO FIREBASE
 * Conectado ao projeto: projeto-evento-b3656
 */
const firebaseConfig = {
  apiKey: "AIzaSyDjnNA7AcPVxjan8OLDyNUPoDyNCHjMxiY",
  authDomain: "projeto-evento-b3656.firebaseapp.com",
  projectId: "projeto-evento-b3656",
  storageBucket: "projeto-evento-b3656.firebasestorage.app",
  messagingSenderId: "161765457916",
  appId: "1:161765457916:web:cfa7f6eca98e0174f3bc79",
  measurementId: "G-H6DSRCQ9YC"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = {
  EVENTS: 'events',
  PRODUCTS: 'products',
  EXTRAS: 'extras',
  PACKAGES: 'packages'
};

export const FirebaseService = {
  getEvents: async (): Promise<AppEvent[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.EVENTS), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AppEvent));
    } catch (error) {
      console.error("Erro ao buscar eventos no Firestore:", error);
      return [];
    }
  },

  saveEvent: async (event: AppEvent): Promise<void> => {
    try {
      await setDoc(doc(db, COLLECTIONS.EVENTS, event.id), event, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar evento no Firestore:", error);
      throw error;
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.EVENTS, id));
    } catch (error) {
      console.error("Erro ao deletar evento no Firestore:", error);
      throw error;
    }
  },

  getProducts: async (): Promise<Product[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      const products = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      // Se o banco estiver vazio, retorna os padrões para o primeiro uso
      return products.length > 0 ? products : [
        { id: '1', name: 'Coxinha de Frango', unitCost: 2.50, factor: 0.85 },
        { id: '2', name: 'Bebida (Refrigerante/Água)', unitCost: 4.00, factor: 1.2 },
        { id: '3', name: 'Mini Hambúrguer', unitCost: 5.50, factor: 0.7 }
      ];
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  },

  saveProduct: async (product: Product): Promise<void> => {
    try {
      await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  },

  getExtras: async (): Promise<ExtraCost[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.EXTRAS));
      const extras = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ExtraCost));
      return extras.length > 0 ? extras : [
        { id: 'e1', name: 'Banda ao Vivo', cost: 1200 },
        { id: 'e2', name: 'Segurança', cost: 250 }
      ];
    } catch (error) {
      console.error("Erro ao buscar custos extras:", error);
      return [];
    }
  },

  saveExtra: async (extra: ExtraCost): Promise<void> => {
    try {
      await setDoc(doc(db, COLLECTIONS.EXTRAS, extra.id), extra, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar custo extra:", error);
    }
  },

  getPackages: async (): Promise<Package[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.PACKAGES));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Package));
    } catch (error) {
      console.error("Erro ao buscar pacotes:", error);
      return [];
    }
  },

  savePackage: async (pkg: Package): Promise<void> => {
    try {
      await setDoc(doc(db, COLLECTIONS.PACKAGES, pkg.id), pkg, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar pacote:", error);
    }
  }
};
