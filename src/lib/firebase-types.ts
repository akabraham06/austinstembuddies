import { Timestamp } from 'firebase/firestore';

export interface EmailSignup {
  id?: string;
  email: string;
  createdAt: Date;
  subscribed: boolean;
}

export interface PartnerRequest {
  id?: string;
  schoolName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface OfficerApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  eid: string;
  yearInSchool: string;
  major: string;
  gpa: string;
  position: string;
  experience: string;
  whyJoin: string;
  ideas: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Member {
  id?: string;
  firstName: string;
  lastName: string;
  eid: string;
  totalPoints: number;
  meetingPoints: number;
  volunteerPoints: number;
  tablingPoints: number;
  socialPoints: number;
  fundraisingPoints: number;
  bonusPoints: number;
  status: 'active' | 'inactive';
  lastUpdated: Date;
}

export interface PointSubmission {
  id?: string;
  memberId: string;
  eventId: string;
  points: number;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface Officer {
  id?: string;
  name: string;
  position: string;
  bio: string;
  image: string;
  order: number;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: Date;
  image: string;
  location?: string;
  registrationLink?: string;
}

export interface HeroImage {
  id?: string;
  url: string;
  order: number;
  active: boolean;
}

export interface ApplicationSettings {
  membershipApplicationsOpen: boolean;
  partnerRequestsOpen: boolean;
  emailSignupEnabled: boolean;
  donationsEnabled: boolean;
}

export interface MemberApplication {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eid: string;
  major: string;
  grade: string;
  gpa: number;
  whyJoin: string;
  experience?: string;
  status: 'pending' | 'accepted' | 'archived' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  resumeStorageType?: 'chunked' | null;
  resumeChunks?: string[];
  resumeMetadata?: ResumeChunkMetadata | null;
}

export interface ResumeChunkMetadata {
  totalChunks: number;
  totalSize: number;
  createdAt: Date;
  fileName?: string;
  fileType?: string;
}

export interface ResumeChunk {
  data: string;
  index: number;
  createdAt: Date;
  applicationId: string;
  isChunk: boolean;
} 