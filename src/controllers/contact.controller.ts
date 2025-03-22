import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Contact } from '../models/Contact';
import validator from 'validator';

export class ContactController {
  
  async submitContact(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, comments } = req.body;

      // Early validation checks
      if (!name || !email || !comments) {
        res.status(400).json({
          success: false,
          message: 'Name, email, and comments are required'
        });
        return;
      }

      if (!validator.isEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      // Check if email already exists and create new contact in a single transaction
      await AppDataSource.transaction(async transactionalEntityManager => {
        const existingContact = await transactionalEntityManager.findOne(Contact, {
          where: { email },
          select: ['id'] // Only fetch the id field for better performance
        });

        if (existingContact) {
          res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
          return;
        }

        // Create and save contact
        const newContact = transactionalEntityManager.create(Contact, {
          name: validator.escape(name.trim()),
          email: email.toLowerCase().trim(),
          comments: validator.escape(comments.trim())
        });

        const savedContact = await transactionalEntityManager.save(newContact);

        res.status(201).json({
          success: true,
          message: 'Contact form submitted successfully',
          data: savedContact
        });
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit contact form'
      });
    }
  }
}