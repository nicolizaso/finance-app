import { db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Fetch the daily challenge for a specific date.
 * Path: desafios/{dateString}
 * @param {string} dateString - Format YYYY-MM-DD-JuegoX (e.g., 2026-01-16-Juego1)
 * @returns {Promise<Object|null>}
 */
export const getDailyChallenge = async (dateString) => {
  try {
    const docRef = doc(db, "desafios", dateString);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No daily challenge found for:", dateString);
      return null;
    }
  } catch (error) {
    console.error("Error getting daily challenge:", error);
    throw error;
  }
};

/**
 * Fetch a specific level configuration.
 * Path: niveles/{gameId}_{teamId}_{levelNum}
 * @param {string} gameId
 * @param {string} teamId
 * @param {number} levelNum
 * @returns {Promise<Object|null>}
 */
export const getLevel = async (gameId, teamId, levelNum) => {
  const levelId = `${gameId}_${teamId}_${levelNum}`;
  try {
    const docRef = doc(db, "niveles", levelId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No level found for:", levelId);
      return null;
    }
  } catch (error) {
    console.error("Error getting level:", error);
    throw error;
  }
};

/**
 * Save user progress.
 * Assuming a structure where progress is stored in a 'users' collection or similar.
 * Since the prompt didn't specify the user schema for progress, implementing a generic update.
 * @param {string} userId
 * @param {Object} progressData
 */
export const saveProgress = async (userId, progressData) => {
  try {
    const userRef = doc(db, "users", userId);
    // Use setDoc with merge: true to create if not exists, or updateDoc if strict
    await setDoc(userRef, {
      progress: progressData,
      lastUpdated: new Date()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving progress:", error);
    throw error;
  }
};
