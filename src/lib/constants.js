export const TN_DISTRICTS = [
  'Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore',
  'Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram',
  'Kanyakumari','Karur','Krishnagiri','Madurai','Mayiladuthurai',
  'Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai',
  'Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi',
  'Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli',
  'Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur',
  'Vellore','Villupuram','Virudhunagar'
]

export const LAND_TYPES = [
  { value: 'agricultural', label: 'Agricultural / விவசாய நிலம்',  icon: '🌾' },
  { value: 'residential',  label: 'Residential / குடியிருப்பு',   icon: '🏘️' },
  { value: 'commercial',   label: 'Commercial / வணிக நிலம்',      icon: '🏪' },
  { value: 'industrial',   label: 'Industrial / தொழில் நிலம்',    icon: '🏭' },
  { value: 'plantation',   label: 'Plantation / தோட்ட நிலம்',    icon: '🌴' },
]

export const AREA_UNITS = [
  { value: 'cent',   label: 'Cent',   toSqft: 435.56 },
  { value: 'acre',   label: 'Acre',   toSqft: 43560  },
  { value: 'sqft',   label: 'Sq.ft',  toSqft: 1      },
  { value: 'ground', label: 'Ground', toSqft: 2400   },
  { value: 'guntha', label: 'Guntha', toSqft: 1089   },
]

export const WATER_SOURCES = [
  'Bore well','Open well','Canal','River','Pond','Rain-fed','None'
]

export const STATUS_COLORS = {
  pending:  'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-forest-100 text-forest-700 border-forest-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  sold:     'bg-gray-100 text-gray-600 border-gray-200',
}

export const STATUS_LABELS = {
  pending:  'Pending Review',
  approved: 'Approved ✅',
  rejected: 'Rejected ❌',
  sold:     'Sold 🏷️',
}

export function formatPrice(price) {
  if (!price) return '₹0'
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000)   return `₹${(price / 100000).toFixed(2)} L`
  return `₹${Number(price).toLocaleString('en-IN')}`
}

export function formatArea(value, unit) {
  return `${value} ${unit}`
}
