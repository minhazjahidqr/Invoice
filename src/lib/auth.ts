
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
    return usersSnapshot.docs.map(doc => doc.data() as User);
}

export async function login(usernameOrEmail: string, passwordInput: string): Promise<User | null> {
    const users = await getStoredUsers();
    if (users.length === 0) {
        // If no users exist, seed the default user and try again
        await seedInitialUsers();
        const seededUsers = await getStoredUsers();
        return findAndAuthUser(usernameOrEmail, passwordInput, seededUsers);
    }
    return findAndAuthUser(usernameOrEmail, passwordInput, users);
}

function findAndAuthUser(usernameOrEmail: string, passwordInput: string, users: User[]): User | null {
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
    const q = query(usersCollection, where("id", "==", updatedUser.id));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
        throw new Error('User not found');
    }

    const userDocRef = userSnapshot.docs[0].ref;

    const updateData: Partial<User> = {};
    if (updatedUser.name) updateData.name = updatedUser.name;
    if (updatedUser.email) updateData.email = updatedUser.email;
    
    if (updatedUser.password && updatedUser.password.length > 0) {
        updateData.password = updatedUser.password;
        updateData.requiresPasswordChange = false;
    }

    await updateDoc(userDocRef, updateData);

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
         if (typeof window !== 'undefined') {
            const newCurrentUser = { ...currentUser, ...updateData };
            const { password, ...userToStore } = newCurrentUser;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
            window.dispatchEvent(new Event('storage'));
        }
    }
    
    return getStoredUsers();
}


export async function getPersistedUsers(): Promise<User[]> {
    return getStoredUsers();
}


async function seedInitialUsers() {
    const usersSnapshot = await getDocs(query(collection(db, "users")));
    if (usersSnapshot.empty) {
        console.log("No users found, seeding default user.");
        const defaultUser: Omit<User, 'id'> = { name: 'user', email: 'user@example.com', password: 'password', requiresPasswordChange: true };
        await addData('users', defaultUser);
    }
}

if (typeof window !== 'undefined') {
    seedInitialUsers().catch(console.error);
}
