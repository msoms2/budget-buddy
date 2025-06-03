/**
 * Activity Types and Configuration
 * 
 * Defines all possible user activity types with their associated
 * styling, icons, and display configurations for the timeline.
 */

import {
    ClockIcon,
    CreditCardIcon,
    DollarSignIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    UserIcon,
    SettingsIcon,
    LogInIcon,
    EyeIcon,
    PlusIcon,
    EditIcon,
    TargetIcon,
    PieChartIcon,
    ShieldIcon,
    KeyIcon,
    CheckCircleIcon,
    XCircleIcon,
    AlertCircleIcon,
    FileTextIcon,
    UploadIcon,
    DownloadIcon
} from "lucide-react";

// Activity type constants
export const ACTIVITY_TYPES = {
    // Financial Activities
    EXPENSE: 'expense',
    INCOME: 'income',
    EARNING: 'earning',
    TRANSACTION: 'transaction',
    
    // Account Activities
    LOGIN: 'login',
    LOGOUT: 'logout',
    PROFILE_UPDATE: 'profile_update',
    ACCOUNT_CHANGE: 'account_change',
    PASSWORD_CHANGE: 'password_change',
    EMAIL_CHANGE: 'email_change',
    
    // Goal & Budget Activities
    GOAL_CREATED: 'goal_created',
    GOAL_UPDATED: 'goal_updated',
    GOAL_COMPLETED: 'goal_completed',
    GOAL_DELETED: 'goal_deleted',
    BUDGET_CREATED: 'budget_created',
    BUDGET_UPDATED: 'budget_updated',
    BUDGET_EXCEEDED: 'budget_exceeded',
    
    // Investment Activities
    INVESTMENT_CREATED: 'investment_created',
    INVESTMENT_UPDATED: 'investment_updated',
    INVESTMENT_SOLD: 'investment_sold',
    
    // System Activities
    VIEW: 'view',
    SYSTEM: 'system',
    NOTIFICATION: 'notification',
    EXPORT: 'export',
    IMPORT: 'import',
    
    // Security Activities
    SECURITY_UPDATE: 'security_update',
    ROLE_CHANGE: 'role_change',
    PERMISSION_CHANGE: 'permission_change',
    ACCOUNT_LOCKED: 'account_locked',
    ACCOUNT_UNLOCKED: 'account_unlocked'
};

// Activity configuration mapping
export const ACTIVITY_CONFIG = {
    [ACTIVITY_TYPES.EXPENSE]: {
        icon: TrendingDownIcon,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        category: 'financial'
    },
    [ACTIVITY_TYPES.INCOME]: {
        icon: TrendingUpIcon,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        category: 'financial'
    },
    [ACTIVITY_TYPES.EARNING]: {
        icon: TrendingUpIcon,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        category: 'financial'
    },
    [ACTIVITY_TYPES.TRANSACTION]: {
        icon: CreditCardIcon,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        category: 'financial'
    },
    [ACTIVITY_TYPES.LOGIN]: {
        icon: LogInIcon,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        category: 'authentication'
    },
    [ACTIVITY_TYPES.LOGOUT]: {
        icon: LogInIcon,
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        category: 'authentication'
    },
    [ACTIVITY_TYPES.PROFILE_UPDATE]: {
        icon: UserIcon,
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        category: 'account'
    },
    [ACTIVITY_TYPES.ACCOUNT_CHANGE]: {
        icon: SettingsIcon,
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        category: 'account'
    },
    [ACTIVITY_TYPES.PASSWORD_CHANGE]: {
        icon: KeyIcon,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        category: 'security'
    },
    [ACTIVITY_TYPES.EMAIL_CHANGE]: {
        icon: EditIcon,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        category: 'account'
    },
    [ACTIVITY_TYPES.GOAL_CREATED]: {
        icon: TargetIcon,
        color: 'bg-indigo-500',
        textColor: 'text-indigo-700',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        category: 'goal'
    },
    [ACTIVITY_TYPES.GOAL_UPDATED]: {
        icon: EditIcon,
        color: 'bg-indigo-500',
        textColor: 'text-indigo-700',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        category: 'goal'
    },
    [ACTIVITY_TYPES.GOAL_COMPLETED]: {
        icon: CheckCircleIcon,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        category: 'goal'
    },
    [ACTIVITY_TYPES.GOAL_DELETED]: {
        icon: XCircleIcon,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        category: 'goal'
    },
    [ACTIVITY_TYPES.BUDGET_CREATED]: {
        icon: PieChartIcon,
        color: 'bg-teal-500',
        textColor: 'text-teal-700',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        category: 'budget'
    },
    [ACTIVITY_TYPES.BUDGET_UPDATED]: {
        icon: EditIcon,
        color: 'bg-teal-500',
        textColor: 'text-teal-700',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        category: 'budget'
    },
    [ACTIVITY_TYPES.BUDGET_EXCEEDED]: {
        icon: AlertCircleIcon,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        category: 'budget'
    },
    [ACTIVITY_TYPES.INVESTMENT_CREATED]: {
        icon: TrendingUpIcon,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        category: 'investment'
    },
    [ACTIVITY_TYPES.INVESTMENT_UPDATED]: {
        icon: EditIcon,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        category: 'investment'
    },
    [ACTIVITY_TYPES.INVESTMENT_SOLD]: {
        icon: TrendingDownIcon,
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        category: 'investment'
    },
    [ACTIVITY_TYPES.VIEW]: {
        icon: EyeIcon,
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        category: 'system'
    },
    [ACTIVITY_TYPES.SYSTEM]: {
        icon: SettingsIcon,
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        category: 'system'
    },
    [ACTIVITY_TYPES.NOTIFICATION]: {
        icon: AlertCircleIcon,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        category: 'system'
    },
    [ACTIVITY_TYPES.EXPORT]: {
        icon: DownloadIcon,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        category: 'system'
    },
    [ACTIVITY_TYPES.IMPORT]: {
        icon: UploadIcon,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        category: 'system'
    },
    [ACTIVITY_TYPES.SECURITY_UPDATE]: {
        icon: ShieldIcon,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        category: 'security'
    },
    [ACTIVITY_TYPES.ROLE_CHANGE]: {
        icon: UserIcon,
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        category: 'security'
    },
    [ACTIVITY_TYPES.PERMISSION_CHANGE]: {
        icon: ShieldIcon,
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        category: 'security'
    },
    [ACTIVITY_TYPES.ACCOUNT_LOCKED]: {
        icon: XCircleIcon,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        category: 'security'
    },
    [ACTIVITY_TYPES.ACCOUNT_UNLOCKED]: {
        icon: CheckCircleIcon,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        category: 'security'
    }
};

// Helper function to get activity configuration
export const getActivityConfig = (type) => {
    return ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG[ACTIVITY_TYPES.SYSTEM];
};

// Helper function to get activity icon
export const getActivityIcon = (type) => {
    const config = getActivityConfig(type);
    return config.icon;
};

// Helper function to get activity styling
export const getActivityStyling = (type) => {
    return getActivityConfig(type);
};

// Activity categories for filtering/grouping
export const ACTIVITY_CATEGORIES = {
    FINANCIAL: 'financial',
    AUTHENTICATION: 'authentication',
    ACCOUNT: 'account',
    SECURITY: 'security',
    GOAL: 'goal',
    BUDGET: 'budget',
    INVESTMENT: 'investment',
    SYSTEM: 'system'
};

// Get activities by category
export const getActivitiesByCategory = (activities, category) => {
    return activities.filter(activity => {
        const config = getActivityConfig(activity.type);
        return config.category === category;
    });
};

// Format activity name for display
export const formatActivityName = (type) => {
    return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};