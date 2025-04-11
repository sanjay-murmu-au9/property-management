import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config();

const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

export const s3Client = new S3Client(s3Config);

export const s3BucketName = process.env.AWS_S3_BUCKET_NAME || ''; 