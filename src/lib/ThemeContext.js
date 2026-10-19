import React from 'react'
import { THEMES } from './themes'

const ThemeContext = React.createContext({
  themeId: 'classic',
  theme: THEMES.classic,
  setThemeId: () => {},
})

export function ThemeStateProvider({ children, initialTheme }) {
  const [themeId, setThemeId] = React.useState(initialTheme || 'classic')
  const theme = THEMES[themeId] || THEMES.classic
  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  return React.useContext(ThemeContext)
}
