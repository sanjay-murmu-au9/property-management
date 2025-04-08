import { Request, Response } from 'express';
import { Campaign } from '../models/campaign';
import { AppDataSource } from '../config/database';
import { validate } from 'class-validator';

export class CampaignController {
    async createCampaign(req: Request, res: Response) {
        try {
            const campaign = new Campaign();
            Object.assign(campaign, req.body);

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
