import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AdminRequest } from '../middleware/adminAuth';

export class AdminUserController {
    private jwtSecret = process.env.JWT_SECRET || 'bondarys-dev-secret-key';

    /**
     * Admin login with database-backed authentication
     */
    async login(req: any, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find admin user by email
            const query = `
        SELECT au.*, ar.name as role_name, ar.permissions
        FROM admin_users au
        LEFT JOIN admin_roles ar ON au.role_id = ar.id
        WHERE au.email = $1 AND au.is_active = true
      `;
            const { rows } = await pool.query(query, [email.toLowerCase()]);
            const adminUser = rows[0];

            if (!adminUser) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Update last login
            await pool.query(`UPDATE admin_users SET last_login = NOW() WHERE id = $1`, [adminUser.id]);

            // Parse permissions from JSONB
            let permissions: string[] = [];
            try {
                permissions = typeof adminUser.permissions === 'string'
                    ? JSON.parse(adminUser.permissions)
                    : (adminUser.permissions || []);
            } catch {
                permissions = [];
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: adminUser.id,
                    email: adminUser.email,
                    firstName: adminUser.first_name,
                    lastName: adminUser.last_name,
                    role: adminUser.role_name,
                    permissions,
                    type: 'admin'
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: adminUser.id,
                    email: adminUser.email,
                    firstName: adminUser.first_name,
                    lastName: adminUser.last_name,
                    role: adminUser.role_name,
                    permissions
                }
            });
        } catch (error: any) {
            console.error('Admin login error:', error);
            res.status(500).json({ error: 'Login failed', details: error.message });
        }
    }

    /**
     * Get current admin user info
     */
    async getCurrentUser(req: AdminRequest, res: Response) {
        try {
            if (!req.admin) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            const query = `
        SELECT au.id, au.email, au.first_name, au.last_name, au.is_active, au.last_login,
               ar.name as role_name, ar.permissions
        FROM admin_users au
        LEFT JOIN admin_roles ar ON au.role_id = ar.id
        WHERE au.id = $1
      `;
            const { rows } = await pool.query(query, [req.admin.id]);
            const adminUser = rows[0];

            if (!adminUser) {
                return res.status(404).json({ error: 'Admin user not found' });
            }

            let permissions: string[] = [];
            try {
                permissions = typeof adminUser.permissions === 'string'
                    ? JSON.parse(adminUser.permissions)
                    : (adminUser.permissions || []);
            } catch {
                permissions = [];
            }

            res.json({
                user: {
                    id: adminUser.id,
                    email: adminUser.email,
                    firstName: adminUser.first_name,
                    lastName: adminUser.last_name,
                    role: adminUser.role_name,
                    permissions,
                    isActive: adminUser.is_active,
                    lastLogin: adminUser.last_login
                }
            });
        } catch (error: any) {
            console.error('Get current user error:', error);
            res.status(500).json({ error: 'Failed to get user info' });
        }
    }

    /**
     * Change admin password
     */
    async changePassword(req: AdminRequest, res: Response) {
        try {
            if (!req.admin) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current and new passwords are required' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'New password must be at least 8 characters' });
            }

            // Get current password hash
            const { rows } = await pool.query(`SELECT password_hash FROM admin_users WHERE id = $1`, [req.admin.id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
            if (!isValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const newHash = await bcrypt.hash(newPassword, 10);
            await pool.query(`UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, req.admin.id]);

            res.json({ success: true, message: 'Password changed successfully' });
        } catch (error: any) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    }

    /**
     * List all admin users (requires users:read permission)
     */
    async listUsers(req: AdminRequest, res: Response) {
        try {
            const query = `
        SELECT au.id, au.email, au.first_name, au.last_name, au.is_active, au.last_login, au.created_at,
               ar.name as role_name
        FROM admin_users au
        LEFT JOIN admin_roles ar ON au.role_id = ar.id
        ORDER BY au.created_at DESC
      `;
            const { rows } = await pool.query(query);

            res.json({ users: rows });
        } catch (error: any) {
            console.error('List users error:', error);
            res.status(500).json({ error: 'Failed to list users' });
        }
    }

    /**
     * Create new admin user (requires users:write permission)
     */
    async createUser(req: AdminRequest, res: Response) {
        try {
            const { email, password, firstName, lastName, roleId } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Check if email already exists
            const existing = await pool.query(`SELECT id FROM admin_users WHERE email = $1`, [email.toLowerCase()]);
            if (existing.rows.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Insert user
            const query = `
        INSERT INTO admin_users (email, password_hash, first_name, last_name, role_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, created_at
      `;
            const { rows } = await pool.query(query, [email.toLowerCase(), passwordHash, firstName, lastName, roleId]);

            res.status(201).json({ success: true, user: rows[0] });
        } catch (error: any) {
            console.error('Create user error:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }

    /**
     * Update admin user (requires users:write permission)
     */
    async updateUser(req: AdminRequest, res: Response) {
        try {
            const { id } = req.params;
            const { firstName, lastName, roleId, isActive } = req.body;

            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (firstName !== undefined) {
                updates.push(`first_name = $${paramIndex++}`);
                values.push(firstName);
            }
            if (lastName !== undefined) {
                updates.push(`last_name = $${paramIndex++}`);
                values.push(lastName);
            }
            if (roleId !== undefined) {
                updates.push(`role_id = $${paramIndex++}`);
                values.push(roleId);
            }
            if (isActive !== undefined) {
                updates.push(`is_active = $${paramIndex++}`);
                values.push(isActive);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            updates.push(`updated_at = NOW()`);
            values.push(id);

            const query = `UPDATE admin_users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
            const { rows } = await pool.query(query, values);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ success: true, user: rows[0] });
        } catch (error: any) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }

    /**
     * Delete admin user (soft delete, requires users:write permission)
     */
    async deleteUser(req: AdminRequest, res: Response) {
        try {
            const { id } = req.params;

            // Prevent self-deletion
            if (req.admin?.id === id) {
                return res.status(400).json({ error: 'Cannot delete your own account' });
            }

            await pool.query(`UPDATE admin_users SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);

            res.json({ success: true, message: 'User deactivated successfully' });
        } catch (error: any) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    /**
     * List all admin roles
     */
    async listRoles(req: AdminRequest, res: Response) {
        try {
            const { rows } = await pool.query(`SELECT * FROM admin_roles ORDER BY created_at`);
            res.json({ roles: rows });
        } catch (error: any) {
            console.error('List roles error:', error);
            res.status(500).json({ error: 'Failed to list roles' });
        }
    }
}

export const adminUserController = new AdminUserController();
