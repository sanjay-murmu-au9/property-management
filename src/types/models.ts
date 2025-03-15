export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  TENANT = 'tenant'
}

export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  MIXED_USE = 'mixed_use'
}

export enum UnitStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved'
}

export enum LeaseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  PENDING = 'pending'
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  properties?: IProperty[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProperty {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description?: string;
  totalArea?: number;
  isActive: boolean;
  owner: IUser;
  units?: IUnit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnit {
  id: string;
  unitNumber: string;
  area: number;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  status: UnitStatus;
  description?: string;
  amenities?: string[];
  property: IProperty;
  leases?: ILease[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILease {
  id: string;
  unit: IUnit;
  tenant: IUser;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status: LeaseStatus;
  terms?: string;
  isRenewable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 