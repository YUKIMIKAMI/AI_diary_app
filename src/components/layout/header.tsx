'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  PenSquare, 
  Brain, 
  BarChart3, 
  MessageSquare, 
  Menu,
  Moon,
  Sun,
  User,
  Download,
  Clock,
  Cloud,
  Layers,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const navItems = [
    { href: '/diary/new', label: '日記を書く', icon: PenSquare },
    { href: '/search', label: '検索', icon: Search },
    { href: '/mindmap', label: 'マインドマップ', icon: Brain },
    { href: '/mindmap-merge', label: '統合マップ', icon: Layers },
    { href: '/emotions', label: '感情分析', icon: BarChart3 },
    { href: '/words', label: '単語分析', icon: Cloud },
    { href: '/timeline', label: 'タイムライン', icon: Clock },
    { href: '/consultation', label: 'AI相談', icon: MessageSquare },
    { href: '/export', label: 'エクスポート', icon: Download },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AI Diary
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm whitespace-nowrap"
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden lg:flex"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            <Button variant="ghost" size="icon" className="hidden lg:flex">
              <User className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t dark:border-gray-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="flex items-center justify-between px-4 py-2 mt-2 border-t dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                テーマ
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? 'ライト' : 'ダーク'}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}