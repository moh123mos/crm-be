import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Client, { IClient } from '../models/client.model';

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

export const exportClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await Client.find({});
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: clients.length,
      data: clients,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="clients-${new Date().toISOString().split('T')[0]}.json"`);
    res.status(200).json(exportData);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const importClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, mode } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid data format. Expected array of clients.',
      });
      return;
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const client of data) {
      if (!client.name || !client.phone) {
        skippedCount++;
        continue;
      }

      if (mode === 'replace') {
        await Client.deleteMany({});
        const newClients = await Client.insertMany(data);
        importedCount = newClients.length;
        break;
      } else {
        const existing = await Client.findOne({ phone: client.phone });
        if (!existing) {
          await Client.create(client);
          importedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${importedCount} clients, skipped ${skippedCount} duplicates.`,
      importedCount,
      skippedCount,
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

    const { name, phone, email, address, company_name, notes } = req.body;
    const client = await Client.create({ name, phone, email, address, company_name, notes });

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
    const { name, phone, email, address, company_name, notes } = req.body;

    const client = await Client.findByIdAndUpdate(
      id,
      { name, phone, email, address, company_name, notes },
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