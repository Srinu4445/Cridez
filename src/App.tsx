import React, { useState, useEffect } from 'react';
import { BookingSearch, CabInfo, Booking } from './types';
import { getEstimatedDistance, getDurationText, MOCK_DRIVERS } from './data';
import SearchForm from './components/SearchForm';
import CabCategoryList from './components/CabCategoryList';
import BookingDetailsForm from './components/BookingDetailsForm';
import MapSimulation from './components/MapSimulation';
import RidesDashboard from './components/RidesDashboard';
import { Shield, Sparkles, Navigation, Calendar, Flame, Check, Bookmark, Clock, User, Phone, PhoneCall } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'book' | 'trips'>('book');
  
  // Multi-step form flow states under "book" tab
  const [bookingStep, setBookingStep] = useState<'search' | 'select' | 'passenger' | 'tracking'>('search');
  
  // Active search criteria and outcomes
  const [searchCriteria, setSearchCriteria] = useState<BookingSearch | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(120);
  const [durationText, setDurationText] = useState<string>('2h 20m');

  // Selected cab and details
  const [selectedCab, setSelectedCab] = useState<CabInfo | null>(null);
  const [selectedFareDetails, setSelectedFareDetails] = useState<any>(null);

  // Active tracking booking
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);

  // Local storage persisted general bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('cride_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to local storage whenever bookings state updates
  useEffect(() => {
    localStorage.setItem('cride_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleSearchSubmit = (search: BookingSearch) => {
    setSearchCriteria(search);
    
    // Estimate distance and time dynamically
    let dist = 35; // Default standard local run
    if (search.type === 'outstation' && search.toCity) {
      dist = getEstimatedDistance(search.fromCity, search.toCity);
    } else if (search.type === 'airport') {
      dist = 42; // default airport distance
    }
    
    setDistanceKm(dist);
    setDurationText(getDurationText(dist));
    setBookingStep('select');
  };

  const handleCabSelect = (cab: CabInfo, fareDetails: any) => {
    setSelectedCab(cab);
    setSelectedFareDetails(fareDetails);
    setBookingStep('passenger');
  };

  const handlePassengerSubmit = (details: {
    passengerName: string;
    passengerPhone: string;
    passengerEmail: string;
    pickupAddress: string;
    dropAddress: string;
    paymentOption: 'pay-full' | 'pay-advance' | 'pay-later';
  }) => {
    if (!searchCriteria || !selectedCab || !selectedFareDetails) return;

    // Pick a random mock driver preset
    const randomDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];

    // Create unique booking record
    const newBooking: Booking = {
      id: `CRD-${Math.floor(100000 + Math.random() * 900000)}`,
      search: searchCriteria,
      selectedCab,
      passengerName: details.passengerName,
      passengerPhone: details.passengerPhone,
      passengerEmail: details.passengerEmail,
      pickupAddress: details.pickupAddress,
      dropAddress: details.dropAddress,
      fareBreakdown: selectedFareDetails,
      status: 'pending',
      driver: randomDriver,
      createdAt: new Date().toISOString()
    };

    setBookings((prev) => [newBooking, ...prev]);
    setActiveTrackingBooking(newBooking);
    setBookingStep('tracking');
  };

  const handleUpdateBookingStatus = (
    bookingId: string,
    status: Booking['status'],
    extra?: Partial<Booking>
  ) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status, ...extra } : b))
    );
    setActiveTrackingBooking((current) =>
      current && current.id === bookingId ? { ...current, status, ...extra } : current
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      handleUpdateBookingStatus(bookingId, 'cancelled');
    }
  };

  const handleOpenTrackerFromDashboard = (booking: Booking) => {
    setActiveTrackingBooking(booking);
    setActiveTab('book');
    setBookingStep('tracking');
  };

  const handleReturnToMainSearch = () => {
    setBookingStep('search');
    setSelectedCab(null);
    setSelectedFareDetails(null);
    setActiveTrackingBooking(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans flex flex-col justify-between">
      {/* Prime Header navigation bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs">
        <div id="master-header-container" className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-2.5 rounded-2xl shrink-0">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-display select-none">🚕 CRIDE</span>
            </div>
            <div>
              <span className="text-[10px] bg-amber-100 text-slate-950 px-2 py-0.5 rounded-sm font-bold block w-fit uppercase font-mono tracking-wider">CabBazar Clone</span>
              <p className="text-[10px] text-slate-400 font-semibold hidden sm:block">Outstation, Hourly & Airport Cab Provider</p>
            </div>
          </div>

          {/* Quick Stats Tabs */}
          <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => {
                setActiveTab('book');
                if (bookingStep === 'tracking' && !activeTrackingBooking) {
                  setBookingStep('search');
                }
              }}
              type="button"
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
                activeTab === 'book'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Book Cab
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              type="button"
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'trips'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              My Trips 
              {bookings.length > 0 && (
                <span className="bg-slate-950 text-white rounded-full text-[9px] font-mono px-1.5 py-0.5 shrink-0">
                  {bookings.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'book' ? (
          <div>
            {bookingStep === 'search' && (
              <div className="space-y-12 animate-fadeIn">
                {/* Hero branding header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 leading-none">
                    India's Leading Outstation <span className="text-amber-500">Cab Booking</span> Portal
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    Welcome to <span className="font-bold text-slate-800">Cride</span>, your high-performance CabBazar Clone! Book clean, air-conditioned taxis for one-way outstations, hourly city packages, or airport transfers with flat rates and live tracking dashboards.
                  </p>
                </div>

                {/* Main Booking Form */}
                <SearchForm onSearch={handleSearchSubmit} />

                {/* Rebranded Features Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-xs flex gap-4 items-start">
                    <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 font-display uppercase tracking-wide">
                        All-Inclusive Pricing
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                        Fares include Toll permits, GST components, and driver charge. What you see is exactly what you pay!
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-xs flex gap-4 items-start">
                    <div className="bg-[#EEF2FF] text-indigo-700 p-2.5 rounded-xl shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 font-display uppercase tracking-wide">
                        Corporate Verification
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                        Chauffeurs are fully background checked, with state tourist credentials and modern clean commercial sedans.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-xs flex gap-4 items-start">
                    <div className="bg-[#ECFDF5] text-emerald-800 p-2.5 rounded-xl shrink-0">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 font-display uppercase tracking-wide">
                        Interactive Live Dispatch
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                        Simulate background vehicle dispatches, physical path routes travel tracking, and generate receipts with feedback!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {bookingStep === 'select' && searchCriteria && (
              <CabCategoryList
                search={searchCriteria}
                distanceKm={distanceKm}
                durationText={durationText}
                onSelect={handleCabSelect}
                onBack={handleReturnToMainSearch}
              />
            )}

            {bookingStep === 'passenger' && searchCriteria && selectedCab && selectedFareDetails && (
              <BookingDetailsForm
                search={searchCriteria}
                selectedCab={selectedCab}
                fareBreakdown={selectedFareDetails}
                onSubmit={handlePassengerSubmit}
                onBack={() => setBookingStep('select')}
              />
            )}

            {bookingStep === 'tracking' && activeTrackingBooking && (
              <MapSimulation
                booking={activeTrackingBooking}
                onUpdateStatus={handleUpdateBookingStatus}
                onClose={handleReturnToMainSearch}
              />
            )}
          </div>
        ) : (
          /* Trips Tab Dashboard */
          <RidesDashboard
            bookings={bookings}
            onOpenTracker={handleOpenTrackerFromDashboard}
            onCancelBooking={handleCancelBooking}
          />
        )}
      </main>

      {/* Main Footer Block */}
      <footer className="border-t border-gray-100 bg-slate-950 text-white py-12 mt-16">
        <div id="master-footer" className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-base font-bold font-display text-amber-400">🚕 CRIDE SYSTEMS</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Cride is a highly optimized clone of CabBazar booking flow models, built cleanly to support outstation, local premium, and flat-rate airport trips with fully interactive tracking simulation dashboards.
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">© 2026 Cride Compliance Inc.</span>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Popular Outstation Routes</h5>
            <ul className="text-xs text-slate-400 space-y-1.5 font-medium cursor-pointer">
              <li className="hover:text-amber-400">Delhi to Agra Cab Rental</li>
              <li className="hover:text-amber-400">Delhi to Jaipur Roundtrip</li>
              <li className="hover:text-amber-400">Mumbai to Pune Oneway Cab</li>
              <li className="hover:text-amber-400">Bangalore to Ooty Tourist Rental</li>
              <li className="hover:text-amber-400">Ahmedabad to Udaipur Express</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Cride Safety Trust</h5>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              No cancellation charges before dispatch. Pay to the driver directly on completion. Full cash and UPI flexibility with 24/7 tourist permit helpdesk support!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
