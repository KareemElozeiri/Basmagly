import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import axios from '../../APIs/axios';
import "react-router-dom";

// Mock axios
jest.mock('axios');

// Mock js-cookie
jest.mock('js-cookie', () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

describe('Login and Navigation Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful login response
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { token: 'fake-token' }
    });
  });

  test('successful login and navigation flow', async () => {
    render(<App />);
    
    // Test login form
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    // Fill in login credentials
    await userEvent.type(usernameInput, 'hatem');
    await userEvent.type(passwordInput, 'Qwert12345@');
    
    // Submit login form
    fireEvent.click(loginButton);

    // Wait for navigation to home page
    await waitFor(() => {
      expect(window.location.pathname).toBe('/home/default');
    });

    // Test sidebar navigation
    const documentsLink = screen.getByText('Documents');
    const chatbotLink = screen.getByText('Chatbot');
    const quizzesLink = screen.getByText('Quizzes');

    // Test navigation to Documents page
    fireEvent.click(documentsLink);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/home/documents');
    });

    // Test navigation to Chatbot page
    fireEvent.click(chatbotLink);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/home/chatbot');
    });

    // Test navigation to Quizzes page
    fireEvent.click(quizzesLink);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/home/quizzes');
    });

    // Test user dropdown menu
    const userPhoto = screen.getByAltText('User');
    fireEvent.click(userPhoto);
    
    // Verify dropdown menu items are visible
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();

    // Test theme toggle
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(themeToggle);
    
    // Verify theme change
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  test('failed login attempt', async () => {
    // Mock failed login response
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid username or password'
        }
      }
    });

    render(<App />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    // Fill in incorrect credentials
    await userEvent.type(usernameInput, 'wronguser');
    await userEvent.type(passwordInput, 'wrongpass');
    
    // Submit login form
    fireEvent.click(loginButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });

    // Verify we didn't navigate away from login page
    expect(window.location.pathname).toBe('/');
  });

  test('sidebar collapse functionality', async () => {
    render(<App />);
    
    // Login first
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    await userEvent.type(usernameInput, 'hatem');
    await userEvent.type(passwordInput, 'Qwert12345@');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for navigation to home page
    await waitFor(() => {
      expect(window.location.pathname).toBe('/home/default');
    });

    // Find and click the sidebar toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    
    // Test sidebar collapse
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('sidebar')).toHaveStyle({ width: '50px' });
    
    // Test sidebar expand
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('sidebar')).toHaveStyle({ width: '250px' });
  });
});