import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Phone, MessageCircle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  new:       'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  closed:    'bg-gray-50 text-gray-500 border-gray-200',
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')

  useEffect(() => { loadInquiries() }, [])

  const loadInquiries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, listings(title, district, images)')
      .order('created_at', { ascending: false })
    if (!error) setInquiries(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('inquiries').update({ status }).eq('id', id)
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    toast.success('Status updated')
  }

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-500 text-sm mt-1">{inquiries.length} total inquiries</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {['all','new','contacted','closed'].map(s => (
          <button key={s} onClick={()=>setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition
                        ${filter===s ? 'bg-forest-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            {s} ({s==='all'?inquiries.length:inquiries.filter(i=>i.status===s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium text-gray-600">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inq => (
            <div key={inq.id} className="card p-5 hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-4 flex-wrap">
                {/* Listing thumb */}
                <div className="w-14 h-14 bg-forest-50 rounded-xl overflow-hidden flex-shrink-0">
                  {inq.listings?.images?.[0]
                    ? <img src={inq.listings.images[0]} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center">🏡</div>
                  }
                </div>

                {/* Inquiry info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge ${STATUS_COLORS[inq.status]}`}>{inq.status}</span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(inq.created_at), 'dd MMM yyyy, h:mm a')}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">{inq.buyer_name}</p>
                  <p className="text-sm text-gray-500">
                    Re: <a href={`/listings/${inq.listing_id}`} target="_blank" rel="noreferrer"
                      className="text-forest-600 hover:underline">
                      {inq.listings?.title} <ExternalLink size={11} className="inline"/>
                    </a>
                  </p>
                  {inq.message && (
                    <p className="text-sm text-gray-600 mt-1.5 italic">"{inq.message}"</p>
                  )}
                </div>

                {/* Contact + status */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex gap-1.5">
                    <a href={`tel:${inq.buyer_phone}`}
                      className="flex items-center gap-1 py-1.5 px-3 bg-forest-600 text-white rounded-lg text-xs font-medium hover:bg-forest-700 transition">
                      <Phone size={12}/>{inq.buyer_phone}
                    </a>
                    <a href={`https://wa.me/${inq.buyer_phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${inq.buyer_name}, regarding your inquiry about "${inq.listings?.title}" on Varagan.`)}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 py-1.5 px-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition">
                      <MessageCircle size={12}/>WA
                    </a>
                  </div>
                  <select value={inq.status} onChange={e=>updateStatus(inq.id,e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white cursor-pointer">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

