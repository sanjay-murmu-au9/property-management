import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IUser, UserRole, IProperty } from '../types/models';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;  

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TENANT
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'text' })
  refreshToken: string;

  @OneToMany('Property', 'owner')
  properties: IProperty[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 