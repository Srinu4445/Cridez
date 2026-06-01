import React from 'react';
import { Booking } from '../types';
import { Landmark, Calendar, Clock, MapPin, Search, Trash2, Milestone, Star, Gauge, Activity } from 'lucide-react';

interface RidesDashboardProps {
  bookings: Booking[];
  onOpenTracker: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}

export default function RidesDashboard({ bookings, onOpenTracker, onCancelBooking }: RidesDashboardProps) {
  return (
    <div id="rides-dashboard-panel" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-display text-slate-900">
            My Booked Trips ({bookings.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium">Coordinate, cancel, track, or review your mock cab commissions</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-full w-fit mx-auto">
            <Search className="w-8 h-8 shrink-0" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800 font-display">No registered bookings found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              You haven't requested any cabs yet. Search our pristine cab fleet above to schedule your outstation travel dynamically!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const isActive = ['pending', 'dispatched', 'arrived', 'in-progress'].includes(booking.status);
            
            return (
              <div
                key={booking.id}
                id={`dashboard-booking-${booking.id}`}
                className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Item header */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        BOOKING ID: {booking.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {booking.selectedCab.name}
                      </h4>
                    </div>

                    {/* Badge Status */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      booking.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-amber-50 text-amber-800 border border-amber-100 animate-pulse'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Route details */}
                  <div className="space-y-2 border-l-2 border-dashed border-slate-100 pl-4 py-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-slate-600 font-semibold">{booking.search.fromCity}</span>
                    </div>
                    {booking.search.toCity && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-slate-600 font-semibold">{booking.search.toCity}</span>
                      </div>
                    )}
                  </div>

                  {/* Date specs info */}
                  <div className="flex gap-4 text-[10px] font-bold text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.search.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.search.time}</span>
                    </div>
                  </div>

                  {/* Fare specification */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Total Cost</span>
                    <span className="text-sm font-extrabold text-slate-800 font-mono">₹{booking.fareBreakdown.totalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {/* User Rating Display */}
                  {booking.userRating && (
                    <div className="flex items-center gap-1 border-t border-slate-50 pt-3 text-[10px] font-bold text-slate-500">
                      <span>RATING SUBMITTED:</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: booking.userRating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grid Item footer actions */}
                <div className="mt-5 pt-4 border-t border-slate-50 flex gap-2">
                  {isActive ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenTracker(booking)}
                        className="flex-1 bg-slate-900 text-amber-400 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Activity className="w-3.5 h-3.5 text-amber-400" /> Track Live Dispatch
                      </button>

                      <button
                        type="button"
                        onClick={() => onCancelBooking(booking.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-xl hover:text-red-700 transition-colors cursor-pointer"
                        title="Cancel Cab Booking"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenTracker(booking)}
                      className="w-full bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Review Booking Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
