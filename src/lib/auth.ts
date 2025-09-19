
'use client';

// This is a mock authentication service.
// In a real application, you would replace this with a proper authentication provider.

const USER_STORAGE_KEY = 'auth_user';
const USERS_STORAGE_KEY = 'auth_users_list';

type User = {
    id: string;
    name: string;
    email: string;
    password?: string; // Should be hashed in a real app
};

// Mock user database
function getStoredUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
}

function saveStoredUsers(users: User[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Initialize with a default user if none exist
if (typeof window !== 'undefined' && !localStorage.getItem(USERS_STORAGE_KEY)) {
    const defaultUsers: User[] = [
        { id: 'user-1', name: 'John Doe', email: 'user@example.com', password: 'password123' },
    ];
    saveStoredUsers(defaultUsers);
}

export async function login(email: string, password?: string): Promise<User> {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);
    
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
    
    return Promise.reject(new Error('Invalid email or password'));
}

export async function signup(name: string, email: string, password?: string): Promise<User> {
    const users = getStoredUsers();
    if (users.some(u => u.email === email)) {
        return Promise.reject(new Error('User with this email already exists'));
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password
    };

    const usersToStore = [...users, newUser];
    saveStoredUsers(usersToStore);

    const { password: _, ...userToReturn } = newUser;
    return Promise.resolve(userToReturn);
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_STORAGE_KEY);
    }
}

export function getCurrentUser(): {name: string, email: string} | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;
    try {
        const user = JSON.parse(userJson);
        return { name: user.name, email: user.email };
    } catch (error) {
        return null;
    }
}
