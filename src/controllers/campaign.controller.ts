import { Request, Response } from 'express';
import { Campaign } from '../models/campaign';
import { AppDataSource } from '../config/database';
import { validate } from 'class-validator';
import { FileUpload } from '../models/FileUpload';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const s3BucketName = process.env.AWS_S3_BUCKET_NAME || '';

// Update the request type to include multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export class CampaignController {
    // 🔐 Generate a pre-signed URL to download file
    private static async generatePresignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
        const urlCommand = new GetObjectCommand({
          Bucket: s3BucketName,
          Key: fileKey
        });
        return await getSignedUrl(s3Client, urlCommand, { expiresIn });
      }

    static async createCampaign(req: MulterRequest, res: Response) {
        try {
            const campaignRepository = AppDataSource.getRepository(Campaign);
            const campaign = new Campaign();

            // Construct data
            const campaignData = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                country: req.body.country,
                city: req.body.city,
                education: req.body.education,
                employmentStatus: req.body.employmentStatus,
                skills: req.body.skills,
                experience: req.body.experience,
                agreeToTerms: req.body.agreeToTerms === 'true',
            };

            Object.assign(campaign, campaignData);

            // Validate
            const errors = await validate(campaign);
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.map(error => ({
                        property: error.property,
                        constraints: error.constraints
                    }))
                });
            }

            // Check for duplicate
            const existingUser = await campaignRepository.findOne({ where: { email: campaign.email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Save campaign first
            const savedCampaign = await campaignRepository.save(campaign);

            // Resume upload
            if (req.file && req.file.buffer) {
                const timestamp = Date.now();
                const fileName = `${timestamp}-${req.file.originalname}`;

                const command = new PutObjectCommand({
                    Bucket: s3BucketName,
                    Key: fileName,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype
                });
                const fileUrl = await CampaignController.generatePresignedUrl(fileName, 86400);
                await s3Client.send(command);

                const fileUploadRepository = AppDataSource.getRepository(FileUpload);
                const fileUpload = fileUploadRepository.create({
                    fileName: req.file.originalname,
                    fileKey: fileName,
                    mimeType: req.file.mimetype,
                    fileSize: req.file.size,
                    entityType: 'campaign',
                    entityId: savedCampaign.id
                });

                await fileUploadRepository.save(fileUpload);

                // Update campaign with resume
                savedCampaign.resume = fileUrl;
                await campaignRepository.save(savedCampaign);
            }

            return res.status(200).json({
                success: true,
                message: 'Campaign details saved successfully',
                campaignId: savedCampaign.id
            });

        } catch (error) {
            console.error('Error saving campaign details:', error.message, error.stack);
            return res.status(500).json({
                success: false,
                message: process.env.NODE_ENV === 'production'
                    ? 'Failed to save campaign details'
                    : error.message
            });
        }
    }


    static async updateCampaign(req: MulterRequest, res: Response) {
        try {
            const { id } = req.params;
            const campaignData = req.body;

            const campaignRepository = AppDataSource.getRepository(Campaign);
            const campaign = await campaignRepository.findOne({ where: { id } });

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: 'Campaign not found'
                });
            }

            // Handle file upload if present
            if (req.file) {
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

                // Save file information to database
                const fileUploadRepository = AppDataSource.getRepository(FileUpload);
                const fileUpload = fileUploadRepository.create({
                    fileName: req.file.originalname,
                    fileKey: fileName,
                    mimeType: req.file.mimetype,
                    fileSize: req.file.size,
                    entityType: 'campaign',
                    entityId: campaign.id
                });

                await fileUploadRepository.save(fileUpload);
                campaignData.resume = fileName;
            }

            Object.assign(campaign, campaignData);
            const updatedCampaign = await campaignRepository.save(campaign);

            return res.status(200).json({
                success: true,
                message: 'Campaign updated successfully',
                campaign: updatedCampaign
            });

        } catch (error) {
            console.error('Error updating campaign:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update campaign'
            });
        }
    }

    // New method to get a fresh pre-signed URL for admin access
    static async getFileAccessUrl(req: Request, res: Response) {
        try {
            const { campaignId } = req.params;

            const campaignRepository = AppDataSource.getRepository(Campaign);
            const campaign = await campaignRepository.findOne({ where: { id: campaignId } });

            if (!campaign || !campaign.resume) {
                return res.status(404).json({
                    success: false,
                    message: 'Campaign or resume not found'
                });
            }

            // Generate a new pre-signed URL with longer expiration for admin access
            const fileUrl = await this.generatePresignedUrl(campaign.resume, 86400); // 24 hours

            return res.status(200).json({
                success: true,
                fileUrl
            });

        } catch (error) {
            console.error('Error generating file access URL:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate file access URL'
            });
        }
    }
}
