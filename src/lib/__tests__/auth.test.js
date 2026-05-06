/**
 * Authentication Tests
 */

import { authenticateUser, createToken, verifyToken, hasPermission } from '../auth';

describe('Authentication System', () => {
  describe('authenticateUser', () => {
    it('should authenticate valid admin credentials', async () => {
      const user = await authenticateUser('admin', 'Vimanasa@2026');
      
      expect(user).toBeTruthy();
      expect(user.username).toBe('admin');
      expect(user.role).toBe('super_admin');
      expect(user.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject invalid credentials', async () => {
      const user = await authenticateUser('admin', 'wrongpassword');
      
      expect(user).toBeNull();
    });

    it('should reject non-existent user', async () => {
      const user = await authenticateUser('nonexistent', 'password');
      
      expect(user).toBeNull();
    });
  });

  describe('JWT Token', () => {
    it('should create valid JWT token', async () => {
      const user = {
        id: '1',
        username: 'admin',
        role: 'super_admin',
        permissions: ['*'],
      };

      const token = await createToken(user);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should verify valid token', async () => {
      const user = {
        id: '1',
        username: 'admin',
        role: 'super_admin',
        permissions: ['*'],
      };

      const token = await createToken(user);
      const payload = await verifyToken(token);
      
      expect(payload).toBeTruthy();
      expect(payload.username).toBe('admin');
      expect(payload.role).toBe('super_admin');
    });

    it('should reject invalid token', async () => {
      // Mock jwtVerify to throw error for invalid token
      const { jwtVerify } = require('jose');
      jwtVerify.mockRejectedValueOnce(new Error('Invalid token'));
      
      const payload = await verifyToken('invalid.token.here');
      
      expect(payload).toBeNull();
    });
  });

  describe('Permissions', () => {
    it('should grant all permissions to super admin', () => {
      const user = {
        permissions: ['*'],
      };

      expect(hasPermission(user, 'workforce:read')).toBe(true);
      expect(hasPermission(user, 'finance:write')).toBe(true);
      expect(hasPermission(user, 'anything:anything')).toBe(true);
    });

    it('should grant specific permissions', () => {
      const user = {
        permissions: ['workforce:read', 'workforce:write'],
      };

      expect(hasPermission(user, 'workforce:read')).toBe(true);
      expect(hasPermission(user, 'workforce:write')).toBe(true);
      expect(hasPermission(user, 'finance:read')).toBe(false);
    });

    it('should grant wildcard permissions', () => {
      const user = {
        permissions: ['workforce:*'],
      };

      expect(hasPermission(user, 'workforce:read')).toBe(true);
      expect(hasPermission(user, 'workforce:write')).toBe(true);
      expect(hasPermission(user, 'workforce:delete')).toBe(true);
      expect(hasPermission(user, 'finance:read')).toBe(false);
    });

    it('should deny permissions for user without permissions', () => {
      const user = {
        permissions: [],
      };

      expect(hasPermission(user, 'workforce:read')).toBe(false);
    });
  });
});
