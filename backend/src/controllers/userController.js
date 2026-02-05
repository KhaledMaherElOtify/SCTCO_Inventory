// User management controller
// CRUD operations for users (Admin only)

import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import config from '../config/index.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  deleteUser,
} from '../services/userService.js';

export async function listUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
}

export async function getUser(req, res) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function createNewUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const { username, email, password, role, full_name } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcrypt_rounds);

    // Create user
    const user = await createUser(username, email, passwordHash, role, full_name);

    // Audit log
    req.audit('CREATE', 'User', user.id, null, {
      username: user.username,
      email: user.email,
      role: user.role,
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function updateUserInfo(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const userId = req.params.id;
    const oldUser = await getUserById(userId);

    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};
    if (req.body.email) updates.email = req.body.email;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.full_name) updates.full_name = req.body.full_name;

    const updatedUser = await updateUser(userId, updates);

    // Audit log
    req.audit('UPDATE', 'User', userId, oldUser, updates);

    res.json(updatedUser);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deactivateUserAccount(req, res) {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await deactivateUser(userId);

    // Audit log
    req.audit('DEACTIVATE', 'User', userId, { is_active: true }, { is_active: false });

    res.json(updatedUser);
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
}

export async function deleteUserAccount(req, res) {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Audit log before deletion
    req.audit('DELETE', 'User', userId, user, null);

    await deleteUser(userId);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}
