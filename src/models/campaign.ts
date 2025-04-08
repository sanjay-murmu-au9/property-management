import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsString, IsPhoneNumber, IsIn, Length, IsBoolean, IsOptional } from 'class-validator';

@Entity('campaigns')
export class Campaign {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsString()
    @Length(2, 50)
    firstName: string;

    @Column()
    @IsString()
    @Length(2, 50)
    lastName: string;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    @IsPhoneNumber('IN')
    phone: string;
    
    @Column()
    @IsString()
    @IsIn(['us', 'ca', 'uk', 'au', 'in', 'other'])
    country: string;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    city: string;
   
    @Column()
    @IsString()
    @IsIn(['high_school', 'associate', 'bachelor', 'master', 'doctorate', 'diploma', 'student', 'other'])
    education: string;

    @Column()
    @IsString()
    @IsIn(['unemployed', 'laid_off', 'underemployed', 'student', 'graduate', 'employed', 'other'])
    employmentStatus: string;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(0, 500)
    skills: string;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(0, 1000)
    experience: string;
    
    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    resume: string;

    @Column()
    @IsBoolean()
    agreeToTerms: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

