export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'BlueMoon',
  version: '2.0.0',
  description: 'Hệ thống quản lý chung cư BlueMoon',
};

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',

  // Manager routes
  MANAGER: {
    DASHBOARD: '/manager',
    USERS: '/manager/users',
    RESIDENTS: '/manager/residents',
    HOUSES: '/manager/houses',
    INVOICES: '/manager/invoices',
    FEEDBACKS: '/manager/feedbacks',
    NOTIFICATIONS: '/manager/notifications',
    PROFILE: '/manager/profile',
  },

  // Accountant routes
  ACCOUNTANT: {
    DASHBOARD: '/accountant',
    INVOICES: '/accountant/invoices',
    NOTIFICATIONS: '/accountant/notifications',
    REPORTS: '/accountant/reports',
    PROFILE: '/accountant/profile',
  },

  // Resident routes
  RESIDENT: {
    DASHBOARD: '/resident',
    PROFILE: '/resident/profile',
    INVOICES: '/resident/invoices',
    FEEDBACKS: '/resident/feedbacks',
    NOTIFICATIONS: '/resident/notifications',
    HOUSEHOLD: '/resident/household',
  },
};

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  pageSizeOptions: [10, 20, 50, 100],
};

export const DATE_FORMAT = {
  display: 'dd/MM/yyyy',
  displayWithTime: 'dd/MM/yyyy HH:mm',
  api: 'yyyy-MM-dd',
  apiWithTime: "yyyy-MM-dd'T'HH:mm:ss",
};

export const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  user: 'user',
  theme: 'theme',
};

export const QUERY_KEYS = {
  // Auth
  me: 'me',
  
  // Users
  users: 'users',
  user: 'user',
  pendingUsers: 'pending-users',

  // Residents
  residents: 'residents',
  resident: 'resident',
  currentResident: 'current-resident',

  // Houses
  houses: 'houses',
  house: 'house',

  // Invoices
  invoices: 'invoices',
  invoice: 'invoice',
  residentInvoices: 'resident-invoices',

  // Feedbacks
  feedbacks: 'feedbacks',
  feedback: 'feedback',
  residentFeedbacks: 'resident-feedbacks',

  // Notifications
  notifications: 'notifications',
  notification: 'notification',
  residentNotifications: 'resident-notifications',

  // Household
  residentHousehold: 'resident-household',

  // Dashboard
  stats: 'dashboard-stats',
};

export const ANIMATION_CONFIG = {
  duration: 300,
  easing: 'easeOutCubic',
};
