export interface UserProfile {
  name: string;
  department: string;
  statusText: string;
  avatarEmoji: string;
  workMode: 'Office' | 'Remote' | 'Hybrid';
}

export interface CheckInRecord {
  id: string;
  name: string; // Employee Name
  timestamp: string; // ISO String for Check-in
  timeFormatted: string; // e.g. "08:42 AM"
  dateFormatted: string; // e.g. "Jun 19, 2026"
  department: string;
  workMode: 'Office' | 'Remote' | 'Hybrid';
  note?: string;
  mood?: string;
  
  // Checkout state properties
  checkOutTime?: string; // e.g. "05:15 PM"
  checkOutTimestamp?: string; // ISO String
  totalWorkingHours?: number; // float representing hours
  
  // Device & network audit logs
  deviceInfo: string;
  ipAddress: string;
  ssid: string;
  gatewayIp: string;
}

export interface Coworker {
  id: string;
  name: string;
  department: string;
  avatarEmoji: string;
  statusText: string;
  isCheckedIn: boolean;
  timeFormatted?: string;
  workMode?: 'Office' | 'Remote' | 'Hybrid';
}
