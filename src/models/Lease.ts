import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Unit } from './Unit';
import { User } from './User';
import { ILease, LeaseStatus } from '../types/models';

@Entity('leases')
export class Lease implements ILease {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Unit, (unit: Unit) => unit.leases)
  unit: Unit;

  @ManyToOne(() => User)
  tenant: User;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyRent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  securityDeposit: number;

  @Column({
    type: 'enum',
    enum: LeaseStatus,
    default: LeaseStatus.PENDING
  })
  status: LeaseStatus;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'boolean', default: false })
  isRenewable: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 