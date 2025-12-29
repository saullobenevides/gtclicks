import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PhotographerProfileForm from '@/components/dashboard/PhotographerProfileForm';

// Mock Stack Auth
jest.mock('@stackframe/stack', () => ({
  useUser: jest.fn(),
  useStackApp: jest.fn(),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { useUser } = require('@stackframe/stack');
const { toast } = require('sonner');

describe('PhotographerProfileForm', () => {
  const mockUser = {
    id: 'user-1',
    displayName: 'Test User',
    primaryEmail: 'test@example.com',
    profileImageUrl: 'https://example.com/avatar.jpg',
  };

  const mockPhotographer = {
    userId: 'user-1',
    username: 'testuser',
    bio: 'Professional photographer',
    telefone: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP',
    instagram: 'testuser',
    chavePix: 'test@example.com',
    cpf: '12345678900',
    portfolioUrl: 'https://portfolio.com',
    equipamentos: 'Canon EOS R5, Sony A7III',
    especialidades: ['Casamentos', 'Eventos Corporativos'],
  };

  beforeEach(() => {
    useUser.mockReturnValue(mockUser);
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders form with photographer data', () => {
    render(<PhotographerProfileForm photographer={mockPhotographer} />);

    // Verify user info is displayed
    expect(screen.getByText(mockUser.displayName)).toBeInTheDocument();
    expect(screen.getByText(mockUser.primaryEmail)).toBeInTheDocument();

    // Verify form fields are populated
    expect(screen.getByDisplayValue(mockPhotographer.bio)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPhotographer.cidade)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPhotographer.estado)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPhotographer.telefone)).toBeInTheDocument();
  });

  test('updates form fields when user types', () => {
    render(<PhotographerProfileForm photographer={mockPhotographer} />);

    const bioInput = screen.getByLabelText(/Bio \/ Sobre mim/i);
    fireEvent.change(bioInput, { target: { value: 'Updated bio text' } });

    expect(bioInput).toHaveValue('Updated bio text');
  });

  test('toggles especialidades when clicked', () => {
    render(<PhotographerProfileForm photographer={mockPhotographer} />);

    // "Casamentos" should be selected initially
    const casamentosTag = screen.getByText('Casamentos');
    expect(casamentosTag).toHaveClass('bg-primary');

    // Click to deselect
    fireEvent.click(casamentosTag);
    expect(casamentosTag).toHaveClass('bg-muted');

    // Click to select again
    fireEvent.click(casamentosTag);
    expect(casamentosTag).toHaveClass('bg-primary');
  });

  test('submits form successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<PhotographerProfileForm photographer={mockPhotographer} />);

    const submitButton = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/fotografos/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Perfil atualizado com sucesso!');
  });

  test('displays error message on submit failure', async () => {
    const errorMessage = 'Erro ao atualizar perfil';
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    render(<PhotographerProfileForm photographer={mockPhotographer} />);

    const submitButton = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith('Erro ao salvar alterações');
  });

  test('shows loading state while submitting', async () => {
    global.fetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );

    render(<PhotographerProfileForm photographer={mockPhotographer} />);

    const submitButton = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/Salvando/i)).toBeInTheDocument();
    });

    // Button should be disabled
    expect(submitButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/Salvar Alterações/i)).toBeInTheDocument();
    });
  });

  test('does not render when user is not logged in', () => {
    useUser.mockReturnValue(null);

    const { container } = render(<PhotographerProfileForm photographer={mockPhotographer} />);

    expect(container.firstChild).toBeNull();
  });

  test('validates CPF field format', () => {
    render(<PhotographerProfileForm photographer={mockPhotographer} />);

    const cpfInput = screen.getByPlaceholderText('000.000.000-00');
    
    // Test updating CPF
    fireEvent.change(cpfInput, { target: { value: '98765432100' } });
    expect(cpfInput).toHaveValue('98765432100');
  });

  test('validates PIX key field', () => {
    render(<PhotographerProfileForm photographer={mockPhotographer} />);

    const pixInput = screen.getByPlaceholderText(/CPF, Email ou Aleatória/i);
    
    // Update PIX key
    fireEvent.change(pixInput, { target: { value: 'newpix@example.com' } });
    expect(pixInput).toHaveValue('newpix@example.com');
  });

  test('allows adding multiple especialidades', () => {
    const photographer = { ...mockPhotographer, especialidades: [] };
    render(<PhotographerProfileForm photographer={photographer} />);

    // Click on multiple especialidades
    const casamentos = screen.getByText('Casamentos');
    const retratos = screen.getByText('Retratos');
    const moda = screen.getByText('Moda');

    fireEvent.click(casamentos);
    fireEvent.click(retratos);
    fireEvent.click(moda);

    // All should be selected
    expect(casamentos).toHaveClass('bg-primary');
    expect(retratos).toHaveClass('bg-primary');
    expect(moda).toHaveClass('bg-primary');
  });
});
