import { User, LoginCredentials, LoginResponse, Permission } from '@/types/auth';
import { testAccounts, rolePermissions } from '@/constants/auth';

/**
 * Mock Authentication Service
 * 
 * This service provides authentication logic for the GMAO BMT application.
 * Currently uses mock data for testing. Can be easily replaced with real API calls:
 * 
 * TODO: Replace mock implementation with real JWT API
 * - Change fetch to call actual backend endpoint (e.g., /api/auth/login)
 * - Extract token from response and store in secure httpOnly cookie
 * - Call real API to get user data with token
 * - Implement token refresh logic
 * - Add logout API call to invalidate token
 */

const AUTH_STORAGE_KEY = 'gmao_auth_token';
const USER_STORAGE_KEY = 'gmao_user';

export class AuthService {
  /**
   * Login with email and password
   * 
   * MOCK: Validates against test accounts
   * PROD: Will call /api/auth/login and handle JWT token
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock validation
    const testAccount = testAccounts.find(
      account => account.email === credentials.email && account.password === credentials.password
    );

    if (!testAccount) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Create user object with permissions based on role
    const user: User = {
      id: testAccount.id,
      email: testAccount.email,
      fullName: testAccount.fullName,
      role: testAccount.role,
      permissions: rolePermissions[testAccount.role] || [],
      createdAt: new Date(),
    };

    // Mock token (in production, this would come from the server)
    const token = `mock_token_${user.id}_${Date.now()}`;

    // Store in localStorage (in production, use httpOnly cookies)
    this.setAuthData(user, token);

    return { user, token };
  }

  /**
   * Logout
   * 
   * MOCK: Clears local storage
   * PROD: Will call /api/auth/logout to invalidate token
   */
  static async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.clearAuthData();
  }

  /**
   * Get current user from storage
   */
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('[v0] Failed to parse user from storage:', error);
      return null;
    }
  }

  /**
   * Get auth token from storage
   */
  static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_STORAGE_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getCurrentUser();
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Store auth data in localStorage
   */
  private static setAuthData(user: User, token: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(AUTH_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Clear auth data from localStorage
   */
  private static clearAuthData(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  /**
   * Initialize auth on app startup
   * 
   * MOCK: Checks localStorage
   * PROD: Could validate token with backend and refresh if needed
   */
  static async initializeAuth(): Promise<User | null> {
    const user = this.getCurrentUser();
    const token = this.getAuthToken();

    if (!user || !token) {
      return null;
    }

    // TODO: In production, validate token with backend here
    // If token is expired, call refresh endpoint
    // If invalid, clear auth data

    return user;
  }
}
