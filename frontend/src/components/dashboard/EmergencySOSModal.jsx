import { useState } from 'react';
import { AlertOctagon, X, Radio, Phone, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function EmergencySOSModal({ isOpen, onClose, vessel }) {
  const [reason, setReason] = useState('Severe Weather / Ingress of Water');
  const [transmitting, setTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(false);

  const handleClose = () => {
    setTransmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  const coords = vessel?.location?.coordinates || [72.82, 18.96];

  const handleTransmitSOS = async () => {
    setTransmitting(true);
    try {
      await api.post('/dashboard/sos', {
        vesselId: vessel?._id,
        lat: coords[1],
        lng: coords[0],
        reason: reason,
      });
      setTransmitted(true);
      toast.success('🚨 MAYDAY DISTRESS BROADCASTED: Coast Guard MRCC and Maritime Enforcement alerted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch distress beacon');
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-500 rounded-2xl w-full max-w-lg text-white shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Siren Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
            <h2 className="font-extrabold text-lg text-white tracking-wide">
              EMERGENCY MAYDAY / DISTRESS BEACON
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-black/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!transmitted ? (
            <>
              <p className="text-sm text-gray-300">
                Triggering this transmitter broadcasts an immediate priority Mayday distress signal to the
                <span className="text-white font-semibold"> Indian Coast Guard MRCC</span> and all nearby cooperative vessels.
              </p>

              {/* Vessel Coordinates & Telemetry */}
              <div className="bg-black/40 rounded-xl p-3.5 border border-red-500/30 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Craft Name / ID:</span>
                  <span className="font-bold text-white">{vessel?.name || 'Sagar Kanya'} ({vessel?.vesselId || 'IND-MH-01-1001'})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Position:</span>
                  <span className="font-mono font-bold text-red-400">
                    {coords[1]?.toFixed(4)}°N, {coords[0]?.toFixed(4)}°E
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Transmission Frequency:</span>
                  <span className="font-mono text-marine-400">VHF Ch 16 (156.8 MHz) & AIS SAR</span>
                </div>
              </div>

              {/* Emergency Reason Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Distress Emergency Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Severe Weather / Ingress of Water">Severe Weather / Ingress of Water</option>
                  <option value="Catastrophic Engine Failure / Drifting">Catastrophic Engine Failure / Drifting</option>
                  <option value="Man Overboard (MOB) / Search & Rescue">Man Overboard (MOB) / Search & Rescue</option>
                  <option value="Fire or Explosion Onboard">Fire or Explosion Onboard</option>
                  <option value="Critical Medical Emergency">Critical Medical Emergency</option>
                  <option value="Vessel Grounding or Collision">Vessel Grounding or Collision</option>
                </select>
              </div>

              {/* Hotlines */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-900/50">
                  <p className="text-gray-400">Coast Guard MRCC</p>
                  <p className="text-base font-extrabold text-red-400 font-mono mt-0.5">1093</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/50">
                  <p className="text-gray-400">Maritime Police / 112</p>
                  <p className="text-base font-extrabold text-sky-400 font-mono mt-0.5">112</p>
                </div>
              </div>

              {/* Transmit Button */}
              <button
                onClick={handleTransmitSOS}
                disabled={transmitting}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 font-extrabold rounded-xl text-base shadow-xl shadow-red-600/40 transition-all flex items-center justify-center gap-2 glow-red"
              >
                <Radio className={`w-5 h-5 ${transmitting ? 'animate-spin' : 'animate-ping'}`} />
                <span>{transmitting ? 'BROADCASTING DISTRESS...' : 'BROADCAST MAYDAY DISTRESS'}</span>
              </button>
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/40 animate-beacon">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">MAYDAY SIGNAL BROADCASTED</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Alert received at Mumbai MRCC and Cooperative Operations Center. Search & rescue coordinates locked at
                  [{coords[1]?.toFixed(4)}°N, {coords[0]?.toFixed(4)}°E].
                </p>
              </div>

              <div className="p-3 bg-red-900/30 rounded-xl text-xs text-red-300 border border-red-700/50">
                Keep lifejackets equipped. Monitor VHF Channel 16 for Coast Guard vessel contact.
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Close Distress Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
