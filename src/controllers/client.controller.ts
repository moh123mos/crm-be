import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Client from '../models/client.model';

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    let query: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [{ name: searchRegex }, { phone: searchRegex }],
      };
    }

    const clients = await Client.find(query);
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
      return;
    }

    const { name, phone, email, notes } = req.body;
    const client = await Client.create({ name, phone, email, notes });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes } = req.body;

    const client = await Client.findByIdAndUpdate(
      id,
      { name, phone, email, notes },
      { new: true, runValidators: true }
    );

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};