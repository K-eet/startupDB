export type EventCategory = 'Meetup' | 'Conference/Summit' | 'Talk/Panel' | 'Demo Day/Pitch' | 'Others';

export const eventCategories = {
  Meetup: { colorName: 'event-meetup', colorHex: '#EF4444' }, // Red
  'Conference/Summit': { colorName: 'event-conference', colorHex: '#F97316' }, // Orange
  'Talk/Panel': { colorName: 'event-talk', colorHex: '#8B5CF6' }, // Violet
  'Demo Day/Pitch': { colorName: 'event-demo', colorHex: '#3B82F6' }, // Blue
  Others: { colorName: 'event-others', colorHex: '#14B8A6' }, // Teal
};

export type EventType = {
  id: number;
  title: string;
  date: string; // ISO 8601 format: 'YYYY-MM-DD'
  time: string;
  location: string;
  organizer: string;
  category: EventCategory;
  tags: string[];
};

export const initialEvents: Omit<EventType, 'date'>[] = [
  {
    id: 1,
    title: 'Seed Funding Office Hours',
    time: 'Tue, 23 Dec ・ 10am - 1pm',
    location: 'Online',
    organizer: 'Endeavor Malaysia',
    category: 'Meetup',
    tags: ['Funding', 'Invite-only'],
  },
  {
    id: 2,
    title: 'Design Thinking for Founders',
    time: 'Wed, 24 Dec ・ 2pm - 5pm',
    location: 'WORQ, KL Sentral',
    organizer: 'StartupKL',
    category: 'Talk/Panel',
    tags: ['Workshop', 'Paid'],
  },
  {
    id: 3,
    title: 'Full-Stack Developer Bootcamp Final Pitch',
    time: '27-29 Dec ・ 10am (Day 1) - 5pm (Final day)',
    location: 'Online',
    organizer: 'NEXT Academy',
    category: 'Demo Day/Pitch',
    tags: ['Tech', 'Paid'],
  },
  {
    id: 4,
    title: 'New Year Founders Gathering',
    time: 'Sat, 3 Jan ・ 6pm - 9pm',
    location: 'The Alley, Changkat',
    organizer: 'Malaysian Founders Network',
    category: 'Meetup',
    tags: ['Networking', 'Free'],
  },
  {
    id: 5,
    title: 'AI in FinTech Summit',
    time: 'Sun, 10 Jan ・ 9am - 4pm',
    location: 'Connexion Conference & Event Centre',
    organizer: 'Fintech Association of Malaysia',
    category: 'Conference/Summit',
    tags: ['AI', 'Fintech', 'Paid'],
  },
  {
    id: 6,
    title: 'VC & Founder Networking Night',
    time: 'Fri, 28 Dec ・ 7pm - 10pm',
    location: 'Private Rooftop Bar, Bangsar',
    organizer: 'VC Connect',
    category: 'Meetup',
    tags: ['Networking', 'Invite-only'],
  },
  {
    id: 7,
    title: 'Asia EdTech Conference 2025',
    time: '15-16 Jan ・ 9am - 6pm',
    location: 'Suntec Convention Centre, Singapore',
    organizer: 'EdTech Asia',
    category: 'Conference/Summit',
    tags: ['EdTech', 'Regional', 'Paid'],
  },
  {
    id: 8,
    title: 'Panel: The Future of Work with AI',
    time: 'Thurs, 1 Jan ・ 4pm - 5:30pm',
    location: 'Online',
    organizer: 'TechCrunch',
    category: 'Talk/Panel',
    tags: ['AI', 'Future of Work', 'Free'],
  },
  {
    id: 9,
    title: 'Accelerator Batch #13 Demo Day',
    time: 'Mon, 20 Jan ・ 2pm - 5pm',
    location: 'Auditorium, Technology Park Malaysia',
    organizer: 'Cyberview Living Lab Accelerator',
    category: 'Demo Day/Pitch',
    tags: ['Pitching', 'Investment', 'Invite-only'],
  },
  {
    id: 10,
    title: 'Startup Legal 101: From Incorporation to Fundraising',
    time: 'Thurs, 25 Dec ・ 10am - 12pm',
    location: 'Online',
    organizer: 'ZICO Law',
    category: 'Others',
    tags: ['Legal', 'Workshop', 'Free'],
  }
];
