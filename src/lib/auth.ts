
'use client';

import { addData } from './data';
import { db } from './firebase';
import { getDocs, query, collection, where, updateDoc, doc } from 'firebase/firestore';

const USER_STORAGE_KEY = 'auth_user';

export type User = {
    id: string;
    name: string;
    email: string;
    password?: string; 
    requiresPasswordChange?: boolean;
};

async function getStoredUsers(): Promise<User[]> {
    const usersSnapshot = await getDocs(query(collection(db, "users")));
    if (usersSnapshot.empty) {
        // This will run only if there are absolutely no users.
        const defaultUser: Omit<User, 'id'> = { name: 'user', email: 'user@example.com', password: 'password', requiresPasswordChange: true };
        const newUser = await addData('users', defaultUser);
        return [newUser];
    }
    return usersSnapshot.docs.map(doc => doc.data() as User);
}

export async function login(usernameOrEmail: string, passwordInput: string): Promise<User | null> {
    const users = await getStoredUsers();
    const normalizedInput = usernameOrEmail.toLowerCase();
    const user = users.find(
      (u) => (u.name.toLowerCase() === normalizedInput || u.email.toLowerCase() === normalizedInput)
    );
  
    if (user && user.password === passwordInput) {
      if (typeof window !== 'undefined') {
        const { password, ...userToStore } = user;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
        window.dispatchEvent(new Event('storage'));
      }
      return user;
    }
    return null;
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_STORAGE_KEY);
        window.dispatchEvent(new Event('storage'));
    }
}

export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch (error) {
        return null;
    }
}

export async function updateUser(updatedUser: Partial<User> & { id: string }): Promise<User[]> {
    const usersCollection = collection(db, 'users');
    // Firestore's native document ID is not the same as our user 'id' field. We need to query for the document.
    const q = query(usersCollection, where("id", "==", updatedUser.id));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
        throw new Error('User not found');
    }

    const userDocRef = userSnapshot.docs[0].ref;

    // Build the data object for update, ensuring we don't save an empty password.
    const updateData: Partial<User> = {
        name: updatedUser.name,
        email: updatedUser.email,
    };
    
    if (updatedUser.password && updatedUser.password.length > 0) {
        updateData.password = updatedUser.password;
        // When an admin sets a password, we assume it no longer requires a change.
        updateData.requiresPasswordChange = false;
    }

    await updateDoc(userDocRef, updateData);

    // If the currently logged-in user is the one being updated, refresh their localStorage data.
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
         if (typeof window !== 'undefined') {
            const newCurrentUser = { ...currentUser, ...updateData };
            const { password, ...userToStore } = newCurrentUser;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
            window.dispatchEvent(new Event('storage')); // Notify layout to re-render
        }
    }
    
    return getStoredUsers(); // Return the updated list of all users
}


export async function getPersistedUsers(): Promise<User[]> {
    return getStoredUsers();
}


// Seed initial user if the user collection is empty.
// This is helpful for the first run of the application.
async function seedInitialUsers() {
    const usersSnapshot = await getDocs(query(collection(db, "users")));
    if (usersSnapshot.empty) {
        console.log("No users found, seeding default user.");
        const defaultUser: Omit<User, 'id'> = { name: 'user', email: 'user@example.com', password: 'password', requiresPasswordChange: true };
        await addData('users', defaultUser);
    }
}

// Ensure this only runs on the client-side
if (typeof window !== 'undefined') {
    seedInitialUsers();
}
