import React from 'react';

export enum ComplaintStatus {
  PENDING = 'Pending',
  SUBMITTED = 'Submitted',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  DUPLICATE = 'Duplicate',
}

export interface Complaint {
  id: string;
  category: string;
  description: string;
  location: string;
  contact: string;
  photoBeforeUrl?: string;
  photoAfterUrl?: string;
  status: ComplaintStatus;
  submittedAt: Date;
  resolvedAt?: Date;
  aiConfidence?: number;
  isDuplicateOf?: string;
  escalationDept?: string;
  aiPriority?: 'High' | 'Medium' | 'Low';
  aiJustification?: string;
  aiSummary?: string;
  aiRelevanceFlag?: 'Actionable' | 'Normal Complaint';
  aiActionRecommendation?: string;
  history: {
    status: ComplaintStatus;
    timestamp: Date;
    notes: string;
  }[];
}

export interface Stat {
  name: string;
  value: string;
  // Fix: React namespace error is resolved by importing React.
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface CategoryStat {
  name: string;
  time: number;
}

export interface AnalyticsStats {
  processedLast30Days: string;
  avgResolutionHours: string;
  citizenSatisfaction: string;
  duplicateReduction: string;
}

export interface DashboardStats {
    open: number;
    avgResolutionHours: string;
    slaBreaches: number;
}

// FIX: Add missing NotificationSettings interface for AdminDashboardPage
export interface NotificationSettings {
  newComplaint: boolean;
  statusChange: boolean;
  slaBreach: boolean;
}
