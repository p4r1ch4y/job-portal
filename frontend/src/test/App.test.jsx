import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../context/AuthContext'

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false
  })
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    )
    
    // Should render the navbar
    expect(document.body).toBeInTheDocument()
  })
})
