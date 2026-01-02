// ==================== Enums ====================

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum ResidentStatus {
  THUONGTRU = 'thuongtru',
  TAMTRU = 'tamtru',
  TAMVANG = 'tamvang',
  DACHUYENDI = 'dachuyendi',
}

export enum RoomType {
  PENHOUSE = 'penhouse',
  STUDIO = 'studio',
  NORMAL = 'normal',
}

export enum FeeCategory {
  FIXED = 'fixed',
  VARIABLE = 'variable',
}

export enum FeeStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  GENERAL = 'general',
  EMERGENCY = 'emergency',
  EVENT = 'event',
  PAYMENT = 'payment',
}

export enum NotificationTarget {
  ALL = 'all',
  HOUSEHOLD = 'household',
  INDIVIDUAL = 'individual',
}

export enum FeedbackType {
  COMPLAINT = 'complaint',
  SUGGESTION = 'suggestion',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export enum FeedbackStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum HouseRoleType {
  OWNER = 'owner',
  MEMBER = 'member',
  TENANT = 'tenant',
}

export enum UserRole {
  MANAGER = 1,
  ACCOUNTANT = 2,
  RESIDENT = 3,
}

// ==================== Type Guards ====================

export const isUserStatus = (value: string): value is UserStatus => {
  return Object.values(UserStatus).includes(value as UserStatus);
};

export const isFeeStatus = (value: string): value is FeeStatus => {
  return Object.values(FeeStatus).includes(value as FeeStatus);
};

export const isFeedbackStatus = (value: string): value is FeedbackStatus => {
  return Object.values(FeedbackStatus).includes(value as FeedbackStatus);
};
