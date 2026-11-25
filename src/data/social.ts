import { Facebook, Instagram, Youtube, Twitter, Linkedin, Github, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SocialLink {
  id: string;
  label: string;
  handle: string;
  url: string;
  icon: LucideIcon;
  /** The platform's own colour, not ours. */
  color: string;
}

/** One handle everywhere: @bansifyofficial */
export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'facebook', label: 'Facebook', handle: '@bansifyofficial', url: 'https://facebook.com/bansifyofficial', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', handle: '@bansifyofficial', url: 'https://instagram.com/bansifyofficial', icon: Instagram, color: '#E1306C' },
  { id: 'youtube', label: 'YouTube', handle: '@bansifyofficial', url: 'https://youtube.com/@bansifyofficial', icon: Youtube, color: '#FF0000' },
  { id: 'x', label: 'X', handle: '@bansifyofficial', url: 'https://x.com/bansifyofficial', icon: Twitter, color: '#0F1419' },
  { id: 'linkedin', label: 'LinkedIn', handle: '@bansifyofficial', url: 'https://linkedin.com/company/bansifyofficial', icon: Linkedin, color: '#0A66C2' },
  { id: 'telegram', label: 'Telegram', handle: '@bansifyofficial', url: 'https://t.me/bansifyofficial', icon: Send, color: '#229ED9' },
  { id: 'github', label: 'GitHub', handle: '@Bansify', url: 'https://github.com/Bansify', icon: Github, color: '#181717' },
];
