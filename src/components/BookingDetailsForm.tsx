import React, { useState } from 'react';
import { CabInfo, BookingSearch } from '../types';
import { User, Phone, Mail, MapPin, CreditCard, ChevronLeft, ShieldCheck, Ticket } from 'lucide-react';

interface BookingDetailsFormProps {
  search: BookingSearch;
  selectedCab: CabInfo;
  fareBreakdown: {
    basePrice: number;
    driverAllowance: number;
    tollTaxEstimate: number;
    gst: number;
    discount: number;
    totalPrice: number;
  };
  onSubmit: (details: {
    passengerName: string;
    passengerPhone: string;
    passengerEmail: string;
    pickupAddress: string;
    dropAddress: string;
    paymentOption: 'pay-full' | 'pay-advance' | 'pay-later';
  }) => void;
  onBack: () => void;
}

export default function BookingDetailsForm({
  search,
  selectedCab,
  fareBreakdown,
  onSubmit,
  onBack
}: BookingDetailsFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState(search.toCity ? `Main center, ${search.toCity}` : '');
  const [paymentOption, setPaymentOption] = useState<'pay-full' | 'pay-advance' | 'pay-later'>('pay-later');
  
  // Custom discount promo code simulation
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'CRIDE100' || promoCode.toUpperCase() === 'CABBAZAR') {
      setPromoApplied(true);
      setPromoStatus('success');
      setPromoDiscount(100);
    } else {
      setPromoStatus('failed');
      setPromoApplied(false);
      setPromoDiscount(0);
      setTimeout(() => setPromoStatus('idle'), 2000);
    }
  };

  const currentTotalPrice = fareBreakdown.totalPrice - promoDiscount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter Passenger Name.');
    if (!phone.trim() || phone.length < 10) return alert('Please enter a valid 10-digit Phone Number.');
    if (!email.trim() || !email.includes('@')) return alert('Please enter a valid Email Address.');
    if (!pickupAddress.trim()) return alert('Please enter the Detailed Pickup Address.');

    onSubmit({
      passengerName: name.trim(),
      passengerPhone: phone.trim(),
      passengerEmail: email.trim(),
      pickupAddress: pickupAddress.trim(),
      dropAddress: dropAddress.trim(),
      paymentOption
    });
  };

  return (
    <div id="booking-details-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form Fields */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-400 hover:text-slate-800 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Passenger & Journey Details
            </h3>
            <p className="text-xs text-slate-500 font-medium">Please fulfill credentials to generate mock cab coordinates</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contact Information
            </h4>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Passenger Full Name
              </label>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                <User className="text-slate-400 w-4 h-4 mr-3 shrink-0" />
                <input
                  type="text"
                  id="input-passenger-name"
                  required
                  placeholder="e.g. Ramesh Patel"
                  className="bg-transparent w-full focus:outline-none text-slate-800 text-sm font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mobile Number (With +91)
                </label>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                  <Phone className="text-slate-400 w-4 h-4 mr-3 shrink-0" />
                  <input
                    type="tel"
                    id="input-passenger-phone"
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    className="bg-transparent w-full focus:outline-none text-slate-800 text-sm font-medium font-mono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                  <Mail className="text-slate-400 w-4 h-4 mr-3 shrink-0" />
                  <input
                    type="email"
                    id="input-passenger-email"
                    required
                    placeholder="ramesh@gmail.com"
                    className="bg-transparent w-full focus:outline-none text-slate-800 text-sm font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Addresses */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Exact Address Specifications
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 col-span-12">
                Detailed Pickup Address in {search.fromCity}
              </label>
              <div className="relative flex items-start bg-slate-50 border border-slate-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                <MapPin className="text-amber-500 w-4 h-4 mr-3 shrink-0 mt-1" />
                <textarea
                  id="input-pickup-address"
                  required
                  rows={2}
                  placeholder="e.g. Apt 405, Block C, Silver Woods, Main Road near Metro Gate"
                  className="bg-transparent w-full focus:outline-none text-slate-800 text-sm font-medium resize-none"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                />
              </div>
            </div>

            {search.toCity && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Drop Address or Landmark in {search.toCity}
                </label>
                <div className="relative flex items-start bg-slate-50 border border-slate-200 focus-within:border-amber-500 focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                  <MapPin className="text-emerald-500 w-4 h-4 mr-3 shrink-0 mt-1" />
                  <textarea
                    id="input-drop-address"
                    rows={2}
                    placeholder="e.g. Terminal 2 Airport or Specific Hotel / Landmark"
                    className="bg-transparent w-full focus:outline-none text-slate-800 text-sm font-medium resize-none"
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Payment simulation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Simulation Payment Terms
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setPaymentOption('pay-later')}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  paymentOption === 'pay-later'
                    ? 'border-amber-400 bg-amber-50/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  id="pay-later-radio"
                  checked={paymentOption === 'pay-later'}
                  onChange={() => setPaymentOption('pay-later')}
                  className="accent-amber-500 mr-2"
                />
                <label htmlFor="pay-later-radio" className="font-bold text-slate-800 text-xs sm:text-sm cursor-pointer select-none">
                  Pay Driver Later
                </label>
                <p className="text-[10px] text-slate-500 mt-1">₹0 advance needed, pay on trip completion.</p>
              </div>

              <div
                onClick={() => setPaymentOption('pay-advance')}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  paymentOption === 'pay-advance'
                    ? 'border-amber-400 bg-amber-50/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  id="pay-advance-radio"
                  checked={paymentOption === 'pay-advance'}
                  onChange={() => setPaymentOption('pay-advance')}
                  className="accent-amber-500 mr-2"
                />
                <label htmlFor="pay-advance-radio" className="font-bold text-slate-800 text-xs sm:text-sm cursor-pointer select-none">
                  Pay 20% Advance
                </label>
                <p className="text-[10px] text-slate-500 mt-1">₹{Math.round(currentTotalPrice * 0.2)} now, rest to driver.</p>
              </div>

              <div
                onClick={() => setPaymentOption('pay-full')}
                className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                  paymentOption === 'pay-full'
                    ? 'border-amber-400 bg-amber-50/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  id="pay-full-radio"
                  checked={paymentOption === 'pay-full'}
                  onChange={() => setPaymentOption('pay-full')}
                  className="accent-amber-500 mr-2"
                />
                <label htmlFor="pay-full-radio" className="font-bold text-slate-800 text-xs sm:text-sm cursor-pointer select-none">
                  Fully Prepaid
                </label>
                <p className="text-[10px] text-slate-500 mt-1">Pay full mockup fare now for immediate booking.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              id="btn-confirm-mock-booking"
              className="w-full bg-slate-900 text-amber-400 uppercase tracking-wider font-extrabold text-sm py-4 rounded-2xl shadow-xl hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Confirm & Dispatch Taxi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Fare Summary Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              Selected Vehicle
            </h4>
            <div className="flex items-center justify-between mt-2">
              <div>
                <h5 className="font-bold text-lg">{selectedCab.name}</h5>
                <span className="text-xs text-slate-400">({selectedCab.models[0]} or equivalent)</span>
              </div>
              <span className="text-3xl">
                {selectedCab.category === 'hatchback' ? '🚗' : selectedCab.category === 'sedan' ? '🚙' : selectedCab.category === 'suv' ? '🚐' : '🚘'}
              </span>
            </div>
          </div>

          {/* Pricing Break */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-medium">Estimated base rate price</span>
              <span className="font-bold font-mono text-white">₹{fareBreakdown.basePrice.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-medium">Driver allowance (All inclusive)</span>
              <span className="font-bold font-mono text-white">₹{fareBreakdown.driverAllowance}</span>
            </div>

            {fareBreakdown.tollTaxEstimate > 0 && (
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-medium">Estimated State Permis & Tolls</span>
                <span className="font-bold font-mono text-white">₹{fareBreakdown.tollTaxEstimate}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-400">
              <span className="font-medium">GST component (5%)</span>
              <span className="font-bold font-mono text-white">₹{fareBreakdown.gst}</span>
            </div>

            {fareBreakdown.discount > 0 && (
              <div className="flex justify-between items-center text-emerald-400">
                <span className="font-medium">Long journey distance discount</span>
                <span className="font-bold font-mono">-₹{fareBreakdown.discount}</span>
              </div>
            )}

            {promoApplied && (
              <div className="flex justify-between items-center text-amber-400">
                <span className="font-medium">Cride Coupon Applied</span>
                <span className="font-bold font-mono">-₹{promoDiscount}</span>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 flex justify-between items-end">
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Est. Net Fare
                </span>
                <span className="text-xs text-slate-500">Tolls & driver charges included</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                ₹{currentTotalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Coupon Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-amber-500" /> Apply Coupon Offer
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              id="input-promo-code"
              placeholder="Enter CABBAZAR or CRIDE100"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-400 w-full uppercase"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button
              type="button"
              id="btn-apply-promo"
              onClick={handleApplyPromo}
              className="bg-slate-900 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-800"
            >
              Apply
            </button>
          </div>
          {promoStatus === 'success' && (
            <p className="text-xs text-emerald-600 font-semibold">✔ Congratulations! ₹100 Flat discount applied.</p>
          )}
          {promoStatus === 'failed' && (
            <p className="text-xs text-red-600 font-semibold">❌ Invalid code. Try "CRIDE100"</p>
          )}
          <p className="text-[10px] text-slate-400 font-medium">Use code <span className="font-bold text-amber-600">CRIDE100</span> to save ₹100 on your first clone cab ride!</p>
        </div>

        {/* Safety standards bottom card */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              No Advance Cash Mandate
            </h5>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
            We do not lock our riders with mandatory payments. You are free to choose the 'Pay Driver Later' option in standard cash, UPI, or credit cards once the taxi reaches your destination safely!
          </p>
        </div>
      </div>
    </div>
  );
}
