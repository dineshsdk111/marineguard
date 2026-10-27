import { Cloud, Wind, Droplets, Sun, Compass, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WeatherMarquee({ weather }) {
  if (!weather) return null;

  const windKnots = weather.windSpeed ? (weather.windSpeed / 1.852).toFixed(1) : '0';
  const isRoughSea = weather.windSpeed > 28;

  return (
    <div className="card relative overflow-hidden bg-gradient-to-r from-marine-700 via-marine-800 to-navy-900 text-white border-0 shadow-lg">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        {/* Left: Weather Main */}
        <div className="flex items-center gap-5">
          <div className="text-5xl filter drop-shadow-md select-none">
            {weather.icon || '🌊'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold tracking-tight">
                {weather.temperature}°C
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                isRoughSea
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {isRoughSea ? '⚠️ Sea Advisory: High Swells' : '🟢 Safe for Inshore & Offshore Sailing'}
              </span>
            </div>
            <p className="text-sm text-marine-100 font-medium capitalize mt-0.5">
              {weather.description} • Feels like {weather.feelsLike}°C • Arabian Sea Coast (Mumbai Port)
            </p>
          </div>
        </div>

        {/* Center / Right: Sea Conditions & Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto text-sm">
          <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-marine-200">
              <Wind className="w-3.5 h-3.5" />
              <span>Wind Speed</span>
            </div>
            <p className="text-base font-bold text-white mt-0.5">
              {weather.windSpeed} km/h <span className="text-xs font-normal text-marine-200">({windKnots} kts)</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-marine-200">
              <Compass className="w-3.5 h-3.5" />
              <span>Est. Swell</span>
            </div>
            <p className="text-base font-bold text-white mt-0.5">
              {isRoughSea ? '2.4 - 3.2 m' : '0.8 - 1.2 m'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-marine-200">
              <Droplets className="w-3.5 h-3.5" />
              <span>Humidity</span>
            </div>
            <p className="text-base font-bold text-white mt-0.5">
              {weather.humidity}%
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-marine-200">
              <Sun className="w-3.5 h-3.5" />
              <span>UV Index</span>
            </div>
            <p className="text-base font-bold text-white mt-0.5">
              UV {weather.uvIndex} <span className="text-xs font-normal text-marine-200">({weather.cloudCover}% cloud)</span>
            </p>
          </div>
        </div>

        {/* Link to Weather page */}
        <Link
          to="/weather"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-colors shrink-0"
        >
          <span>Marine Radar & Forecast</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
