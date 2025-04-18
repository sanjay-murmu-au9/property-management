import { Request, Response } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import { config } from 'dotenv';
import { AppDataSource } from '../config/database';
import { FileUpload } from '../models/FileUpload';

config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const s3BucketName = process.env.AWS_S3_BUCKET_NAME || '';

// Configure multer for file uploads
const storage = multer.memoryStorage();

// File size limit (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

// File type validation
const fileFilter = (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
  }
};

// Export multer middleware
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

// Update the request type to include multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export class FileUploadController {
  static upload = upload;

  /**
   * Upload a single file to S3
   */
  static async uploadFile(req: MulterRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${req.file.originalname}`;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: s3BucketName,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      });

      await s3Client.send(command);

      // Get file URL
      const urlCommand = new GetObjectCommand({
        Bucket: s3BucketName,
        Key: fileName
      });

      const fileUrl = await getSignedUrl(s3Client, urlCommand, { expiresIn: 3600 });

      // Save file information to database
      // const fileUploadRepository = AppDataSource.getRepository(FileUpload);
      // const fileUpload = fileUploadRepository.create({
      //   fileName: req.file.originalname,
      //   fileKey: fileName,
      //   mimeType: req.file.mimetype,
      //   fileSize: req.file.size,
      //   entityType: 'campaign',
      //   entityId: req.body.entityId
      // });

      // await fileUploadRepository.save(fileUpload);

      res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl,
        // fileUpload
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
  }

  /**
   * Get a presigned URL for a file
   */
  static async getFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        res.status(400).json({ message: 'File name is required' });
        return;
      }

      const command = new GetObjectCommand({
        Bucket: s3BucketName,
        Key: fileName
      });

      const fileUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      res.status(200).json({ fileUrl });
    } catch (error) {
      console.error('Error getting file:', error);
      res.status(500).json({ message: 'Error getting file', error: error.message });
    }
  }

  /**
   * Delete a file from S3 and from the database
   */
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        res.status(400).json({ message: 'File name is required' });
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: s3BucketName,
        Key: fileName
      });

      await s3Client.send(command);

      // Delete from database
      const fileUploadRepository = AppDataSource.getRepository(FileUpload);
      await fileUploadRepository.delete({ fileKey: fileName });

      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
  }

  /**
   * Get all files for a specific entity
   */
  static async getEntityFiles(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;

      if (!entityType || !entityId) {
        res.status(400).json({ message: 'Entity type and entity ID are required' });
        return;
      }

      // Get all files for this entity
      const fileRepository = AppDataSource.getRepository(FileUpload);
      const files = await fileRepository.find({
        where: {
          entityType,
          entityId
        }
      });

      // Generate presigned URLs for each file
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const url = await getSignedUrl(s3Client, new GetObjectCommand({
            Bucket: s3BucketName,
            Key: file.fileKey
          }), { expiresIn: 3600 });
          return {
            ...file,
            url
          };
        })
      );

      res.status(200).json(filesWithUrls);

    } catch (error) {
      console.error('Error retrieving entity files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: 'Failed to retrieve files', error: errorMessage });
    }
  }
}