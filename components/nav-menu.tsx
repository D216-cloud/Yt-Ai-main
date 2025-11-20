"use client"

import Link from "next/link"
import { 
  Home, 
  User, 
  GitCompare, 
  Video, 
  BarChart3, 
  Upload, 
  Settings 
} from "lucide-react"

interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

interface NavMenuProps {
  activePage: string
}

export function NavMenu({ activePage }: NavMenuProps) {
  const navItems: NavItem[] = [
    { id: "dashboard", icon: Home, label: "Dashboard", href: "/dashboard" },
    { id: "profile", icon: User, label: "Profile", href: "/dashboard?page=profile" },
    { id: "compare", icon: GitCompare, label: "Compare", href: "/compare" },
    { id: "content", icon: Video, label: "Content", href: "/content" },
    { id: "bulk-upload", icon: Upload, label: "Bulk Upload", href: "/bulk-upload" },
    // Removed Analytics, AI Tools (Bulk Upload), and Settings per request
  ]

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activePage === item.id
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}