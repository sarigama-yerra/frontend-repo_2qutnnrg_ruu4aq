import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function formatTemp(c) {
  return `${Math.round(c)}°C`
}

function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-300 border-blue-400/30',
    green: 'bg-green-500/10 text-green-300 border-green-400/30',
    yellow: 'bg-yellow-500/10 text-yellow-300 border-yellow-400/30',
    red: 'bg-red-500/10 text-red-300 border-red-400/30',
    slate: 'bg-slate-500/10 text-slate-300 border-slate-400/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${colors[color]}`}>{children}</span>
  )
}

function CoatPill({ label }) {
  return (
    <div className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-white border border-white/10">
      {label}
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5 shadow-lg">
      {children}
    </div>
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
      setError('Could not add cat. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3 className="text-white font-semibold mb-3">Add a cat</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City (optional)"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40" />
        <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40" required />
        <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40" required />
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes (coat length, age, etc.)"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 sm:col-span-2" />
        <div className="sm:col-span-2 flex items-center gap-3">
          <button disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-60">
            {loading ? 'Saving...' : 'Save cat'}
          </button>
          {error && <span className="text-red-300 text-sm">{error}</span>}
        </div>
      </form>
    </Card>
  )
}

function CatCard({ item, onRefresh, onDelete }) {
  const { cat, weather, recommendations, error } = item

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white text-lg font-semibold">{cat?.name || 'Unknown Cat'}</h3>
            {cat?.city && <Badge>{cat.city}</Badge>}
          </div>
          {cat?.notes && <p className="text-white/60 text-sm mb-2">{cat.notes}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">Refresh</button>
          <button onClick={onDelete} className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-200 border border-red-400/20 hover:bg-red-500/20 transition">Remove</button>
        </div>
      </div>

      {error ? (
        <p className="text-red-300 text-sm mt-3">{error}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-4xl font-bold text-white">{formatTemp(weather.temperature_c)}</div>
            <div className="text-white/70 text-sm">Feels like {formatTemp(weather.apparent_c)} · Wind {Math.round(weather.wind_kmh)} km/h</div>
            <div className="text-white/50 text-xs">{weather.is_day ? 'Daytime (outside rug)' : 'Night (inside rug)'}</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-white/70 text-sm">Day recommendation</div>
            <div className="flex items-center gap-2 flex-wrap">
              <CoatPill label={recommendations.day.coat} />
              <Badge color="slate">{recommendations.day.precip}</Badge>
              <Badge color="yellow">{recommendations.day.adjusted_temp_c}°C</Badge>
            </div>
            <p className="text-white/60 text-sm">{recommendations.day.note}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-white/70 text-sm">Night recommendation</div>
            <div className="flex items-center gap-2 flex-wrap">
              <CoatPill label={recommendations.night.coat} />
              <Badge color="slate">{recommendations.night.precip}</Badge>
              <Badge color="yellow">{recommendations.night.adjusted_temp_c}°C</Badge>
            </div>
            <p className="text-white/60 text-sm">{recommendations.night.note}</p>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/dashboard`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) {
      setError('Unable to reach the API. Add a cat to get recommendations.')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Cat Weather & Coat Dashboard</h1>
            <p className="text-white/60">Quick guidance for each cat — mornings and nights.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">Refresh All</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 flex flex-col gap-5">
            {loading ? (
              <Card><p className="text-white/70">Loading...</p></Card>
            ) : error ? (
              <Card><p className="text-red-300">{error}</p></Card>
            ) : items.length === 0 ? (
              <Card><p className="text-white/70">No cats yet. Add one to see recommendations.</p></Card>
            ) : (
              items.map((item) => (
                <CatCard key={item.cat?.id || Math.random()} item={item} onRefresh={load} onDelete={() => handleDelete(item.cat?.id)} />
              ))
            )}
          </div>
          <div>
            <AddCatForm onAdded={load} />
          </div>
        </div>
      </div>
    </div>
  )
}
