import React from 'react'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { AlurakutStyles } from '../src/lib/alurakutCommons'
import { ThemeStateProvider, useAppTheme } from '../src/lib/ThemeContext'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Tahoma, Geneva, Verdana, sans-serif;
    background: ${({ theme }) => theme.bodyBg};
    color: ${({ theme }) => theme.text};
  }
  #__next {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  a {
    color: ${({ theme }) => theme.primary};
  }
  ${AlurakutStyles}
`

function ThemedApp({ Component, pageProps }) {
  const { theme } = useAppTheme()
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <ThemeStateProvider initialTheme={pageProps.userTheme || 'classic'}>
      <ThemedApp Component={Component} pageProps={pageProps} />
    </ThemeStateProvider>
  )
}
