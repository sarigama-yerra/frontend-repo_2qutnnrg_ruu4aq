import { useEffect, useMemo, useState } from 'react'
import { Sun, Moon, CloudRain, CloudDrizzle, Cloud, Wind, MapPin, RefreshCw, Trash2, Plus, Thermometer, Droplets, Info } from 'lucide-react'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function formatTemp(c) {
  if (c === undefined || c === null || Number.isNaN(c)) return '--'
  return `${Math.round(c)}°`
}

function IconBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-white/6 text-white/90 border border-white/10">
      {children}
    </span>
  )
}

function CoatPill({ label }) {
  return (
    <div className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-200 border border-emerald-400/20">
      {label}
    </div>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xl ${className}`}>
      {children}
    </div>
  )
}

function WeatherHeader({ onRefreshAll, count, demoMode }) {
  const now = new Date()
  const hours = now.getHours()
  const isDay = hours >= 6 && hours < 18
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-sky-900/50 via-slate-900/50 to-slate-950">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl opacity-40 " style={{background: isDay ? 'radial-gradient(circle at center, rgba(56,189,248,0.6), rgba(15,23,42,0))' : 'radial-gradient(circle at center, rgba(147,197,253,0.4), rgba(15,23,42,0))'}} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-2xl grid place-items-center border border-white/10 ${isDay ? 'bg-yellow-400/20 text-yellow-200' : 'bg-indigo-500/20 text-indigo-200'}`}>
            {isDay ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <div>
            <h1 className="text-white text-2xl font-semibold">Cat Weather</h1>
            <p className="text-white/60 text-sm">Personalized coat guidance</p>
          </div>
        </div>
        <button onClick={onRefreshAll} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <div className="mt-4 flex items-center gap-3 text-white/70 text-sm flex-wrap">
        <IconBadge>
          <Thermometer size={14} /> Live weather
        </IconBadge>
        <IconBadge>
          {count || 0} cats
        </IconBadge>
        <IconBadge>
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </IconBadge>
        {demoMode && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-200 border border-amber-400/20">
            <Info size={14}/> Demo data
          </span>
        )}
      </div>
    </div>
  )
}

function PrecipBadge({ mm }) {
  let Icon = Cloud
  let label = 'Dry'
  let color = 'text-slate-200'
  if (mm >= 0.1 && mm < 1) { Icon = CloudDrizzle; label = 'Drizzly' }
  if (mm >= 1) { Icon = CloudRain; label = 'Rainy' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-white/6 ${color} border border-white/10`}>
      <Icon size={14} /> {label}
    </span>
  )
}

function AddCatForm({ onAdded }) {
  const [form, setForm] = useState({ name: '', city: '', latitude: '', longitude: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/cats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          city: form.city || undefined,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          notes: form.notes || undefined,
          units: 'metric',
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      await res.json()
      setForm({ name: '', city: '', latitude: '', longitude: '', notes: '' })
      onAdded?.()
    } catch (err) {
      setError('Could not add cat. Please check the values and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-400/20 grid place-items-center text-emerald-200">
          <Plus size={16} />
        </div>
        <h3 className="text-white font-semibold">Add a cat</h3>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/40" required />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" value={form.city} onChange={handleChange} placeholder="City (optional)" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/40" />
          <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/40" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/40" required />
          <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes (coat length, age)" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/40" />
        </div>
        <div className="flex items-center gap-3">
          <button disabled={loading} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-60">
            {loading ? 'Saving…' : 'Save cat'}
          </button>
          {error && <span className="text-red-300 text-sm">{error}</span>}
        </div>
      </form>
    </Card>
  )
}

function CatCard({ item, onRefresh, onDelete }) {
  const { cat, weather, recommendations, error } = item

  const precipMM = weather?.precipitation_mm ?? 0

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white text-lg font-semibold">{cat?.name || 'Unknown Cat'}</h3>
            {cat?.city && (
              <span className="inline-flex items-center gap-1 text-xs text-white/70"><MapPin size={14} /> {cat.city}</span>
            )}
          </div>
          {cat?.notes && <p className="text-white/60 text-sm mb-2">{cat.notes}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="text-xs px-3 py-1.5 rounded-lg bg-white/8 border border-white/10 text-white hover:bg-white/12 transition inline-flex items-center gap-1"><RefreshCw size={14}/> Refresh</button>
          <button onClick={onDelete} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-200 border border-red-400/20 hover:bg-red-500/20 transition inline-flex items-center gap-1"><Trash2 size={14}/> Remove</button>
        </div>
      </div>

      {error ? (
        <p className="text-red-300 text-sm mt-3">{error}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold text-white leading-none">{formatTemp(weather?.temperature_c)}</div>
              <div className="text-white/70 text-sm mt-1 flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><Thermometer size={14}/> feels {formatTemp(weather?.apparent_c)}</span>
                <span className="inline-flex items-center gap-1"><Wind size={14}/> {Math.round(weather?.wind_kmh || 0)} km/h</span>
              </div>
              <div className="text-white/50 text-xs mt-1 flex items-center gap-2">
                {weather?.is_day ? <><Sun size={12}/> Daytime (outside rug)</> : <><Moon size={12}/> Night (inside rug)</>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <PrecipBadge mm={precipMM} />
              <IconBadge>
                <Droplets size={14}/> {precipMM.toFixed(1)} mm
              </IconBadge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl p-3 border border-white/10 bg-white/4">
              <div className="text-white/70 text-xs mb-1">Day recommendation</div>
              <div className="flex items-center gap-2 flex-wrap">
                <CoatPill label={recommendations.day.coat} />
                <IconBadge><Thermometer size={14}/> {Math.round(recommendations.day.adjusted_temp_c)}°C</IconBadge>
                <IconBadge>{recommendations.day.precip}</IconBadge>
              </div>
              <p className="text-white/70 text-sm mt-1">{recommendations.day.note}</p>
            </div>
            <div className="rounded-2xl p-3 border border-white/10 bg-white/4">
              <div className="text-white/70 text-xs mb-1">Night recommendation</div>
              <div className="flex items-center gap-2 flex-wrap">
                <CoatPill label={recommendations.night.coat} />
                <IconBadge><Thermometer size={14}/> {Math.round(recommendations.night.adjusted_temp_c)}°C</IconBadge>
                <IconBadge>{recommendations.night.precip}</IconBadge>
              </div>
              <p className="text-white/70 text-sm mt-1">{recommendations.night.note}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// Simple local recommendation logic for demo mode
function demoRecommend(tempC, windKmh, precipMm, isDay) {
  const windChill = tempC - Math.min(10, windKmh / 5)
  const adjusted = Math.round(windChill)
  let coat = 'Light coat'
  if (adjusted < 5) coat = 'Heavy coat'
  else if (adjusted < 12) coat = 'Medium coat'
  let precip = 'Dry'
  if (precipMm >= 0.1 && precipMm < 1) precip = 'Drizzle'
  if (precipMm >= 1) precip = 'Rain'
  const note = isDay ? 'Outside rug recommended for outdoor time.' : 'Inside rug for cozy nights.'
  return { coat, note, adjusted_temp_c: adjusted, precip }
}

function buildDemoItems() {
  const now = new Date()
  const isDay = now.getHours() >= 6 && now.getHours() < 18
  const demoCats = [
    { id: 'demo-1', name: 'Luna', city: 'London', notes: 'Short hair' },
    { id: 'demo-2', name: 'Milo', city: 'New York', notes: 'Senior cat' },
    { id: 'demo-3', name: 'Nala', city: 'Sydney', notes: 'Long hair' },
  ]

  const demoWeathers = [
    { temperature_c: 8, apparent_c: 6, wind_kmh: 15, precipitation_mm: 0.2, is_day: isDay },
    { temperature_c: 2, apparent_c: -1, wind_kmh: 22, precipitation_mm: 1.4, is_day: isDay },
    { temperature_c: 18, apparent_c: 17, wind_kmh: 10, precipitation_mm: 0, is_day: isDay },
  ]

  return demoCats.map((cat, idx) => {
    const w = demoWeathers[idx]
    return {
      cat,
      weather: w,
      recommendations: {
        day: demoRecommend(w.temperature_c, w.wind_kmh, w.precipitation_mm, true),
        night: demoRecommend(w.temperature_c - 3, w.wind_kmh, w.precipitation_mm, false),
      },
    }
  })
}

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [demoMode, setDemoMode] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    setDemoMode(false)
    try {
      const res = await fetch(`${API_URL}/api/dashboard`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) {
      // Fallback to local demo data when API is unreachable
      const demo = buildDemoItems()
      setItems(demo)
      setDemoMode(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/cats/${id}`, { method: 'DELETE' })
      load()
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(30,64,175,0.25),rgba(2,6,23,1))]">
      <div className="max-w-md mx-auto px-4 py-6 sm:max-w-2xl sm:py-10">
        <WeatherHeader onRefreshAll={load} count={items.length} demoMode={demoMode} />

        <div className="mt-6 flex flex-col gap-4">
          {loading ? (
            <Card><p className="text-white/80">Loading…</p></Card>
          ) : items.length === 0 ? (
            <Card><p className="text-white/80">No cats yet. Add one to see recommendations.</p></Card>
          ) : (
            items.map((item) => (
              <CatCard key={item.cat?.id || Math.random()} item={item} onRefresh={load} onDelete={() => handleDelete(item.cat?.id)} />
            ))
          )}

          <AddCatForm onAdded={load} />
        </div>
      </div>
    </div>
  )
}
