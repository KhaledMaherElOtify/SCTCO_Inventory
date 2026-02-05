// Supplier controller
// Handles supplier endpoints

import { validationResult } from 'express-validator';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/supplierService.js';

export async function listSuppliers(req, res) {
  try {
    const suppliers = await getAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error('List suppliers error:', error);
    res.status(500).json({ error: 'Failed to list suppliers' });
  }
}

export async function getSupplier(req, res) {
  try {
    const supplier = await getSupplierById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Failed to get supplier' });
  }
}

export async function createNewSupplier(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const supplier = await createSupplier(req.body, req.user.id);

    // Audit
    req.audit('CREATE', 'Supplier', supplier.id, null, { name: supplier.name });

    res.status(201).json(supplier);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Supplier name already exists' });
    }
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
}

export async function updateSupplierInfo(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const oldSupplier = await getSupplierById(req.params.id);
    if (!oldSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplier = await updateSupplier(req.params.id, req.body);

    // Audit
    req.audit('UPDATE', 'Supplier', req.params.id, oldSupplier, req.body);

    res.json(supplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
}

export async function deleteSupplierApi(req, res) {
  try {
    const supplier = await getSupplierById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Audit before delete
    req.audit('DELETE', 'Supplier', req.params.id, supplier, null);

    await deleteSupplier(req.params.id);
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
}
