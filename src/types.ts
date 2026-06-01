export type BookingType = 'outstation' | 'local' | 'airport';

export type OutstationSubtype = 'one-way' | 'round-trip';

export type CabCategory = 'hatchback' | 'sedan' | 'suv' | 'premium_suv';

export interface CabInfo {
  id: string;
  category: CabCategory;
  name: string;
  models: string[];
  seats: number;
  baggage: number;
  rating: number;
  ratePerKm: number;
  basePrice: number;
  description: string;
}

export interface BookingSearch {
  type: BookingType;
  subtype?: OutstationSubtype;
  fromCity: string;
  toCity?: string;
  date: string;
  time: string;
  returnDate?: string;
  hourlyPackageId?: string; // e.g. "8-80" (8 hours - 80 km)
  airportTransferType?: 'pickup' | 'drop'; // pickup: from airport, drop: to airport
  airportName?: string;
}

export interface HourlyPackage {
  id: string;
  title: string;
  hours: number;
  kms: number;
}

export interface SearchResult {
  search: BookingSearch;
  distanceKm: number;
  durationText: string;
}

export interface Driver {
  name: string;
  phone: string;
  vehicleNumber: string;
  rating: number;
  photo: string;
}

export interface Booking {
  id: string;
  search: BookingSearch;
  selectedCab: CabInfo;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  pickupAddress: string;
  dropAddress?: string;
  fareBreakdown: {
    basePrice: number;
    driverAllowance: number;
    tollTaxEstimate: number;
    gst: number;
    discount: number;
    totalPrice: number;
  };
  status: 'pending' | 'dispatched' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
  driver?: Driver;
  currentCoords?: { x: number; y: number };
  routePoints?: { x: number; y: number }[];
  progressIndex?: number;
  userRating?: number;
  userFeedback?: string;
  createdAt: string;
}
