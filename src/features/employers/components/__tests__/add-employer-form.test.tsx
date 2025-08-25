import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { AddEmployerForm } from '../add-employer-form'

describe('AddEmployerForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isSubmitting: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields correctly', () => {
    render(<AddEmployerForm {...defaultProps} />)

    expect(screen.getByLabelText(/employer name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/industry type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add employer/i })).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
    
    render(<AddEmployerForm {...defaultProps} onSubmit={mockOnSubmit} />)

    // Fill out the form
    await user.type(screen.getByLabelText(/employer name/i), 'Sunshine Farm')
    await user.click(screen.getByLabelText(/industry type/i))
    await user.click(screen.getByText('Plant and Animal Cultivation'))
    await user.type(screen.getByLabelText(/postcode/i), '4000')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /add employer/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Sunshine Farm',
        industry: 'plant_and_animal_cultivation',
        postcode: '4000',
        is_eligible: true
      })
    })
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    
    render(<AddEmployerForm {...defaultProps} />)

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /add employer/i }))

    await waitFor(() => {
      expect(screen.getByText(/employer name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid postcode', async () => {
    const user = userEvent.setup()
    
    render(<AddEmployerForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/employer name/i), 'Valid Farm')
    await user.type(screen.getByLabelText(/postcode/i), '12345') // Invalid: 5 digits

    await user.click(screen.getByRole('button', { name: /add employer/i }))

    await waitFor(() => {
      expect(screen.getByText(/postcode must be 4 digits/i)).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnCancel = vi.fn()
    
    render(<AddEmployerForm {...defaultProps} onCancel={mockOnCancel} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when submitting', () => {
    render(<AddEmployerForm {...defaultProps} isSubmitting={true} />)

    expect(screen.getByRole('button', { name: /adding\.\.\./i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('handles submission error and displays error message', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    
    render(<AddEmployerForm {...defaultProps} onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText(/employer name/i), 'Test Farm')
    await user.click(screen.getByRole('button', { name: /add employer/i }))

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('calls onError callback when submission fails and onError is provided', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error('API error'))
    const mockOnError = vi.fn()
    
    render(<AddEmployerForm {...defaultProps} onSubmit={mockOnSubmit} onError={mockOnError} />)

    await user.type(screen.getByLabelText(/employer name/i), 'Test Farm')
    await user.click(screen.getByRole('button', { name: /add employer/i }))

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(new Error('API error'))
    })
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
    
    render(<AddEmployerForm {...defaultProps} onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByLabelText(/employer name/i) as HTMLInputElement
    
    await user.type(nameInput, 'Test Farm')
    expect(nameInput.value).toBe('Test Farm')

    await user.click(screen.getByRole('button', { name: /add employer/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(nameInput.value).toBe('')
    })
  })
})