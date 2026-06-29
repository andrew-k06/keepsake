// icons.tsx — the SINGLE source of icon truth for Keepsake.
// Every icon in the app comes from lucide-react and is funneled through this file.
// NO emoji anywhere. Pages should import icons from here, not from 'lucide-react' directly.

import {
  // brand + navigation
  BookHeart,
  Home,
  Users,
  Search,
  LifeBuoy,
  HeartHandshake,
  Mail,
  // actions + affordances
  Plus,
  Camera,
  ImagePlus,
  Lock,
  Printer,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Quote,
  Info,
  Phone,
  MapPin,
  KeyRound,
  DoorOpen,
  UserPlus,
  LayoutGrid,
  List,
  // status + meta
  Shield,
  ShieldCheck,
  BadgeCheck,
  CircleCheckBig,
  CircleAlert,
  FileText,
  ScrollText,
  Star,
  Gift,
  Heart,
  // category icons
  Gem,
  Image as ImageIcon,
  Frame,
  Watch,
  Utensils,
  Armchair,
  Lamp,
  Coins,
  Amphora,
  Music,
  Package,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ---- Re-export every icon used across the app (named) ----
export {
  // brand + navigation
  BookHeart,
  Home,
  Users,
  Search,
  LifeBuoy,
  HeartHandshake,
  Mail,
  // actions + affordances
  Plus,
  Camera,
  ImagePlus,
  Lock,
  Printer,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Quote,
  Info,
  Phone,
  MapPin,
  KeyRound,
  DoorOpen,
  UserPlus,
  LayoutGrid,
  List,
  // status + meta
  Shield,
  ShieldCheck,
  BadgeCheck,
  CircleCheckBig,
  CircleAlert,
  FileText,
  ScrollText,
  Star,
  Gift,
  Heart,
  // category icons (Image re-exported under its real name too)
  Gem,
  Frame,
  Watch,
  Utensils,
  Armchair,
  Lamp,
  Coins,
  Amphora,
  Music,
  Package,
}
export { ImageIcon }
export type { LucideIcon }

// ---- Category -> icon map ----
// Keys are normalized (lowercased). Unknown categories fall back to Package.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  jewelry: Gem,
  art: Frame,
  watches: Watch,
  'china & silver': Utensils,
  china: Utensils,
  silver: Utensils,
  furniture: Armchair,
  lighting: Lamp,
  collectibles: Coins,
  coins: Coins,
  antiques: Amphora,
  instruments: Music,
  other: Package,
}

/** Resolve the lucide icon component for a category string (case-insensitive). */
export function iconForCategory(category: string): LucideIcon {
  return CATEGORY_ICONS[category.trim().toLowerCase()] ?? Package
}

/**
 * CategoryIcon — renders the right lucide icon for an item category.
 * Use inside the ItemVisual fallback tile, category pills, filters, etc.
 */
export function CategoryIcon({
  category,
  className = '',
  strokeWidth = 1.75,
}: {
  category: string
  className?: string
  strokeWidth?: number
}) {
  const Icon = iconForCategory(category)
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />
}
