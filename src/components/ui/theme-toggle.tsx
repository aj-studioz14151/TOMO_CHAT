"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return (
      <div className={cn(
        "flex w-16 h-8 p-1 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700",
        className
      )}>
        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md",
        isDark 
          ? "bg-gray-900 border border-gray-700" 
          : "bg-white border border-gray-200",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="button"
      tabIndex={0}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="flex justify-between items-center w-full relative">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 absolute",
            isDark 
              ? "transform translate-x-0 bg-gray-800 shadow-sm" 
              : "transform translate-x-8 bg-gray-100 shadow-sm"
          )}
        >
          {isDark ? (
            <Moon 
              className="w-4 h-4 text-white" 
              strokeWidth={1.5}
            />
          ) : (
            <Sun 
              className="w-4 h-4 text-gray-700" 
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-opacity duration-300 absolute",
            isDark 
              ? "opacity-30 translate-x-8" 
              : "opacity-30 translate-x-0"
          )}
        >
          {isDark ? (
            <Sun 
              className="w-4 h-4 text-gray-400" 
              strokeWidth={1.5}
            />
          ) : (
            <Moon 
              className="w-4 h-4 text-gray-500" 
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  )
}