import React, { useState, useEffect, useRef } from 'react';
import { Booking, Driver } from '../types';
import { Mail, Phone, Navigation, Landmark, MapPin, Gauge, Download, Star, Sparkles, Send } from 'lucide-react';

interface MapSimulationProps {
  booking: Booking;
  onUpdateStatus: (bookingId: string, status: Booking['status'], extra?: Partial<Booking>) => void;
  onClose: () => void;
}

export default function MapSimulation({ booking, onUpdateStatus, onClose }: MapSimulationProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [simulatedKmRemaining, setSimulatedKmRemaining] = useState<number>(booking.search.toCity ? 25 : 8);
  const [speed, setSpeed] = useState<number>(0);
  const [etaMins, setEtaMins] = useState<number>(12);
  const [progressIndex, setProgressIndex] = useState<number>(0);

  // For star rating
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // SVG route path points
  const [pts, setPts] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    // Generate an elegant winding road coordinate system inside standard viewbounds (e.g. 500x300 canvas)
    const points = [];
    const count = 30;
    
    // Deterministic sine-wave road path connecting Left-Center (Source) to Right-Center (Dest)
    for (let i = 0; i <= count; i++) {
      const ratio = i / count;
      const x = 50 + ratio * 400; // between 50 and 450
      
      // Let's create an elegant wave
      const y = 150 + Math.sin(ratio * Math.PI * 2.5) * 60;
      points.push({ x, y });
    }
    setPts(points);
  }, []);

  // Sync statuses through timers to simulate a realistic cab ride!
  useEffect(() => {
    // Auto populate random driver from booking or generate new one
    if (booking.driver) {
      setDriver(booking.driver);
    }

    let intervalId: any;
    
    // Step transitions:
    // 0: Dispatching (Pending) -> 1: Cab Dispatched (10s) -> 2: Arrived at Pickup (20s) -> 3: Ride Started (35s) -> 4: Completed
    const timer1 = setTimeout(() => {
      onUpdateStatus(booking.id, 'dispatched');
      setActiveStep(1);
      setSpeed(45);
      setEtaMins(5);
    }, 4500);

    const timer2 = setTimeout(() => {
      onUpdateStatus(booking.id, 'arrived');
      setActiveStep(2);
      setSpeed(0);
      setEtaMins(0);
    }, 11000);

    const timer3 = setTimeout(() => {
      onUpdateStatus(booking.id, 'in-progress');
      setActiveStep(3);
      setSpeed(68);
      setEtaMins(booking.search.toCity ? 38 : 12);
    }, 18000);

    // Dynamic incremental movement along path if in-progress
    intervalId = setInterval(() => {
      if (activeStep === 3 && progressIndex < pts.length - 1) {
        setProgressIndex(prev => {
          const next = prev + 1;
          if (next >= pts.length - 1) {
            // Arrived at destination
            onUpdateStatus(booking.id, 'completed');
            setActiveStep(4);
            setSpeed(0);
            setEtaMins(0);
            setSimulatedKmRemaining(0);
            return pts.length - 1;
          }
          // Decrement remaining fuel / KMs
          setSimulatedKmRemaining(prevKm => Math.max(0, parseFloat((prevKm - 1.2).toFixed(1))));
          // Dynamic moderate speed variations
          setSpeed(Math.round(60 + Math.random() * 15));
          return next;
        });
      }
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(intervalId);
    };
  }, [activeStep, pts]);

  const currentCabCoords = pts[progressIndex] || { x: 50, y: 150 };

  const handleDownloadInvoice = () => {
    // Create simple data uri to download plain text receipt
    const receiptContent = `
    ======================================
                 CRIDE TAXI BILL          
            (Rebranded CabBazar Clone)    
    ======================================
    Booking ID: ${booking.id}
    Date: ${booking.search.date} ${booking.search.time}
    Customer: ${booking.passengerName}
    Contact: ${booking.passengerPhone}
    Cab Category: ${booking.selectedCab.name}
    Route: ${booking.search.fromCity} -> ${booking.search.toCity || 'Local Rental'}
    
    --------------------------------------
    Base Rent Fare: ₹${booking.fareBreakdown.basePrice}
    Driver Allowance: ₹${booking.fareBreakdown.driverAllowance}
    State Toll Charges: ₹${booking.fareBreakdown.tollTaxEstimate}
    GST Components (5%): ₹${booking.fareBreakdown.gst}
    Less Coupon/Discounts: -₹${booking.fareBreakdown.discount}
    --------------------------------------
    TOTAL PAID SECURELY: ₹${booking.fareBreakdown.totalPrice}
    --------------------------------------
    Thank you for riding with Cride Compliance!
    Licensed under Cabbazar standard schemas.
    ======================================
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cride-Booking-${booking.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    // Persist user reviews onto booking state
    onUpdateStatus(booking.id, 'completed', {
      userRating: rating,
      userFeedback: feedback
    });
  };

  return (
    <div id="simulation-frame" className="space-y-6">
      {/* Simulation Header Indicators */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between bg-slate-900 border border-slate-700 text-white rounded-3xl p-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 p-2.5 rounded-2xl text-slate-950 animate-bounce">
            <Navigation className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg font-display">Real-Time Cab Dispatch Tracker</h3>
            <p className="text-[10px] text-slate-400 font-mono">BOOKING ID: {booking.id}</p>
          </div>
        </div>

        {/* Live Status indicator pills */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold font-mono text-emerald-400 tracking-wider uppercase select-none">
            {booking.status === 'pending' && 'Searching Cab Near You...'}
            {booking.status === 'dispatched' && 'Cab Dispatched'}
            {booking.status === 'arrived' && 'Driver Arrived at Pickup'}
            {booking.status === 'in-progress' && 'Trip In Progress'}
            {booking.status === 'completed' && 'Trip Completed Successfully'}
          </span>
        </div>
      </div>

      {/* Main Grid: Map canvas visualizer + Driver card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid: SVG Vector Simulated Map */}
        <div ref={containerRef} className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden h-[340px] shadow-2xl flex flex-col justify-between">
          
          {/* Subtle Cybernetic Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none" style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />

          {/* Map Controls HUD top block */}
          <div className="relative z-10 flex justify-between text-white">
            <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 shadow-md backdrop-blur-xs">
              <MapPin className="text-amber-400 w-4 h-4" />
              <div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Source Pickup</span>
                <span className="text-xs font-bold font-display">{booking.search.fromCity}</span>
              </div>
            </div>

            {booking.search.toCity && (
              <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 shadow-md backdrop-blur-xs text-right">
                <div className="mr-1">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Destination Drop</span>
                  <span className="text-xs font-bold font-display">{booking.search.toCity}</span>
                </div>
                <MapPin className="text-emerald-400 w-4 h-4" />
              </div>
            )}
          </div>

          {/* SVG Vector Map Lane Render */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-44 pointer-events-none">
            <svg className="w-full h-full p-2" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Core road connector lines */}
              {pts.length > 1 && (
                <>
                  {/* Road Shadow */}
                  <path
                    d={`M ${pts.map(p => `${p.x} ${p.y - 45}`).join(' L ')}`}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-70"
                  />
                  {/* Road Base core */}
                  <path
                    d={`M ${pts.map(p => `${p.x} ${p.y - 45}`).join(' L ')}`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Road centerline divider dashes */}
                  <path
                    d={`M ${pts.map(p => `${p.x} ${p.y - 45}`).join(' L ')}`}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="6,8"
                    strokeLinecap="round"
                    className="opacity-80"
                  />
                  
                  {/* Glowing Pulse lines animation mimicking dynamic traffic streams */}
                  <path
                    d={`M ${pts.map(p => `${p.x} ${p.y - 45}`).join(' L ')}`}
                    fill="none"
                    stroke="url(#roadGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-40 animate-strokeDash"
                  />
                </>
              )}

              {/* Source Beacon Marker */}
              <circle cx="50" cy={(pts[0]?.y || 150) - 45} r="6" fill="#fbbf24" className="animate-ping opacity-70" />
              <circle cx="50" cy={(pts[0]?.y || 150) - 45} r="4" fill="#fbbf24" />

              {/* Destination Beacon Marker */}
              {booking.search.toCity && (
                <>
                  <circle cx="450" cy={(pts[pts.length - 1]?.y || 150) - 45} r="6" fill="#10b981" className="animate-ping opacity-70" />
                  <circle cx="450" cy={(pts[pts.length - 1]?.y || 150) - 45} r="4" fill="#10b981" />
                </>
              )}

              {/* Moving Cab Icon */}
              {pts.length > 0 && (
                <g transform={`translate(${currentCabCoords.x}, ${currentCabCoords.y - 45})`}>
                  <circle r="12" fill="#fbbf24" className="opacity-20 animate-pulse" />
                  <circle r="8" fill="#fbbf24" className="shadow-lg" />
                  <text y="4" fontSize="10" textAnchor="middle" className="select-none">🚕</text>
                </g>
              )}

              {/* Gradients */}
              <defs>
                <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Telemetry HUD Bottom line */}
          <div className="relative z-10 flex items-end justify-between text-white text-xs pt-4 font-mono">
            <div className="flex gap-4">
              <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-[8px] text-slate-500 font-bold">LIVE SPEED</span>
                  <span className="font-bold text-white">{speed} km/h</span>
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-[8px] text-slate-500 font-bold">REMAINING DISTANCE</span>
                  <span className="font-bold text-white">{simulatedKmRemaining} km</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-xl text-right">
              <span className="block text-[8px] text-slate-500 font-bold">ESTIMATED COMPLETION ETA</span>
              <span className="font-bold text-amber-400 font-mono">{etaMins} mins approx</span>
            </div>
          </div>
        </div>

        {/* Right Grid: Active Step Info / Driver detail / Completing Rating feedback */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Active Status Info card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4 flex-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Simulated Active Progress</h4>
            
            {/* Timeline track list */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep >= 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {activeStep >= 1 ? '✔' : '1'}
                  </div>
                  <div className={`w-0.5 h-6 ${activeStep >= 2 ? 'bg-amber-400' : 'bg-slate-100'}`} />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800">Dispatching Partner Cab</h5>
                  <p className="text-[10px] text-slate-500 font-medium">Matching professional drivers near source</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep >= 2 ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {activeStep >= 2 ? '✔' : '2'}
                  </div>
                  <div className={`w-0.5 h-6 ${activeStep >= 3 ? 'bg-amber-400' : 'bg-slate-100'}`} />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800">Cab Is Arriving at Pickup</h5>
                  <p className="text-[10px] text-slate-500 font-medium">Taxi boardings and license confirmation</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep >= 3 ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {activeStep >= 3 ? '✔' : '3'}
                  </div>
                  <div className={`w-0.5 h-6 ${activeStep >= 4 ? 'bg-amber-400' : 'bg-slate-100'}`} />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800">Trip Commencing (In Route)</h5>
                  <p className="text-[10px] text-slate-500 font-medium">Safe driving along National Highway routes</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep >= 4 ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {activeStep >= 4 ? '✔' : '4'}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800">Arrived at Destination</h5>
                  <p className="text-[10px] text-slate-500 font-medium">Safe drop-off completed. Feedback open.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Driver Panel OR Completed Feedback Form */}
          {activeStep < 4 ? (
            driver && (
              <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    referrerPolicy="no-referrer"
                    src={driver.photo}
                    alt={driver.name}
                    className="w-11 h-11 rounded-full object-cover border border-amber-400 shrink-0"
                  />
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">ASSIGNED CRIDE DRIVER</h5>
                    <h4 className="text-sm font-bold font-display">{driver.name}</h4>
                    <span className="bg-slate-800 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block uppercase font-mono">
                      {driver.vehicleNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <a
                    href={`tel:${driver.phone}`}
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl border border-slate-700 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> Call Partner
                  </a>
                  <div className="flex items-center justify-center gap-1.5 bg-slate-800 py-2.5 rounded-xl border border-slate-700 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {driver.rating} Score
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Completed Trip Interface: Rating, Invoice Download, and close */
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-4">
              <div className="text-center space-y-1">
                <Sparkles className="w-7 h-7 text-amber-400 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold font-display">How was your Cride journey?</h4>
                <p className="text-[10px] text-slate-400 font-medium">We appreciate your feedback and ratings</p>
              </div>

              {!feedbackSubmitted ? (
                <form onSubmit={submitFeedback} className="space-y-3">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-1 hover:scale-110 shrink-0 transition-transform cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Comment your review and hints..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-500 font-semibold"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-400 text-slate-950 hover:bg-amber-500 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit & Save Trip
                  </button>
                </form>
              ) : (
                <p className="text-xs text-center text-emerald-400 font-bold select-none py-2">
                  Thank you! Your rating has been received.
                </p>
              )}

              <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold border border-slate-700/60 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" /> Save Trip PDF Invoice
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-slate-400 hover:text-white text-xs font-semibold py-1 hover:underline"
                >
                  Return to Main Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
