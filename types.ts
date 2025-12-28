export enum Sender {
  Bot = 'bot',
  User = 'user'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  type: 'text' | 'code';
  codeContent?: string;
  timestamp: number;
}

export type Language = 'en' | 'tr';

export interface WebsiteConfig {
  language?: Language;
  name?: string;
  category?: string;
  colorPalette?: string;
  emotionalVibe?: string;
}

export enum BuilderStep {
  Language = 'LANGUAGE',
  ProjectName = 'PROJECT_NAME',
  Category = 'CATEGORY',
  ArtDirection = 'ART_DIRECTION',
  Generating = 'GENERATING',
  Completed = 'COMPLETED'
}

export interface DesignManifesto {
  vision: string;
  htmlCode: string;
}

export enum TemplateType {
  Creative = 'CREATIVE',
  Minimalist = 'MINIMALIST',
  Cyberpunk = 'CYBERPUNK'
}