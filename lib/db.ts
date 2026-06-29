/**
 * Unified DB layer — automatically uses real Supabase when credentials are
 * configured, otherwise falls back to mock data.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const IS_MOCK =
  !SUPABASE_URL ||
  SUPABASE_URL.includes('your-project-id') ||
  SUPABASE_URL === ''

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Listing {
  id: string
  seller_id: string
  title: string
  description: string
  brand: string
  cycle_type: string
  condition: string
  price: number            // asking price (sale mode)
  age_months: number
  pickup_location: string
  status: 'active' | 'sold' | 'rented' | 'deleted'
  listing_mode: 'sale' | 'rent'
  // Rental fields (only populated when listing_mode === 'rent')
  rent_per_day?: number
  rent_per_week?: number
  rent_per_month?: number
  security_deposit?: number
  min_rental_days?: number
  is_available?: boolean
  created_at: string
  seller_name?: string
  seller_hostel?: string
  image_url?: string
}

export interface Profile {
  id: string
  college_email: string
  full_name: string
  hostel: string
  year: string
  branch: string
  is_verified: boolean
  created_at: string
}

export interface Message {
  id: string
  listing_id: string
  sender_id: string
  receiver_id: string
  text: string
  created_at: string
}

// ─── Mock Sale Listings ────────────────────────────────────────────────────────

const MOCK_SALE_LISTINGS: Listing[] = [
  {
    id: 'listing-uuid-1',
    seller_id: 'seller-uuid-1',
    title: 'Firefox Target 21-Speed Hybrid',
    description:
      'Perfect condition Firefox hybrid cycle. Bought 10 months ago, used mostly for commuting from JGB hostel. Smooth gear shifts, dual disc brakes, recently serviced.',
    brand: 'Firefox',
    cycle_type: 'hybrid',
    condition: 'like_new',
    price: 8500,
    age_months: 10,
    pickup_location: 'JGB Hostel Parking',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Aman Verma',
    seller_hostel: 'JGB',
    image_url:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-23T12:00:00.000Z',
  },
  {
    id: 'listing-uuid-2',
    seller_id: 'seller-uuid-2',
    title: 'Atlas Asteroid Mountain Bike',
    description:
      'Sturdy mountain bike, great suspension, wide tires with excellent grip. Ideal for TIET campus pathways. Giving away because graduating.',
    brand: 'Atlas',
    cycle_type: 'mountain',
    condition: 'good',
    price: 4200,
    age_months: 24,
    pickup_location: 'MGG Hostel Gate',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Simran Kaur',
    seller_hostel: 'MGG',
    image_url:
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-23T13:00:00.000Z',
  },
  {
    id: 'listing-uuid-3',
    seller_id: 'seller-uuid-1',
    title: 'Btwin Triban RC100 Road Bike',
    description:
      'High quality road bike from Decathlon. Lightweight alloy frame, Shimano shifter, very fast and light. Tires upgraded to puncture-resistant ones.',
    brand: 'Decathlon',
    cycle_type: 'road',
    condition: 'good',
    price: 14000,
    age_months: 15,
    pickup_location: 'JGB Block A',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Aman Verma',
    seller_hostel: 'JGB',
    image_url:
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-23T14:00:00.000Z',
  },
  {
    id: 'listing-uuid-4',
    seller_id: 'seller-uuid-3',
    title: 'Hero Sprint 26T City Cycle',
    description:
      'Reliable everyday commuter. Perfect for getting around campus. Tyres and brakes in good shape.',
    brand: 'Hero',
    cycle_type: 'city',
    condition: 'fair',
    price: 2800,
    age_months: 36,
    pickup_location: 'Kailash Hostel',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Ranjit Singh',
    seller_hostel: 'Kailash',
    image_url:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-22T11:00:00.000Z',
  },
  {
    id: 'listing-uuid-5',
    seller_id: 'seller-uuid-4',
    title: 'Avon Cyclone Folding Bicycle',
    description:
      'Compact folding bicycle, extremely handy for hostel storage. Carries up to 100 kg. Great condition, barely used.',
    brand: 'Avon',
    cycle_type: 'folding',
    condition: 'like_new',
    price: 6500,
    age_months: 8,
    pickup_location: 'P-Block',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Priya Sharma',
    seller_hostel: 'Girls Hostel',
    image_url:
      'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-21T09:00:00.000Z',
  },
  {
    id: 'listing-uuid-6',
    seller_id: 'seller-uuid-5',
    title: 'Trek FX3 Fitness Hybrid',
    description:
      'Premium Trek fitness bike. Lightweight aluminum frame, hydraulic disc brakes. Used for just 5 months.',
    brand: 'Trek',
    cycle_type: 'hybrid',
    condition: 'like_new',
    price: 22000,
    age_months: 5,
    pickup_location: 'Vishwakarma Hostel',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Dhruv Malhotra',
    seller_hostel: 'Vishwakarma',
    image_url:
      'https://images.unsplash.com/photo-1565185693497-e41f93432f89?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-20T16:00:00.000Z',
  },
]

// ─── Mock Rental Listings ──────────────────────────────────────────────────────

const MOCK_RENTAL_LISTINGS: Listing[] = [
  {
    id: 'rental-uuid-1',
    seller_id: 'seller-uuid-6',
    title: 'Hero Sprint City Cycle — Daily Rental',
    description:
      'Clean, well-maintained city cycle available for rent. Perfect for daily commute around TIET campus. Fresh tyres, serviced brakes. Available on all days.',
    brand: 'Hero',
    cycle_type: 'city',
    condition: 'good',
    price: 0,
    age_months: 24,
    pickup_location: 'JGB Hostel Gate',
    status: 'active',
    listing_mode: 'rent',
    rent_per_day: 60,
    rent_per_week: 350,
    rent_per_month: 1100,
    security_deposit: 500,
    min_rental_days: 1,
    is_available: true,
    seller_name: 'Ananya Gupta',
    seller_hostel: 'Girls Hostel',
    image_url:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-25T10:00:00.000Z',
  },
  {
    id: 'rental-uuid-2',
    seller_id: 'seller-uuid-7',
    title: 'Atlas Granite MTB for Rent',
    description:
      'Robust mountain bike, ideal for weekend rides. Good suspension and grip. Minimum rental 2 days. Available most weekends.',
    brand: 'Atlas',
    cycle_type: 'mountain',
    condition: 'good',
    price: 0,
    age_months: 18,
    pickup_location: 'Kailash Hostel Parking',
    status: 'active',
    listing_mode: 'rent',
    rent_per_day: 80,
    rent_per_week: 450,
    rent_per_month: 1500,
    security_deposit: 800,
    min_rental_days: 2,
    is_available: true,
    seller_name: 'Harpreet Sidhu',
    seller_hostel: 'Kailash',
    image_url:
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-24T14:00:00.000Z',
  },
  {
    id: 'rental-uuid-3',
    seller_id: 'seller-uuid-8',
    title: 'Firefox Hybrid — Weekly / Monthly Rental',
    description:
      'Firefox hybrid available for longer-term rental. Smooth 21-speed gear. Disc brakes. Includes a free front basket. Security deposit refunded on return.',
    brand: 'Firefox',
    cycle_type: 'hybrid',
    condition: 'like_new',
    price: 0,
    age_months: 12,
    pickup_location: 'MGG Hostel B-Wing',
    status: 'active',
    listing_mode: 'rent',
    rent_per_day: 100,
    rent_per_week: 600,
    rent_per_month: 2000,
    security_deposit: 1000,
    min_rental_days: 3,
    is_available: true,
    seller_name: 'Deepika Nair',
    seller_hostel: 'MGG',
    image_url:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-23T08:00:00.000Z',
  },
  {
    id: 'rental-uuid-4',
    seller_id: 'seller-uuid-9',
    title: 'Avon Folding Bike — Rent by the Day',
    description:
      'Super portable folding bike, great for short trips between blocks. Fits under any hostel bed. No deposit required for short rentals.',
    brand: 'Avon',
    cycle_type: 'folding',
    condition: 'good',
    price: 0,
    age_months: 10,
    pickup_location: 'P-Block Room 214',
    status: 'active',
    listing_mode: 'rent',
    rent_per_day: 50,
    rent_per_week: 280,
    security_deposit: 0,
    min_rental_days: 1,
    is_available: false,  // currently rented out
    seller_name: 'Kunal Mehta',
    seller_hostel: 'Vishwakarma',
    image_url:
      'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-22T16:00:00.000Z',
  },
  {
    id: 'rental-uuid-5',
    seller_id: 'seller-uuid-10',
    title: 'Decathlon Road Bike — Exam Season Special',
    description:
      'Lightweight road bike, perfect if you need to move fast between lecture halls and hostels. Minimum 7-day rental. Great for longer exam-season commitments.',
    brand: 'Decathlon',
    cycle_type: 'road',
    condition: 'like_new',
    price: 0,
    age_months: 6,
    pickup_location: 'Q-Block Hostel',
    status: 'active',
    listing_mode: 'rent',
    rent_per_day: 120,
    rent_per_week: 700,
    rent_per_month: 2400,
    security_deposit: 1500,
    min_rental_days: 7,
    is_available: true,
    seller_name: 'Rahul Kapoor',
    seller_hostel: 'Q-Block',
    image_url:
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-21T11:00:00.000Z',
  },
]

const ALL_MOCK_LISTINGS: Listing[] = [
  ...MOCK_SALE_LISTINGS,
  ...MOCK_RENTAL_LISTINGS,
]

// ─── Listings ──────────────────────────────────────────────────────────────────

export async function getListings(filters?: {
  search?: string
  cycle_type?: string
  condition?: string
  max_price?: number
  listing_mode?: 'sale' | 'rent'
}): Promise<Listing[]> {
  if (IS_MOCK) {
    let data = ALL_MOCK_LISTINGS.filter(
      (l) => l.status === 'active' || l.status === 'rented'
    )
    // Filter by listing mode (sale/rent)
    if (filters?.listing_mode) {
      data = data.filter((l) => l.listing_mode === filters.listing_mode)
    }
    // Remove sold and deleted
    data = data.filter((l) => l.status !== 'deleted' && l.status !== 'sold')
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      data = data.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.brand.toLowerCase().includes(q) ||
          l.pickup_location.toLowerCase().includes(q)
      )
    }
    if (filters?.cycle_type && filters.cycle_type !== 'all') {
      data = data.filter((l) => l.cycle_type === filters.cycle_type)
    }
    if (filters?.condition && filters.condition !== 'all') {
      data = data.filter((l) => l.condition === filters.condition)
    }
    if (filters?.max_price && filters.listing_mode !== 'rent') {
      data = data.filter((l) => l.price <= filters.max_price!)
    }
    return data
  }

  // Real Supabase
  const { createClient } = await import('./supabase/client')
  const supabase = createClient()
  let query = supabase
    .from('listings')
    .select('*, profiles(full_name, hostel), listing_images(image_url)')
    .in('status', ['active', 'rented'])
    .order('created_at', { ascending: false })

  if (filters?.listing_mode) {
    query = query.eq('listing_mode', filters.listing_mode)
  }
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }
  if (filters?.cycle_type && filters.cycle_type !== 'all') {
    query = query.eq('cycle_type', filters.cycle_type)
  }
  if (filters?.condition && filters.condition !== 'all') {
    query = query.eq('condition', filters.condition)
  }
  if (filters?.max_price && filters.listing_mode !== 'rent') {
    query = query.lte('price', filters.max_price)
  }

  const { data, error } = await query
  if (error) {
    console.error('getListings error:', error)
    return ALL_MOCK_LISTINGS
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((row: any) => ({
    ...row,
    seller_name: row.profiles?.full_name,
    seller_hostel: row.profiles?.hostel,
    image_url: row.listing_images?.[0]?.image_url,
  }))
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (IS_MOCK) {
    return ALL_MOCK_LISTINGS.find((l) => l.id === id) || null
  }

  const { createClient } = await import('./supabase/client')
  const supabase = createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles(full_name, hostel), listing_images(image_url, sort_order)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return {
    ...data,
    seller_name: data.profiles?.full_name,
    seller_hostel: data.profiles?.hostel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image_url: data.listing_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.image_url,
  }
}

// ─── Auth helpers (client-side) ───────────────────────────────────────────────

export async function signInWithOTP(email: string) {
  if (IS_MOCK) {
    return { error: null }
  }
  const { createClient } = await import('./supabase/client')
  const supabase = createClient()
  return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
}

export async function verifyOTP(email: string, token: string) {
  if (IS_MOCK) {
    // In mock mode the login page now calls the /api/auth/verify-otp route
    // which uses the real OTP store. This client function is a no-op stub.
    return { data: null, error: { message: 'Use /api/auth/verify-otp route instead' } }
  }

  const { createClient } = await import('./supabase/client')
  const supabase = createClient()
  return supabase.auth.verifyOtp({ email, token, type: 'email' })
}

export async function getSessionUser() {
  if (IS_MOCK) {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('pedalup_user')
    return stored ? JSON.parse(stored) : null
  }
  const { createClient } = await import('./supabase/client')
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

export async function signOut() {
  if (IS_MOCK) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pedalup_user')
      localStorage.removeItem('pedalup_session')
      window.dispatchEvent(new Event('pedalup-auth-change'))
    }
    return
  }
  const { createClient } = await import('./supabase/client')
  const supabase = createClient()
  await supabase.auth.signOut()
}
