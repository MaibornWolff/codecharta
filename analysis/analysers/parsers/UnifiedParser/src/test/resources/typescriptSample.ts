/**
 * This is a generated sample file for analysis only
 */

/**
 * An interface representing a user in the system
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  isActive: boolean;
}

/**
 * Data validation utility functions
 */
class Validator {
  /**
   * Validates an email address format
   * @param email The email to validate
   * @returns True if email is valid
   */
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates a password meets requirements
   * @param password The password to check
   * @returns True if the password meets requirements
   */
  public static isStrongPassword(password: string): boolean {
    // Password must be at least 8 characters
    if (password.length < 8) {
      return false;
    }

    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return false;
    }

    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return false;
    }

    // Password must contain at least one number
    if (!/[0-9]/.test(password)) {
      return false;
    }

    // Password must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return false;
    }

    return true;
  }
}

/**
 * User management service class
 */
class UserService {
  private users: User[] = [];
  private nextId = 1;

  /**
   * Creates a new user in the system
   */
  public createUser(name: string, email: string, role: 'admin' | 'user' | 'guest' = 'user'): User | null {
    // Validate inputs
    if (!name || name.trim().length === 0) {
      console.error('Name is required');
      return null;
    }

    if (!Validator.isValidEmail(email)) {
      console.error('Invalid email format');
      return null;
    }

    // Check if user with email already exists
    if (this.getUserByEmail(email)) {
      console.error('User with this email already exists');
      return null;
    }

    // Create new user
    const newUser: User = {
      id: this.nextId++,
      name: name.trim(),
      email: email.toLowerCase(),
      role,
      isActive: true
    };

    this.users.push(newUser);
    return newUser;
  }

  /**
   * Updates user information
   * @param id User ID
   * @param updates Updates to apply
   * @returns Updated user or null if not found
   */
  public updateUser(id: number, updates: Partial<Omit<User, 'id'>>): User | null {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }

    // Validate email if it's being updated
    if (updates.email && !Validator.isValidEmail(updates.email)) {
      console.error('Invalid email format');
      return null;
    }

    // Apply updates
    this.users[index] = {
      ...this.users[index],
      ...updates
    };

    return this.users[index];
  }

  /**
   * Find user by email (case insensitive)
   */
  public getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Method with high cyclomatic complexity for determining user access level
   * @param user The user to check
   * @param resource The resource being accessed
   * @returns Access level from 0 (no access) to 3 (full access)
   */
  public determineAccessLevel(user: User, resource: string): number {
    // No access for inactive users
    if (!user.isActive) {
      return 0;
    }

    // Admin has full access to everything
    if (user.role === 'admin') {
      return 3;
    }

    // Special resource handling
    if (resource.startsWith('personal-')) {
      // Personal resources are only accessible to the owner
      const resourceOwnerId = parseInt(resource.split('-')[1], 10);
      if (user.id === resourceOwnerId) {
        return 2;
      } else {
        return 0;
      }
    } else if (resource.startsWith('team-')) {
      // Team resources give different access based on role
      if (user.role === 'user') {
        return 2;
      } else if (user.role === 'guest') {
        return 1;
      }
    } else if (resource === 'public') {
      // Public resources are readable by everyone
      return 1;
    }

    // Default access level
    return user.role === 'guest' ? 0 : 1;
  }
}

// Usage example
const userService = new UserService();
const admin = userService.createUser('Admin User', 'admin@example.com', 'admin');
const regularUser = userService.createUser('Regular User', 'user@example.com', 'user');
const guest = userService.createUser('Guest User', 'guest@example.com', 'guest');

// Example access level checks
if (admin) {
  console.log(`Admin access level to team resource: ${userService.determineAccessLevel(admin, 'team-finance')}`);
}

if (regularUser) {
  console.log(`Regular user access level to personal resource: ${userService.determineAccessLevel(regularUser, `personal-${regularUser.id}`)}`);
}

if (guest) {
  console.log(`Guest access level to public resource: ${userService.determineAccessLevel(guest, 'public')}`);
}
