import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define our own ThemeProviderProps interface
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  attribute?: string;
  value?: object;
  enableSystem?: boolean;
  disableSystemTheme?: boolean;
  forcedTheme?: string;
  enableColorScheme?: boolean;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider {...props} disableSystemTheme>
      {children}
    </NextThemesProvider>
  )
} 