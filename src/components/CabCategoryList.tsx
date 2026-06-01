import React, { useState } from 'react';
import { CabInfo, BookingSearch } from '../types';
import { VEHICLE_FLEET } from '../data';
import { User, Briefcase, Star, Info, Check, AlertCircle, Sparkles } from 'lucide-react';

interface CabCategoryListProps {
  search: BookingSearch;
  distanceKm: number;
  durationText: string;
  onSelect: (cab: CabInfo, fareDetails: any) => void;
  onBack: () => void;
}

export default function CabCategoryList({ search, distanceKm, durationText, onSelect, onBack }: CabCategoryListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate dynamic fare parameters for a specific cab
  const calculateFare = (cab: CabInfo) => {
    let basePrice = 0;
    let driverAllowance = 250;
    let tollTaxEstimate = 0;
    let discount = 0;

    if (search.type === 'outstation') {
      const isRoundTrip = search.subtype === 'round-trip';
      const factor = isRoundTrip ? 2 : 1;
      const totalEstimatedKm = Math.max(distanceKm * factor, isRoundTrip ? 250 : 100);
      
      basePrice = Math.round(totalEstimatedKm * cab.ratePerKm);
      driverAllowance = isRoundTrip ? 600 : 350;
      tollTaxEstimate = Math.round(totalEstimatedKm * 0.95); // Approx 0.95 INR per km toll tax
      
      if (distanceKm > 250) {
        discount = Math.round(basePrice * 0.05); // 5% discount for long travel
      }
    } else if (search.type === 'local') {
      // Local package calculation
      const pkgId = search.hourlyPackageId || '8-80';
      let multiplier = 1;
      if (pkgId.includes('12')) multiplier = 2.4;
      else if (pkgId.includes('8')) multiplier = 1.8;
      
      basePrice = Math.round(cab.basePrice * multiplier);
      driverAllowance = 200;
      tollTaxEstimate = 0; // Local usually excludes tolls or includes flat municipal
    } else {
      // Airport transfer calculations
      // Flat rate based on airport distance approximation
      basePrice = Math.round(cab.basePrice * 0.85);
      driverAllowance = 150;
      tollTaxEstimate = 120; // Airport pick fee
    }

    const gst = Math.round((basePrice + driverAllowance + tollTaxEstimate - discount) * 0.05); // 5% GST
    const totalPrice = basePrice + driverAllowance + tollTaxEstimate + gst - discount;

    return {
      basePrice,
      driverAllowance,
      tollTaxEstimate,
      gst,
      discount,
      totalPrice
    };
  };

  return (
    <div id="cab-list-container" className="space-y-6">
      {/* Search Specs Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wide">
              {search.type === 'outstation' ? `Outstation: ${search.subtype}` : search.type}
            </span>
            <span className="text-slate-400 text-xs font-mono">CRIDE COMPLIANT</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold font-display flex items-center flex-wrap gap-2 text-white">
            <span>{search.fromCity}</span>
            {search.toCity && (
              <>
                <span className="text-amber-400 shrink-0">→</span>
                <span>{search.toCity}</span>
              </>
            )}
          </h2>

          <p className="text-xs text-slate-400 mt-1 font-medium">
            Date: <span className="text-white">{search.date}</span> @ <span className="text-white">{search.time}</span>
            {search.returnDate && <> | Return: <span className="text-white">{search.returnDate}</span></>}
          </p>
        </div>

        <div className="flex gap-4 md:text-right text-left">
          {search.type === 'outstation' && (
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/50">
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Est. Distance</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">{distanceKm} km</span>
            </div>
          )}
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/50">
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Est. Duration</span>
            <span className="text-lg font-extrabold text-white">{durationText}</span>
          </div>
        </div>
      </div>

      {/* Grid List header & Back Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
          Available Cabs for your journey
        </h3>
        <button
          onClick={onBack}
          type="button"
          id="btn-back-to-search"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-4"
        >
          Modify search parameters
        </button>
      </div>

      {/* Fleet Listing Cards */}
      <div className="space-y-4">
        {VEHICLE_FLEET.map((cab) => {
          const fares = calculateFare(cab);
          const isSelected = selectedCategory === cab.id;

          return (
            <div
              key={cab.id}
              id={`cab-card-${cab.id}`}
              className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                isSelected
                  ? 'border-amber-400 shadow-xl ring-2 ring-amber-400/20'
                  : 'border-slate-100 shadow-md hover:shadow-lg hover:border-amber-200'
              }`}
            >
              <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
                {/* Visual Thumbnail */}
                <div className="w-full lg:w-48 h-32 bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-4 relative border border-slate-100 overflow-hidden shrink-0">
                  <div className="absolute top-2 right-2 flex items-center bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-md text-[10px] gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-slate-950 text-slate-950 shrink-0" />
                    <span>{cab.rating}</span>
                  </div>
                  
                  {/* Styled simulated emoji/svg representation representing cabs */}
                  <div className="text-center">
                    <span className="text-5xl block animate-pulse">
                      {cab.category === 'hatchback' ? '🚗' : cab.category === 'sedan' ? '🚙' : cab.category === 'suv' ? '🚐' : '🚘'}
                    </span>
                    <span className="text-xs font-bold text-slate-400 shrink-0 select-none block mt-2 font-mono">
                      {cab.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 font-display flex items-center flex-wrap gap-2">
                      <span>{cab.name}</span>
                      <span className="text-xs font-medium text-slate-400">
                        ({cab.models.join(' / ')})
                      </span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                      {cab.description}
                    </p>
                  </div>

                  {/* Badges / Specs */}
                  <div className="flex flex-wrap gap-3 items-center text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <User className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{cab.seats} Seats Max</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{cab.baggage} Baggage Slots</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 font-mono">
                      ₹{cab.ratePerKm}/km base rate
                    </span>
                  </div>

                  {/* Dynamic Inclusions */}
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold text-emerald-700">
                    <span className="flex items-center gap-1 select-none">
                      <Check className="w-3.5 h-3.5" /> GST Included (5%)
                    </span>
                    <span className="flex items-center gap-1 select-none">
                      <Check className="w-3.5 h-3.5" /> Toll Taxes & Permits Covered
                    </span>
                    <span className="flex items-center gap-1 select-none">
                      <Check className="w-3.5 h-3.5" /> No Fuel Surcharge
                    </span>
                  </div>
                </div>

                {/* Price Display and CTA */}
                <div className="w-full lg:w-56 flex lg:flex-col lg:items-end lg:justify-center justify-between border-t lg:border-t-0 border-dashed border-slate-100 pt-6 lg:pt-0 shrink-0">
                  <div className="text-left lg:text-right space-y-1">
                    {fares.discount > 0 && (
                      <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-sm line-through">
                        ₹{(fares.totalPrice + fares.discount).toLocaleString('en-IN')}
                      </span>
                    )}
                    <div className="flex items-baseline justify-start lg:justify-end gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                        ₹{fares.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      ALL-INCLUSIVE FARE
                    </span>
                  </div>

                  <div className="lg:mt-4">
                    <button
                      type="button"
                      id={`btn-select-cab-${cab.id}`}
                      onClick={() => onSelect(cab, fares)}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs sm:text-sm font-extrabold px-6 py-3 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                    >
                      SELECT CAB
                    </button>
                  </div>
                </div>
              </div>

              {/* Fare break details drawer on click toggle */}
              <div className="border-t border-slate-50 bg-slate-50/70 p-4 sm:px-8 py-4 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? null : cab.id)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold"
                >
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>{isSelected ? 'Hide detailed fare breakdown' : 'View detailed fare breakdown'}</span>
                </button>

                {isSelected && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-inner animate-fadeIn">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Estimate</span>
                      <span className="text-sm font-bold text-slate-700 font-mono">₹{fares.basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver Allowance</span>
                      <span className="text-sm font-bold text-slate-700 font-mono">₹{fares.driverAllowance}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Toll & Taxes</span>
                      <span className="text-sm font-bold text-slate-700 font-mono">₹{fares.tollTaxEstimate}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">GST (5%)</span>
                      <span className="text-sm font-bold text-slate-700 font-mono">₹{fares.gst}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Guideline Card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex gap-4 items-start shadow-xs">
        <Sparkles className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-emerald-900 font-display">Cride Safe Shield Promise</h4>
          <p className="text-xs text-emerald-700 leading-relaxed font-medium">
            Every booking is covered with 24/7 support, trained professional partner drivers, and full GPS monitoring. No extra pricing after booking confirmation!
          </p>
        </div>
      </div>
    </div>
  );
}
