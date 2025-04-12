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

export class CampaignController {
    async createCampaign(req: Request, res: Response) {
        try {
            const campaign = new Campaign();
            
            // Convert form-data to campaign object
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
                agreeToTerms: req.body.agreeToTerms === 'true' // Convert string to boolean
            };

            Object.assign(campaign, campaignData);

            // Validate the campaign object
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

            // Check if user already exists
            const campaignRepository = AppDataSource.getRepository(Campaign);
            const existingUser = await campaignRepository.findOne({ where: { email: campaign.email } });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
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

                // Get file URL
                const urlCommand = new GetObjectCommand({
                    Bucket: s3BucketName,
                    Key: fileName
                });

                const fileUrl = await getSignedUrl(s3Client, urlCommand, { expiresIn: 3600 });

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
                campaign.resume = fileUrl;
            }

            // Save campaign details
            const savedCampaign = await campaignRepository.save(campaign);

            return res.status(200).json({
                success: true,
                message: 'Campaign details saved successfully',
                campaignId: savedCampaign.id
            });

        } catch (error) {
            console.error('Error saving campaign details:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to save campaign details'
            });
        }
    }
}
