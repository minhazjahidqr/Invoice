
'use client';

// This is a mock authentication service.
// In a real application, you would replace this with a proper authentication provider.

const USER_STORAGE_KEY = 'auth_user';
const USERS_STORAGE_KEY = 'auth_users_list';

export type User = {
    id: string;
    name: string;
    email: string;
    password?: string; // Should be hashed in a real app
};

// Mock user database
export function getStoredUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (usersJson) {
        try {
            return JSON.parse(usersJson);
        } catch (e) {
            console.error("Failed to parse users from localStorage", e);
            // If parsing fails, fall back to default
        }
    }
    const defaultUsers: User[] = [
        { id: 'user-1', name: 'admin', email: 'admin', password: 'admin' },
    ];
    saveStoredUsers(defaultUsers);
    return defaultUsers;
}

function saveStoredUsers(users: User[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Initialize with a default user if none exist
if (typeof window !== 'undefined' && !localStorage.getItem(USERS_STORAGE_KEY)) {
    const defaultUsers: User[] = [
        { id: 'user-1', name: 'admin', email: 'admin', password: 'admin' },
    ];
    saveStoredUsers(defaultUsers);
}

export async function login(email: string, password?: string): Promise<User> {
    const users = getStoredUsers();
    // Allow login with either email or name
    const user = users.find(u => (u.email === email || u.name === email));
    
    // In a real app, you would have secure password verification.
    // Here we are just checking if it exists for mock purposes.
    if (user && user.password === password) {
        if (typeof window !== 'undefined') {
            const { password, ...userToStore } = user;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
        }
        const { password: _, ...userToReturn } = user;
        return Promise.resolve(userToReturn);
    }
    
    return Promise.reject(new Error('Invalid username or password'));
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_STORAGE_KEY);
    }
}

export function getCurrentUser(): {id: string, name: string, email: string} | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;
    try {
        const user = JSON.parse(userJson);
        return { id: user.id, name: user.name, email: user.email };
    } catch (error) {
        return null;
    }
}

export function updateUser(updatedUser: User): User[] {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);

    if (userIndex === -1) {
        throw new Error('User not found');
    }

    // Preserve password if not provided
    const existingUser = users[userIndex];
    const newPassword = updatedUser.password ? updatedUser.password : existingUser.password;

    const newUsers = [
        ...users.slice(0, userIndex),
        { ...updatedUser, password: newPassword },
        ...users.slice(userIndex + 1),
    ];
    
    saveStoredUsers(newUsers);

    // Also update current user session if it's the one being edited
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
         if (typeof window !== 'undefined') {
            const { password, ...userToStore } = updatedUser;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
        }
    }
    
    return newUsers;
}
