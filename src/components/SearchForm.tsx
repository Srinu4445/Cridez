import React, { useState, useEffect, useRef } from 'react';
import { BookingSearch, BookingType, OutstationSubtype } from '../types';
import { POPULAR_CITIES, POPULAR_AIRPORTS, HOURLY_PACKAGES } from '../data';
import { MapPin, Calendar, Clock, RotateCcw, Plane, Milestone, ShieldCheck, HeartHandshake } from 'lucide-react';

interface SearchFormProps {
  onSearch: (search: BookingSearch) => void;
  initialValue?: BookingSearch;
}

export default function SearchForm({ onSearch, initialValue }: SearchFormProps) {
  const [type, setType] = useState<BookingType>(initialValue?.type || 'outstation');
  const [subtype, setSubtype] = useState<OutstationSubtype>(initialValue?.subtype || 'one-way');
  
  const [fromCity, setFromCity] = useState(initialValue?.fromCity || '');
  const [toCity, setToCity] = useState(initialValue?.toCity || '');
  
  // Date and Time selections
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterFormatted = dayAfter.toISOString().split('T')[0];

  const [date, setDate] = useState(initialValue?.date || tomorrowFormatted);
  const [time, setTime] = useState(initialValue?.time || '06:00');
  const [returnDate, setReturnDate] = useState(initialValue?.returnDate || dayAfterFormatted);
  
  // Local package selection
  const [hourlyPackageId, setHourlyPackageId] = useState(initialValue?.hourlyPackageId || HOURLY_PACKAGES[1].id);
  
  // Airport selection
  const [airportTransferType, setAirportTransferType] = useState<'pickup' | 'drop'>(initialValue?.airportTransferType || 'pickup');
  const [airportName, setAirportName] = useState(initialValue?.airportName || POPULAR_AIRPORTS[0].name);

  // Suggestions state
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide dropdowns on click outside
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions as fromCity types
  useEffect(() => {
    if (!fromCity) {
      setFromSuggestions(POPULAR_CITIES);
    } else {
      setFromSuggestions(
        POPULAR_CITIES.filter(c => c.toLowerCase().includes(fromCity.toLowerCase()))
      );
    }
  }, [fromCity]);

  // Update suggestions as toCity types
  useEffect(() => {
    if (!toCity) {
      setToSuggestions(POPULAR_CITIES);
    } else {
      setToSuggestions(
        POPULAR_CITIES.filter(c => c.toLowerCase().includes(toCity.toLowerCase()))
      );
    }
  }, [toCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity.trim()) {
      alert('Please enter a source city.');
      return;
    }
    
    if (type === 'outstation' && !toCity.trim()) {
      alert('Please enter a destination city.');
      return;
    }

    const payload: BookingSearch = {
      type,
      fromCity: fromCity.trim(),
      date,
      time,
      ...(type === 'outstation' && { subtype, toCity: toCity.trim() }),
      ...(type === 'outstation' && subtype === 'round-trip' && { returnDate }),
      ...(type === 'local' && { hourlyPackageId }),
      ...(type === 'airport' && { airportTransferType, airportName, toCity: airportName })
    };

    onSearch(payload);
  };

  const handleSwapCities = () => {
    if (type === 'outstation' && fromCity && toCity) {
      const temp = fromCity;
      setFromCity(toCity);
      setToCity(temp);
    }
  };

  return (
    <div id="search-form-card" className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Category Tabs */}
      <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 p-2 gap-1">
        <button
          type="button"
          id="tab-outstation"
          onClick={() => setType('outstation')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            type === 'outstation'
              ? 'bg-amber-400 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
          }`}
        >
          <Milestone className="w-4 h-4 shrink-0" />
          <span>Outstation</span>
        </button>

        <button
          type="button"
          id="tab-local"
          onClick={() => setType('local')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            type === 'local'
              ? 'bg-amber-400 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>Local hourly</span>
        </button>

        <button
          type="button"
          id="tab-airport"
          onClick={() => setType('airport')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            type === 'airport'
              ? 'bg-amber-400 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
          }`}
        >
          <Plane className="w-4 h-4 shrink-0" />
          <span>Airport transfer</span>
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Outstation Trip Subtype Toggle */}
        {type === 'outstation' && (
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
            <button
              type="button"
              id="subtype-one-way"
              onClick={() => setSubtype('one-way')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subtype === 'one-way'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              One Way
            </button>
            <button
              type="button"
              id="subtype-round-trip"
              onClick={() => setSubtype('round-trip')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subtype === 'round-trip'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Round Trip
            </button>
          </div>
        )}

        {/* Local Airport Subtype Toggle */}
        {type === 'airport' && (
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
            <button
              type="button"
              id="airport-pickup"
              onClick={() => setAirportTransferType('pickup')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                airportTransferType === 'pickup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pick up from Airport
            </button>
            <button
              type="button"
              id="airport-drop"
              onClick={() => setAirportTransferType('drop')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                airportTransferType === 'drop'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Drop to Airport
            </button>
          </div>
        )}

        {/* Location Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* FROM City */}
          <div ref={fromRef} className="relative md:col-span-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              From City
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3.5 transition-all">
              <MapPin className="text-amber-500 w-5 h-5 mr-3 shrink-0" />
              <input
                type="text"
                id="input-from-city"
                placeholder="Enter pickup city (e.g., Delhi)"
                className="bg-transparent w-full focus:outline-none text-slate-800 text-sm placeholder:text-gray-400 font-medium"
                value={fromCity}
                onChange={(e) => {
                  setFromCity(e.target.value);
                  setShowFromDropdown(true);
                }}
                onFocus={() => {
                  setShowFromDropdown(true);
                  setShowToDropdown(false);
                }}
              />
            </div>
            {/* From City Suggestions */}
            {showFromDropdown && fromSuggestions.length > 0 && (
              <div id="from-suggestions" className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl max-h-56 overflow-y-auto z-50 p-2 space-y-1">
                {fromSuggestions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setFromCity(city);
                      setShowFromDropdown(false);
                    }}
                    className="w-full text-left font-medium px-4 py-2.5 rounded-xl hover:bg-amber-50/75 hover:text-amber-900 text-slate-700 text-sm transition-all"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap icon (Only outstation) */}
          <div className="flex justify-center md:col-span-2 md:pt-6">
            {type === 'outstation' ? (
              <button
                type="button"
                id="btn-swap-cities"
                onClick={handleSwapCities}
                title="Swap locations"
                className="bg-slate-900 text-amber-400 p-3 rounded-full hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-md transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5 rotate-45 transform" />
              </button>
            ) : (
              <div className="h-0 md:h-1" />
            )}
          </div>

          {/* TO Destination or Airport Dropdown or Rental Package */}
          <div className="md:col-span-5">
            {type === 'outstation' && (
              <div ref={toRef} className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  To City
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3.5 transition-all">
                  <MapPin className="text-emerald-500 w-5 h-5 mr-3 shrink-0" />
                  <input
                    type="text"
                    id="input-to-city"
                    placeholder="Enter destination city (e.g., Jaipur)"
                    className="bg-transparent w-full focus:outline-none text-slate-800 text-sm placeholder:text-gray-400 font-medium"
                    value={toCity}
                    onChange={(e) => {
                      setToCity(e.target.value);
                      setShowToDropdown(true);
                    }}
                    onFocus={() => {
                      setShowToDropdown(true);
                      setShowFromDropdown(false);
                    }}
                  />
                </div>
                {/* To City Suggestions */}
                {showToDropdown && toSuggestions.length > 0 && (
                  <div id="to-suggestions" className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl max-h-56 overflow-y-auto z-50 p-2 space-y-1">
                    {toSuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setToCity(city);
                          setShowToDropdown(false);
                        }}
                        className="w-full text-left font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-sm transition-all"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {type === 'local' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Rental Package
                </label>
                <select
                  id="select-rental-package"
                  value={hourlyPackageId}
                  onChange={(e) => setHourlyPackageId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-amber-500 focus:bg-white rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800 focus:outline-none transition-all cursor-pointer"
                >
                  {HOURLY_PACKAGES.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {type === 'airport' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Airport
                </label>
                <select
                  id="select-airport"
                  value={airportName}
                  onChange={(e) => setAirportName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-amber-500 focus:bg-white rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800 focus:outline-none transition-all cursor-pointer"
                >
                  {POPULAR_AIRPORTS.map((airport) => (
                    <option key={airport.id} value={airport.name}>
                      {airport.city} - {airport.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Date, Time, Return Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Departure Date
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3.5 transition-all">
              <Calendar className="text-slate-400 w-5 h-5 mr-3 shrink-0" />
              <input
                type="date"
                id="input-departure-date"
                min={tomorrowFormatted}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-slate-800 text-sm font-medium cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Departure Time
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3.5 transition-all">
              <Clock className="text-slate-400 w-5 h-5 mr-3 shrink-0" />
              <input
                type="time"
                id="input-departure-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-slate-800 text-sm font-medium cursor-pointer"
              />
            </div>
          </div>

          {/* Optional Return Date if Round Trip */}
          {type === 'outstation' && subtype === 'round-trip' ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Return Date
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3.5 transition-all">
                <Calendar className="text-slate-400 w-5 h-5 mr-3 shrink-0" />
                <input
                  type="date"
                  id="input-return-date"
                  min={date}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-slate-800 text-sm font-medium cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="hidden sm:block opacity-60 flex flex-col justify-end pb-3 text-xs text-slate-500 italic">
              * One-way travel base pricing includes all state permit tolls.
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-search-cabs"
            className="w-full bg-slate-900 text-amber-400 uppercase tracking-wider font-extrabold text-sm py-4 rounded-2xl shadow-xl hover:bg-slate-800 cursor-pointer active:scale-[0.99] transition-all transform flex items-center justify-center gap-2 group"
          >
            Search Best Cabs
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </form>

      {/* Trust Badges bottom bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-gray-100 bg-slate-50 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        <div className="flex items-center gap-3 p-4 justify-center sm:justify-start">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-800">No Hidden Costs</h4>
            <p className="text-[10px] text-slate-500 font-medium">Toll & driver allowance included</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 justify-center sm:justify-start">
          <HeartHandshake className="w-5 h-5 text-indigo-600" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-800 font-display">Trained Partners</h4>
            <p className="text-[10px] text-slate-500 font-medium">Thoroughly vetted drivers</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 justify-center sm:justify-start">
          <Milestone className="w-5 h-5 text-amber-600" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-800">Dynamic Live Track</h4>
            <p className="text-[10px] text-slate-500 font-medium">Real-time driver updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}
