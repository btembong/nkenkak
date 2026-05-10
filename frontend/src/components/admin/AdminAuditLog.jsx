import { useState } from 'react'
import { useQuery } from 'react-query'
import { format, formatDistanceToNow } from 'date-fns'
import api from '../../services/api'

const ACTION_ICONS = {
  login:        { icon:'fa-sign-in-alt',   color:'#16a34a', bg:'rgba(22,163,74,0.08)'    },
  logout:       { icon:'fa-sign-out-alt',  color:'#737373', bg:'rgba(115,115,115,0.08)'  },
  create:       { icon:'fa-plus-circle',   color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'    },
  update:       { icon:'fa-edit',          color:'#0284c7', bg:'rgba(2,132,199,0.08)'    },
  delete:       { icon:'fa-trash',         color:'#dc2626', bg:'rgba(220,38,38,0.08)'    },
  publish:      { icon:'fa-check-circle',  color:'#16a34a', bg:'rgba(22,163,74,0.08)'    },
  approve:      { icon:'fa-thumbs-up',     color:'#16a34a', bg:'rgba(22,163,74,0.08)'    },
  reject:       { icon:'fa-times-circle',  color:'#dc2626', bg:'rgba(220,38,38,0.08)'    },
  donate:       { icon:'fa-heart',         color:'#F0A500', bg:'rgba(240,165,0,0.08)'    },
  ban:          { icon:'fa-ban',           color:'#dc2626', bg:'rgba(220,38,38,0.08)'    },
  default:      { icon:'fa-circle',        color:'#A3A3A3', bg:'rgba(163,163,163,0.08)'  },
}

function getActionStyle(action) {
  const key = Object.keys(ACTION_ICONS).find(k => action?.toLowerCase().includes(k)) || 'default'
  return ACTION_ICONS[key]
}

export default function AdminAuditLog() {
  const [search,   setSearch]   = useState('')
  const [actionF,  setActionF]  = useState('all')
  const [expanded, setExpanded] = useState(null)

  const { data: logs, isLoading } = useQuery('audit-logs',
    () => api.get('/admin/audit-logs').then(r => r.data), { staleTime: 15000 })

  const actions = logs ? [...new Set(logs.map(l => l.action))].sort() : []

  const filtered = logs?.filter(l => {
    const matchSearch = !search ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.resource?.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionF === 'all' || l.action === actionF
    return matchSearch && matchAction
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
          <i className="fas fa-history text-sm text-white"/>
        </div>
        <div>
          <h2 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Audit Log</h2>
          <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
            {logs?.length || 0} events recorded
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{color:'#A3A3A3'}}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by action, user, or resource…" className="input !pl-10"/>
        </div>
        <select value={actionF} onChange={e => setActionF(e.target.value)} className="input sm:w-44">
          <option value="all">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Log entries */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>
          ))}
        </div>
      ) : filtered?.length ? (
        <div className="card overflow-hidden">
          <div className="divide-y" style={{divideColor:'rgba(91,45,142,0.05)'}}>
            {filtered.map((log, i) => {
              const style = getActionStyle(log.action)
              const isExpanded = expanded === log.id
              return (
                <div key={log.id || i}
                  className="transition-colors hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : log.id)}>
                  <div className="flex items-center gap-4 px-5 py-3.5">
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{background:style.bg}}>
                      <i className={`fas ${style.icon} text-sm`} style={{color:style.color}}/>
                    </div>

                    {/* Action + user */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-semibold text-sm capitalize" style={{color:'#1A0A35'}}>
                          {log.action?.replace(/_/g,' ')}
                        </span>
                        {log.resource && (
                          <span className="tag !text-[9px] capitalize">{log.resource}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] mt-0.5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                        {log.user_name && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-user text-[8px]" style={{color:'#5B2D8E'}}/>
                            {log.user_name}
                          </span>
                        )}
                        {log.ip_address && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-map-marker-alt text-[8px]"/>
                            {log.ip_address}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
                        {log.createdAt ? formatDistanceToNow(new Date(log.createdAt)) + ' ago' : '—'}
                      </div>
                      <div className="text-[10px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                        {log.createdAt ? format(new Date(log.createdAt),'MMM d, h:mm a') : ''}
                      </div>
                    </div>

                    {/* Expand chevron */}
                    <i className={`fas fa-chevron-${isExpanded?'up':'down'} text-[10px] flex-shrink-0 transition-transform`}
                      style={{color:'#A3A3A3'}}/>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-5 pb-4 animate-fade-in">
                      <div className="rounded-2xl p-4 space-y-2" style={{background:'rgba(91,45,142,0.03)',border:'1px solid rgba(91,45,142,0.08)'}}>
                        <div className="grid grid-cols-2 gap-3 text-xs" style={{fontFamily:'Poppins,sans-serif'}}>
                          <div>
                            <span className="font-semibold" style={{color:'#5B2D8E'}}>Action: </span>
                            <span style={{color:'#525252'}}>{log.action}</span>
                          </div>
                          {log.resource && (
                            <div>
                              <span className="font-semibold" style={{color:'#5B2D8E'}}>Resource: </span>
                              <span style={{color:'#525252'}} className="capitalize">{log.resource}</span>
                            </div>
                          )}
                          {log.resource_id && (
                            <div>
                              <span className="font-semibold" style={{color:'#5B2D8E'}}>Resource ID: </span>
                              <span style={{color:'#525252'}} className="font-mono text-[10px]">{log.resource_id}</span>
                            </div>
                          )}
                          {log.user_name && (
                            <div>
                              <span className="font-semibold" style={{color:'#5B2D8E'}}>Performed by: </span>
                              <span style={{color:'#525252'}}>{log.user_name}</span>
                            </div>
                          )}
                          {log.ip_address && (
                            <div>
                              <span className="font-semibold" style={{color:'#5B2D8E'}}>IP Address: </span>
                              <span style={{color:'#525252'}} className="font-mono text-[10px]">{log.ip_address}</span>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="font-semibold" style={{color:'#5B2D8E'}}>Timestamp: </span>
                            <span style={{color:'#525252'}}>{format(new Date(log.createdAt),'MMMM d, yyyy · h:mm:ss a')}</span>
                          </div>
                        </div>
                        {log.details && (
                          <div>
                            <div className="text-xs font-semibold mb-1" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>Details:</div>
                            <pre className="text-[10px] rounded-xl p-3 overflow-x-auto" style={{background:'rgba(91,45,142,0.05)',color:'#525252',fontFamily:'JetBrains Mono,monospace'}}>
                              {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
          <i className="fas fa-history text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.15)'}}/>
          <h4 className="font-display font-semibold mb-2" style={{color:'#737373'}}>No audit logs yet</h4>
          <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Admin actions will be recorded here automatically</p>
        </div>
      )}

      {/* Pagination / load more hint */}
      {filtered?.length >= 100 && (
        <p className="text-center text-xs mt-4" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
          Showing last 100 events. Older records are stored in the database.
        </p>
      )}
    </div>
  )
}
