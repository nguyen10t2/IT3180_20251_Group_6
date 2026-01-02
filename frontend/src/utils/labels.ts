import { 
  UserStatus, 
  FeeStatus, 
  FeedbackStatus, 
  FeedbackPriority,
  NotificationType,
  ResidentStatus,
  HouseRoleType,
  Gender,
} from '@/types';

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Hoạt động',
  [UserStatus.INACTIVE]: 'Không hoạt động',
  [UserStatus.SUSPENDED]: 'Bị đình chỉ',
  [UserStatus.PENDING]: 'Chờ duyệt',
};

export const FEE_STATUS_LABELS: Record<FeeStatus, string> = {
  [FeeStatus.PENDING]: 'Chờ thanh toán',
  [FeeStatus.PAID]: 'Đã thanh toán',
  [FeeStatus.OVERDUE]: 'Quá hạn',
  [FeeStatus.CANCELLED]: 'Đã hủy',
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  [FeedbackStatus.PENDING]: 'Chờ xử lý',
  [FeedbackStatus.IN_PROGRESS]: 'Đang xử lý',
  [FeedbackStatus.RESOLVED]: 'Đã giải quyết',
  [FeedbackStatus.REJECTED]: 'Từ chối',
};

export const FEEDBACK_PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  [FeedbackPriority.LOW]: 'Thấp',
  [FeedbackPriority.MEDIUM]: 'Trung bình',
  [FeedbackPriority.HIGH]: 'Cao',
  [FeedbackPriority.URGENT]: 'Khẩn cấp',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.GENERAL]: 'Chung',
  [NotificationType.EMERGENCY]: 'Khẩn cấp',
  [NotificationType.EVENT]: 'Sự kiện',
  [NotificationType.PAYMENT]: 'Thanh toán',
};

export const RESIDENT_STATUS_LABELS: Record<ResidentStatus, string> = {
  [ResidentStatus.THUONGTRU]: 'Thường trú',
  [ResidentStatus.TAMTRU]: 'Tạm trú',
  [ResidentStatus.TAMVANG]: 'Tạm vắng',
  [ResidentStatus.DACHUYENDI]: 'Đã chuyển đi',
};

export const HOUSE_ROLE_LABELS: Record<HouseRoleType, string> = {
  [HouseRoleType.OWNER]: 'Chủ hộ',
  [HouseRoleType.MEMBER]: 'Thành viên',
  [HouseRoleType.TENANT]: 'Người thuê',
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Nam',
  [Gender.FEMALE]: 'Nữ',
  [Gender.OTHER]: 'Khác',
};

export const FEEDBACK_TYPE_LABELS = {
  complaint: 'Khiếu nại',
  suggestion: 'Đề xuất',
  maintenance: 'Bảo trì',
  other: 'Khác',
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
  [UserStatus.INACTIVE]: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
  [UserStatus.SUSPENDED]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
  [UserStatus.PENDING]: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
};

export const FEE_STATUS_COLORS: Record<FeeStatus, string> = {
  [FeeStatus.PENDING]: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
  [FeeStatus.PAID]: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
  [FeeStatus.OVERDUE]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
  [FeeStatus.CANCELLED]: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
};

export const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, string> = {
  [FeedbackStatus.PENDING]: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
  [FeedbackStatus.IN_PROGRESS]: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
  [FeedbackStatus.RESOLVED]: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
  [FeedbackStatus.REJECTED]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
};

export const FEEDBACK_PRIORITY_COLORS: Record<FeedbackPriority, string> = {
  [FeedbackPriority.LOW]: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
  [FeedbackPriority.MEDIUM]: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
  [FeedbackPriority.HIGH]: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950',
  [FeedbackPriority.URGENT]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
};

export function getStatusLabel(status: string, type: 'user' | 'fee' | 'feedback' | 'invoice'): string {
  switch (type) {
    case 'user':
      return USER_STATUS_LABELS[status as UserStatus] || status;
    case 'fee':
    case 'invoice':
      return FEE_STATUS_LABELS[status as FeeStatus] || status;
    case 'feedback':
      return FEEDBACK_STATUS_LABELS[status as FeedbackStatus] || status;
    default:
      return status;
  }
}

export function getStatusColor(status: string, type: 'user' | 'fee' | 'feedback' | 'priority' | 'invoice'): string {
  switch (type) {
    case 'user':
      return USER_STATUS_COLORS[status as UserStatus] || '';
    case 'fee':
    case 'invoice':
      return FEE_STATUS_COLORS[status as FeeStatus] || '';
    case 'feedback':
      return FEEDBACK_STATUS_COLORS[status as FeedbackStatus] || '';
    case 'priority':
      return FEEDBACK_PRIORITY_COLORS[status as FeedbackPriority] || '';
    default:
      return '';
  }
}
