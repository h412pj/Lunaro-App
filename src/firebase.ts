/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocFromServer, getDocs, collection, query, where, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Transaction, Category } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Firestore Error definition for debugging
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check verification
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline.");
    }
  }
}

// User Profile persistence helper
export async function getUserProfile(userId: string) {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Save profile helper
export async function saveUserProfile(userId: string, displayName: string, familyCode: string) {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      id: userId,
      displayName,
      familyCode
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Listen to transactions of specific family in real time
export function subscribeTransactions(familyCode: string, onUpdate: (txs: Transaction[]) => void, onError: (err: any) => void) {
  const path = 'transactions';
  const q = query(
    collection(db, 'transactions'),
    where('familyCode', '==', familyCode)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        txs.push({
          id: data.id,
          amount: data.amount,
          description: data.description,
          category: data.category,
          type: data.type,
          date: data.date,
          createdAt: data.createdAt,
          familyCode: data.familyCode,
          createdByUser: data.createdByUser
        });
      });
      // Sort newest first
      txs.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(txs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

// Add transaction to Firestore
export async function deleteTransactionFromDb(id: string) {
  const path = `transactions/${id}`;
  try {
    await deleteDoc(doc(db, 'transactions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save transaction to Firestore
export async function addTransactionToDb(tx: Transaction) {
  const path = `transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
