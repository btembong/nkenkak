import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

function getKeys(sub) {
  // Works across Chrome, Firefox, Edge
  const json = sub.toJSON()
  if (json.keys?.p256dh && json.keys?.auth) return json.keys
  // ArrayBuffer fallback
  return {
    p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
    auth:   btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
  }
}

async function saveToServer(sub, userId) {
  const keys = getKeys(sub)
  await api.post('/push/subscribe', { endpoint: sub.endpoint, keys })
}

export default function PushNotificationButton({ className = '' }) {
  const { user } = useAuth()
  const [state, setState]   = useState('unknown')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported'); return
    }
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(async sub => {
        if (sub) {
          // Already subscribed in browser — re-sync to server in case it was never saved
          if (user) {
            try { await saveToServer(sub) } catch {}
          }
          setState('subscribed')
        } else {
          setState('unsubscribed')
        }
      })
    ).catch(() => setState('unsupported'))
  }, [user])

  const toggle = async () => {
    if (Notification.permission === 'denied') {
      toast.error('Notifications blocked — allow them in browser settings and reload.')
      return
    }
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready

      if (state === 'subscribed') {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await api.delete('/push/unsubscribe', { data: { endpoint: sub.endpoint } }).catch(() => {})
          await sub.unsubscribe()
        }
        setState('unsubscribed')
        toast.success('Push notifications disabled')
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          toast.error('Permission not granted')
          setState('denied')
          setLoading(false)
          return
        }

        // Get VAPID key then subscribe
        const { data } = await api.get('/push/vapid-key')
        if (!data.publicKey) throw new Error('No VAPID key from server')

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        })

        await saveToServer(sub)
        setState('subscribed')
        toast.success('Push notifications enabled!')
      }
    } catch (e) {
      console.error('Push toggle error:', e)
      toast.error(e.response?.data?.error || e.message || 'Could not change notification setting')
    } finally {
      setLoading(false)
    }
  }

  if (!user || state === 'unsupported' || state === 'unknown') return null

  const isOn = state === 'subscribed'

  return (
    <button onClick={toggle} disabled={loading}
      title={isOn ? 'Disable push notifications' : 'Enable push notifications'}
      className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${className}`}
      style={{
        background: isOn ? 'rgba(240,165,0,0.12)' : 'rgba(91,45,142,0.08)',
        color:      isOn ? '#C87800' : '#5B2D8E',
        border:     `1px solid ${isOn ? 'rgba(240,165,0,0.2)' : 'rgba(91,45,142,0.15)'}`,
      }}>
      {loading
        ? <i className="fas fa-spinner animate-spin text-xs"/>
        : <i className={`fas ${isOn ? 'fa-bell' : 'fa-bell-slash'} text-xs`}/>}
      {isOn ? 'Push On' : 'Enable Push'}
    </button>
  )
}
