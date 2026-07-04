export type EventCategory = 'Meetup' | 'Conference/Summit' | 'Talk/Panel' | 'Demo Day/Pitch' | 'Others';

export type EventStatus = 'live' | 'pending';

export const eventCategories = {
  Meetup: { colorName: 'event-meetup', colorHex: '#EF4444' }, // Red
  'Conference/Summit': { colorName: 'event-conference', colorHex: '#F97316' }, // Orange
  'Talk/Panel': { colorName: 'event-talk', colorHex: '#8B5CF6' }, // Violet
  'Demo Day/Pitch': { colorName: 'event-demo', colorHex: '#3B82F6' }, // Blue
  Others: { colorName: 'event-others', colorHex: '#14B8A6' }, // Teal
};

export const eventCategoryOrder: EventCategory[] = [
  'Meetup',
  'Conference/Summit',
  'Talk/Panel',
  'Demo Day/Pitch',
  'Others',
];

// Category → Tailwind classes. Shared across event card, filters, and the post dialog
// so the color coding stays consistent (brief: Meetup red, Conference orange,
// Talk violet, Demo blue, Others teal).
export const categoryLeftBorderClass: Record<EventCategory, string> = {
  Meetup: 'border-l-red-500',
  'Conference/Summit': 'border-l-orange-500',
  'Talk/Panel': 'border-l-violet-500',
  'Demo Day/Pitch': 'border-l-blue-500',
  Others: 'border-l-teal-500',
};

export const categorySolidClass: Record<EventCategory, string> = {
  Meetup: 'bg-red-500 text-white hover:bg-red-600',
  'Conference/Summit': 'bg-orange-500 text-white hover:bg-orange-600',
  'Talk/Panel': 'bg-violet-500 text-white hover:bg-violet-600',
  'Demo Day/Pitch': 'bg-blue-500 text-white hover:bg-blue-600',
  Others: 'bg-teal-500 text-white hover:bg-teal-600',
};

export const categoryDotClass: Record<EventCategory, string> = {
  Meetup: 'bg-red-500',
  'Conference/Summit': 'bg-orange-500',
  'Talk/Panel': 'bg-violet-500',
  'Demo Day/Pitch': 'bg-blue-500',
  Others: 'bg-teal-500',
};

// Accent bar at the top of the post dialog.
export const categoryBarClass: Record<EventCategory, string> = {
  Meetup: 'bg-red-500',
  'Conference/Summit': 'bg-orange-500',
  'Talk/Panel': 'bg-violet-500',
  'Demo Day/Pitch': 'bg-blue-500',
  Others: 'bg-teal-500',
};

export type EventType = {
  id: string; // Firestore document id
  title: string;
  date: string; // ISO 8601 format: 'YYYY-MM-DD'
  time: string;
  location: string;
  category: EventCategory;
  tags: string[];
  online?: boolean;
  // Attribution: who posted it and (optionally) the company it was posted as.
  person?: string;
  org?: string | null;
  companySlug?: string;
  ownerUid?: string;
  // 'live' shows publicly; 'pending' is awaiting moderation (unaffiliated posters).
  status?: EventStatus;
  // Posted by the current viewer — enables owner edit/delete controls.
  mine?: boolean;
};

// A company the signed-in user can post events "as" (from their memberships).
export type Affiliation = { id: string; name: string };

