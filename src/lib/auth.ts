
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
    requiresPasswordChange?: boolean;
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
        { id: 'user-1', name: 'user', email: 'user@example.com', password: 'password', requiresPasswordChange: true },
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
    getStoredUsers();
}

export async function login(usernameOrEmail: string, passwordInput: string): Promise<User | null> {
    const users = getStoredUsers();
    const normalizedInput = usernameOrEmail.toLowerCase();
    const user = users.find(
      (u) => u.name.toLowerCase() === normalizedInput || u.email.toLowerCase() === normalizedInput
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
        const user = JSON.parse(userJson);
        // We need the full user object from the main list to check for password change requirements
        const allUsers = getStoredUsers();
        return allUsers.find(u => u.id === user.id) || null;
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

    const existingUser = users[userIndex];
    
    const newPassword = updatedUser.password && updatedUser.password.length > 0
        ? updatedUser.password
        : existingUser.password;

    const requiresPasswordChange = updatedUser.password && updatedUser.password.length > 0 && updatedUser.password !== existingUser.password
        ? false
        : existingUser.requiresPasswordChange;

    const userWithUpdatedPassword = { ...updatedUser, password: newPassword, requiresPasswordChange };

    const newUsers = [
        ...users.slice(0, userIndex),
        userWithUpdatedPassword,
        ...users.slice(userIndex + 1),
    ];
    
    saveStoredUsers(newUsers);

    // Also update current user session if it's the one being edited
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
         if (typeof window !== 'undefined') {
            const { password, ...userToStore } = userWithUpdatedPassword;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
            window.dispatchEvent(new Event('storage'));
        }
    }
    
    return newUsers;
}
