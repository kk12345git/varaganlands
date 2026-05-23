// ── Notification helpers: WhatsApp deep-link + EmailJS ──────────────────────

const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP
const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL
const APP_URL        = import.meta.env.VITE_APP_URL || 'https://Varagan.in'

// ─── WhatsApp (opens wa.me link — works on mobile & desktop) ─────────────────

export function sendWhatsAppToAdmin(message) {
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encoded}`, '_blank')
}

export function notifyAdminNewListing(listing, sellerName, sellerPhone) {
  const msg = `🏡 *New Listing - Varagan*\n\n` +
    `📋 *${listing.title}*\n` +
    `📍 ${listing.district}, ${listing.taluk || ''}\n` +
    `📐 ${listing.area_value} ${listing.area_unit}\n` +
    `💰 ₹${Number(listing.price).toLocaleString('en-IN')}\n\n` +
    `👤 Seller: ${sellerName}\n` +
    `📞 Phone: ${sellerPhone}\n\n` +
    `🔗 Admin Panel: ${APP_URL}/admin/listings\n\n` +
    `_Please review and approve/reject this listing._`
  sendWhatsAppToAdmin(msg)
}

export function notifyAdminNewInquiry(listing, inquiry) {
  const msg = `📩 *New Inquiry - Varagan*\n\n` +
    `🏡 Listing: *${listing.title}*\n` +
    `📍 ${listing.district}\n\n` +
    `👤 Buyer: ${inquiry.buyer_name}\n` +
    `📞 Phone: ${inquiry.buyer_phone}\n` +
    `✉️ Email: ${inquiry.buyer_email || 'N/A'}\n\n` +
    `💬 Message: ${inquiry.message || 'No message'}\n\n` +
    `🔗 ${APP_URL}/admin/inquiries`
  sendWhatsAppToAdmin(msg)
}

export function notifySellerWhatsApp(sellerPhone, status, listingTitle, reason) {
  const isApproved = status === 'approved'
  const msg = isApproved
    ? `✅ *வாழ்த்துக்கள்! Your listing is APPROVED*\n\n` +
      `🏡 "${listingTitle}"\n\n` +
      `உங்கள் property இப்போது live ஆகிவிட்டது!\n` +
      `🔗 ${APP_URL}/listings`
    : `❌ *Listing Rejected - Varagan*\n\n` +
      `🏡 "${listingTitle}"\n\n` +
      `காரணம்: ${reason || 'Please contact admin for details'}\n\n` +
      `Corrections செய்து மீண்டும் submit செய்யலாம்.\n` +
      `📞 Admin: ${ADMIN_WHATSAPP}`
  const encoded = encodeURIComponent(msg)
  window.open(`https://wa.me/${sellerPhone}?text=${encoded}`, '_blank')
}

// ─── EmailJS ──────────────────────────────────────────────────────────────────
// Install: npm install @emailjs/browser
// Or use the CDN in index.html

export async function sendEmailNotification({ to, subject, body }) {
  try {
    const { default: emailjs } = await import('@emailjs/browser')
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      { to_email: to, subject, message: body },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
  } catch (err) {
    console.warn('Email notification failed (EmailJS not configured?):', err.message)
  }
}

export async function emailAdminNewListing(listing, sellerName) {
  await sendEmailNotification({
    to: ADMIN_EMAIL,
    subject: `[Varagan] New listing pending review: ${listing.title}`,
    body: `New listing submitted:\n\nTitle: ${listing.title}\nDistrict: ${listing.district}\nArea: ${listing.area_value} ${listing.area_unit}\nPrice: ₹${Number(listing.price).toLocaleString('en-IN')}\nSeller: ${sellerName}\n\nReview at: ${APP_URL}/admin/listings`,
  })
}

// ─── Supabase in-app notifications ───────────────────────────────────────────
import { supabase } from './supabase'

export async function createNotification(userId, type, title, body, metadata = {}) {
  await supabase.from('notifications').insert({ user_id: userId, type, title, body, metadata })
}

