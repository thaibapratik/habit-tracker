'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, Calendar, Users, Trophy } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/revenue', label: 'Revenue', icon: Wallet },
  { href: '/week', label: 'Weekly', icon: Calendar },
  { href: '/clients', label: 'CRM', icon: Users },
  { href: '/history', label: 'Stats & Game', icon: Trophy },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between md:justify-start items-center h-16 md:gap-8">
          <div className="hidden md:block font-bold text-xl mr-4 tracking-tighter">
            CONTENT<span className="text-primary font-black italic">ENGINE</span>
          </div>
          
          <div className="flex justify-around w-full md:w-auto md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-1 rounded-lg transition-all ${
                    isActive 
                      ? 'text-primary md:bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
