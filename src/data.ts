import { CabInfo, HourlyPackage } from './types';

export const POPULAR_CITIES = [
  'Delhi',
  'Gurgaon (Gurugram)',
  'Noida',
  'Jaipur',
  'Agra',
  'Chandigarh',
  'Dehradun',
  'Rishikesh',
  'Shimla',
  'Manali',
  'Mumbai',
  'Pune',
  'Lonavala',
  'Bangalore',
  'Mysore',
  'Ooty',
  'Chennai',
  'Hyderabad',
  'Kolkata'
];

export const POPULAR_AIRPORTS = [
  { id: 'del-igi', city: 'Delhi', name: 'Indira Gandhi International Airport (DEL) - T3' },
  { id: 'del-t1', city: 'Delhi', name: 'Indira Gandhi International Airport (DEL) - T1' },
  { id: 'bom-t2', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport (BOM) - T2' },
  { id: 'blr-t1', city: 'Bangalore', name: 'Kempegowda International Airport (BLR)' },
  { id: 'hyd-t1', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport (HYD)' },
  { id: 'pnq-t1', city: 'Pune', name: 'Pune International Airport (PNQ)' },
  { id: 'maa-t1', city: 'Chennai', name: 'Chennai International Airport (MAA)' }
];

export const HOURLY_PACKAGES: HourlyPackage[] = [
  { id: '4h-40k', title: '4 Hours & 40 Kms', hours: 4, kms: 40 },
  { id: '8h-80k', title: '8 Hours & 80 Kms (Full Day)', hours: 8, kms: 80 },
  { id: '12h-120k', title: '12 Hours & 120 Kms (Extended Day)', hours: 12, kms: 120 }
];

export const VEHICLE_FLEET: CabInfo[] = [
  {
    id: 'hatchback',
    category: 'hatchback',
    name: 'Economy Hatchback',
    models: ['Maruti Swift', 'WagonR', 'Hyundai Grand i10'],
    seats: 4,
    baggage: 2,
    rating: 4.7,
    ratePerKm: 11,
    basePrice: 1200,
    description: 'Perfect for solo travelers or small cozy families on a budget. Clean & air-conditioned.'
  },
  {
    id: 'sedan',
    category: 'sedan',
    name: 'Comfort Sedan',
    models: ['Maruti Dzire', 'Toyota Etios', 'Hyundai Aura'],
    seats: 4,
    baggage: 3,
    rating: 4.8,
    ratePerKm: 13,
    basePrice: 1500,
    description: 'Generous legroom and trunk space. Ideal for both business travel and quick family road trips.'
  },
  {
    id: 'suv',
    category: 'suv',
    name: 'Spacious SUV',
    models: ['Maruti Ertiga', 'Mahindra Marazzo', 'Renault Triber'],
    seats: 6,
    baggage: 4,
    rating: 4.85,
    ratePerKm: 16,
    basePrice: 2200,
    description: 'Great comfort for mid-sized groups. Perfect for weekend getaways with extra bags.'
  },
  {
    id: 'premium_suv',
    category: 'premium_suv',
    name: 'Premium Cruiser',
    models: ['Toyota Innova Crysta', 'Mahindra XUV700'],
    seats: 7,
    baggage: 5,
    rating: 4.95,
    ratePerKm: 21,
    basePrice: 3200,
    description: 'Ultimate safety, comfort, and premium shock absorption. Preferred for long distance journeys.'
  }
];

export const MOCK_DRIVERS = [
  {
    name: 'Amit Sharma',
    phone: '+91 98765 01234',
    vehicleNumber: 'DL 1YB 4023',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
  },
  {
    name: 'Rajinder Singh',
    phone: '+91 91234 56789',
    vehicleNumber: 'HR 26CR 8711',
    rating: 4.8,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop'
  },
  {
    name: 'Kshitiz Yadav',
    phone: '+91 98112 34567',
    vehicleNumber: 'UP 16DT 5590',
    rating: 4.95,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop'
  },
  {
    name: 'Mahesh Kumar',
    phone: '+91 88990 12345',
    vehicleNumber: 'MH 12GP 2341',
    rating: 4.75,
    photo: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=256&auto=format&fit=crop'
  },
  {
    name: 'Suresh Gopalan',
    phone: '+91 99887 76655',
    vehicleNumber: 'KA 03MM 8802',
    rating: 4.85,
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=256&auto=format&fit=crop'
  }
];

/**
 * Deterministically estimates distance between two cities for realistic looking numbers.
 * Handled gracefully and cleanly.
 */
export function getEstimatedDistance(from: string, to: string): number {
  if (!to) return 35; // default local run
  
  const citiesCombined = [from.toLowerCase().trim(), to.toLowerCase().trim()].sort().join('-');
  
  // Hardcoded key popular routes
  const mainRoutes: Record<string, number> = {
    'delhi-jaipur': 270,
    'delhi-agra': 235,
    'delhi-noida': 40,
    'delhi-gurgaon (gurugram)': 32,
    'gurgaon (gurugram)-noida': 52,
    'delhi-chandigarh': 245,
    'delhi-dehradun': 255,
    'delhi-rishikesh': 260,
    'delhi-shimla': 345,
    'delhi-manali': 530,
    'mumbai-pune': 150,
    'mumbai-lonavala': 85,
    'pune-lonavala': 65,
    'bangalore-mysore': 145,
    'bangalore-ooty': 270,
    'mysore-ooty': 125,
    'chennai-bangalore': 350,
    'hyderabad-bangalore': 570
  };

  if (mainRoutes[citiesCombined]) {
    return mainRoutes[citiesCombined];
  }

  // Fallback: deterministic string hashing
  let hash = 0;
  for (let i = 0; i < citiesCombined.length; i++) {
    hash = (hash << 5) - hash + citiesCombined.charCodeAt(i);
    hash |= 0;
  }
  
  const min = 120;
  const max = 480;
  return min + Math.abs(hash % (max - min));
}

export function getDurationText(distanceKm: number): string {
  // Assume avg speed is 60km/h
  const totalHours = distanceKm / 55;
  const hrs = Math.floor(totalHours);
  const mins = Math.round((totalHours - hrs) * 60);
  
  if (hrs === 0) {
    return `${mins}m`;
  }
  return `${hrs}h ${mins}m`;
}
