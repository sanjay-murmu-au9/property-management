import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Unit } from './Unit';
import { IProperty, PropertyType } from '../types/models';

@Entity('properties')
export class Property implements IProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.RESIDENTIAL
  })
  type: PropertyType;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalArea: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user: User) => user.properties)
  owner: User;

  @OneToMany(() => Unit, (unit: Unit) => unit.property)
  units: Unit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 