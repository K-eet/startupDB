import { isTomorrow, isThisWeek, parseISO } from 'date-fns';

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

export const initialEvents: EventType[] = [
  {
    id: 1,
    title: 'Seed Funding Office Hours',
    date: '2024-08-27',
    time: 'Tue, 23 Dec ・ 10am - 1pm',
    location: 'Online',
    organizer: 'Endeavor Malaysia',
    category: 'Meetup',
    tags: ['Funding', 'Invite-only'],
  },
  {
    id: 2,
    title: 'Design Thinking for Founders',
    date: '2024-08-29',
    time: 'Wed, 24 Dec ・ 2pm - 5pm',
    location: 'WORQ, KL Sentral',
    organizer: 'StartupKL',
    category: 'Talk/Panel',
    tags: ['Workshop', 'Paid'],
  },
  {
    id: 3,
    title: 'Full-Stack Developer Bootcamp Final Pitch',
    date: '2024-09-01',
    time: '27-29 Dec ・ 10am (Day 1) - 5pm (Final day)',
    location: 'Online',
    organizer: 'NEXT Academy',
    category: 'Demo Day/Pitch',
    tags: ['Tech', 'Paid'],
  },
  {
    id: 4,
    title: 'New Year Founders Gathering',
    date: '2024-09-15',
    time: 'Sat, 3 Jan ・ 6pm - 9pm',
    location: 'The Alley, Changkat',
    organizer: 'Malaysian Founders Network',
    category: 'Meetup',
    tags: ['Networking', 'Free'],
  },
  {
    id: 5,
    title: 'AI in FinTech Summit',
    date: '2024-09-22',
    time: 'Sun, 10 Jan ・ 9am - 4pm',
    location: 'Connexion Conference & Event Centre',
    organizer: 'Fintech Association of Malaysia',
    category: 'Conference/Summit',
    tags: ['AI', 'Fintech', 'Paid'],
  },
  {
    id: 6,
    title: 'VC & Founder Networking Night',
    date: '2024-09-05',
    time: 'Fri, 28 Dec ・ 7pm - 10pm',
    location: 'Private Rooftop Bar, Bangsar',
    organizer: 'VC Connect',
    category: 'Meetup',
    tags: ['Networking', 'Invite-only'],
  },
  {
    id: 7,
    title: 'Asia EdTech Conference 2025',
    date: '2024-10-10',
    time: '15-16 Jan ・ 9am - 6pm',
    location: 'Suntec Convention Centre, Singapore',
    organizer: 'EdTech Asia',
    category: 'Conference/Summit',
    tags: ['EdTech', 'Regional', 'Paid'],
  },
  {
    id: 8,
    title: 'Panel: The Future of Work with AI',
    date: '2024-10-02',
    time: 'Thurs, 1 Jan ・ 4pm - 5:30pm',
    location: 'Online',
    organizer: 'TechCrunch',
    category: 'Talk/Panel',
    tags: ['AI', 'Future of Work', 'Free'],
  },
  {
    id: 9,
    title: 'Accelerator Batch #13 Demo Day',
    date: '2024-10-20',
    time: 'Mon, 20 Jan ・ 2pm - 5pm',
    location: 'Auditorium, Technology Park Malaysia',
    organizer: 'Cyberview Living Lab Accelerator',
    category: 'Demo Day/Pitch',
    tags: ['Pitching', 'Investment', 'Invite-only'],
  },
  {
    id: 10,
    title: 'Startup Legal 101: From Incorporation to Fundraising',
    date: '2024-08-30',
    time: 'Thurs, 25 Dec ・ 10am - 12pm',
    location: 'Online',
    organizer: 'ZICO Law',
    category: 'Others',
    tags: ['Legal', 'Workshop', 'Free'],
  }
];

// Helper function to dynamically group events.
// NOTE: This uses current date, so to test "Tomorrow" and "This Week",
// you might need to adjust the dates in initialEvents.
export const groupEvents = (events: EventType[]) => {
  const groups = {
    Tomorrow: [] as EventType[],
    'This Week': [] as EventType[],
    Upcoming: [] as EventType[],
  };

  events.forEach((event) => {
    const eventDate = parseISO(event.date);
    if (isTomorrow(eventDate)) {
      groups.Tomorrow.push(event);
    } else if (isThisWeek(eventDate, { weekStartsOn: 1 })) {
      groups['This Week'].push(event);
    } else {
      groups.Upcoming.push(event);
    }
  });

  return groups;
};

// To make event dates work for demonstration, let's create a dynamic grouping
// based on a fixed "today".
const getDemoDateGroups = (events: EventType[]) => {
  const today = new Date(); // This will be the reference
  const groups: { [key: string]: EventType[] } = {
    Tomorrow: [],
    'This Week': [],
    Upcoming: [],
  };

  const sortedEvents = [...events].sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  // A simple hack to make the sections appear for demo purposes
  if(sortedEvents.length > 0) groups.Tomorrow.push(sortedEvents[0]);
  if(sortedEvents.length > 2) groups['This Week'].push(sortedEvents[1], sortedEvents[2]);
  if(sortedEvents.length > 3) {
    groups.Upcoming = sortedEvents.slice(3);
  }


  // Filter out empty groups
  return Object.fromEntries(Object.entries(groups).filter(([_, value]) => value.length > 0));
}
