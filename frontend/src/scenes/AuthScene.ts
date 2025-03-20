import Phaser from 'phaser';
import { apiService } from '../services/api.service';

export class AuthScene extends Phaser.Scene {
    private loginContainer!: Phaser.GameObjects.Container;
    private registerContainer!: Phaser.GameObjects.Container;
    private currentView: 'login' | 'register' = 'login';
    private usernameInput!: HTMLInputElement;
    private passwordInput!: HTMLInputElement;
    private errorText!: Phaser.GameObjects.Text;
    private loadingText!: Phaser.GameObjects.Text;
    
    constructor() {
        super('AuthScene');
    }
    
    create(): void {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x111133).setOrigin(0);
        
        // Title
        this.add.text(width / 2, 100, 'IDLE MMO', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Create containers for login and register views
        this.loginContainer = this.add.container(width / 2, height / 2);
        this.registerContainer = this.add.container(width / 2, height / 2);
        
        // Create login form
        this.createLoginForm();
        
        // Create register form
        this.createRegisterForm();
        
        // Show login form by default
        this.registerContainer.setVisible(false);
        
        // Error text
        this.errorText = this.add.text(width / 2, height / 2 + 150, '', {
            fontSize: '16px',
            color: '#ff0000'
        }).setOrigin(0.5);
        
        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2 + 180, 'Loading...', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setVisible(false);
        
        // Setup event listeners for scene lifecycle
        this.events.on('shutdown', this.cleanupInputElements, this);
        this.events.on('destroy', this.cleanupInputElements, this);
        
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
            this.loadingText.setVisible(true);
            // Verify token and proceed to game
            this.proceedToGame(userId);
        }
    }
    
    private createLoginForm(): void {
        const background = this.add.rectangle(0, 0, 400, 300, 0x222244, 0.8)
            .setStrokeStyle(2, 0x3333aa);
        this.loginContainer.add(background);
        
        const title = this.add.text(0, -120, 'Login', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.loginContainer.add(title);
        
        // Create HTML input elements for username and password
        this.createInputFields();
        
        // Login button
        const loginButton = this.add.rectangle(0, 80, 180, 40, 0x3333aa)
            .setInteractive({ useHandCursor: true });
        this.loginContainer.add(loginButton);
        
        const loginText = this.add.text(0, 80, 'Login', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.loginContainer.add(loginText);
        
        loginButton.on('pointerdown', () => {
            this.handleLogin();
        });
        
        // Register link
        const registerLink = this.add.text(0, 130, 'Need an account? Register here', {
            fontSize: '16px',
            color: '#aaaaff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.loginContainer.add(registerLink);
        
        registerLink.on('pointerdown', () => {
            this.toggleView('register');
        });
    }
    
    private createRegisterForm(): void {
        const background = this.add.rectangle(0, 0, 400, 300, 0x222244, 0.8)
            .setStrokeStyle(2, 0x3333aa);
        this.registerContainer.add(background);
        
        const title = this.add.text(0, -120, 'Register', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.registerContainer.add(title);
        
        // Register button
        const registerButton = this.add.rectangle(0, 80, 180, 40, 0x3333aa)
            .setInteractive({ useHandCursor: true });
        this.registerContainer.add(registerButton);
        
        const registerText = this.add.text(0, 80, 'Register', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.registerContainer.add(registerText);
        
        registerButton.on('pointerdown', () => {
            this.handleRegister();
        });
        
        // Login link
        const loginLink = this.add.text(0, 130, 'Already have an account? Login here', {
            fontSize: '16px',
            color: '#aaaaff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.registerContainer.add(loginLink);
        
        loginLink.on('pointerdown', () => {
            this.toggleView('login');
        });
    }
    
    private createInputFields(): void {
        // Remove existing input elements if they exist
        try {
            if (this.usernameInput && document.body.contains(this.usernameInput)) {
                document.body.removeChild(this.usernameInput);
            }
            if (this.passwordInput && document.body.contains(this.passwordInput)) {
                document.body.removeChild(this.passwordInput);
            }
        } catch (error) {
            console.error('Error removing input elements:', error);
            // Continue even if removal fails
        }
        
        // Calculate positions
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Username input
        this.usernameInput = document.createElement('input');
        this.usernameInput.type = 'text';
        this.usernameInput.placeholder = 'Username';
        this.usernameInput.style.position = 'absolute';
        this.usernameInput.style.top = `${centerY - 50}px`;
        this.usernameInput.style.left = `${centerX - 90}px`;
        this.usernameInput.style.width = '180px';
        this.usernameInput.style.padding = '8px';
        this.usernameInput.style.borderRadius = '4px';
        this.usernameInput.style.border = '1px solid #3333aa';
        this.usernameInput.style.backgroundColor = '#1a1a2e';
        this.usernameInput.style.color = 'white';
        document.body.appendChild(this.usernameInput);
        
        // Password input
        this.passwordInput = document.createElement('input');
        this.passwordInput.type = 'password';
        this.passwordInput.placeholder = 'Password';
        this.passwordInput.style.position = 'absolute';
        this.passwordInput.style.top = `${centerY}px`;
        this.passwordInput.style.left = `${centerX - 90}px`;
        this.passwordInput.style.width = '180px';
        this.passwordInput.style.padding = '8px';
        this.passwordInput.style.borderRadius = '4px';
        this.passwordInput.style.border = '1px solid #3333aa';
        this.passwordInput.style.backgroundColor = '#1a1a2e';
        this.passwordInput.style.color = 'white';
        document.body.appendChild(this.passwordInput);
        
        // Focus username input
        this.usernameInput.focus();
    }
    
    private toggleView(view: 'login' | 'register'): void {
        this.currentView = view;
        
        // Re-create input fields to ensure they're properly positioned for the new view
        try {
            if (this.usernameInput && document.body.contains(this.usernameInput)) {
                document.body.removeChild(this.usernameInput);
            }
            if (this.passwordInput && document.body.contains(this.passwordInput)) {
                document.body.removeChild(this.passwordInput);
            }
            
            // Recreate the input fields
            this.createInputFields();
        } catch (error) {
            console.error('Error handling input elements during view toggle:', error);
        }
        
        if (view === 'login') {
            this.loginContainer.setVisible(true);
            this.registerContainer.setVisible(false);
        } else {
            this.loginContainer.setVisible(false);
            this.registerContainer.setVisible(true);
        }
        
        // Clear error message
        this.errorText.setText('');
    }
    
    private async handleLogin(): Promise<void> {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();
        
        if (!username || !password) {
            this.errorText.setText('Please enter both username and password');
            return;
        }
        
        try {
            this.loadingText.setVisible(true);
            
            console.log('Attempting to login with username:', username);
            const result = await apiService.login(username, password);
            console.log('Login successful:', result);
            
            // Store token and user ID
            localStorage.setItem('token', result.token);
            localStorage.setItem('userId', result.userId);
            
            // Proceed to game
            this.proceedToGame(result.userId);
        } catch (error: any) {
            console.error('Login failed, detailed error:', error);
            
            // Check if error has a response property (typical of API errors)
            if (error.response) {
                console.error('Error response:', error.response);
                this.errorText.setText(`Login failed: ${error.response.data?.message || 'Invalid credentials'}`);
            } else if (error.message) {
                this.errorText.setText(`Login failed: ${error.message}`);
            } else {
                this.errorText.setText('Login failed: Unknown error occurred');
            }
            
            this.loadingText.setVisible(false);
        }
    }
    
    private async handleRegister(): Promise<void> {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();
        
        if (!username || !password) {
            this.errorText.setText('Please enter both username and password');
            return;
        }
        
        if (password.length < 8) {
            this.errorText.setText('Password must be at least 8 characters');
            return;
        }
        
        try {
            this.loadingText.setVisible(true);
            
            console.log('Attempting to register with username:', username);
            const result = await apiService.register(username, password);
            console.log('Registration successful:', result);
            
            // Store token and user ID
            localStorage.setItem('token', result.token);
            localStorage.setItem('userId', result.userId);
            
            // Proceed to game
            this.proceedToGame(result.userId);
        } catch (error: any) {
            console.error('Registration failed, detailed error:', error);
            
            // Check if error has a response property (typical of API errors)
            if (error.response) {
                console.error('Error response:', error.response);
                this.errorText.setText(`Registration failed: ${error.response.data?.message || 'Server error'}`);
            } else if (error.message) {
                this.errorText.setText(`Registration failed: ${error.message}`);
            } else {
                this.errorText.setText('Registration failed: Unknown error occurred');
            }
            
            this.loadingText.setVisible(false);
        }
    }
    
    private async proceedToGame(userId: string): Promise<void> {
        console.log('AuthScene.proceedToGame called with userId:', userId);
        try {
            // Get user's characters
            const characters = await apiService.getCharacters(userId);
            console.log('Characters retrieved:', characters);
            
            // Safely remove input elements
            try {
                if (this.usernameInput && document.body.contains(this.usernameInput)) {
                    document.body.removeChild(this.usernameInput);
                }
                if (this.passwordInput && document.body.contains(this.passwordInput)) {
                    document.body.removeChild(this.passwordInput);
                }
            } catch (error) {
                console.error('Error removing input elements:', error);
                // Continue even if removal fails
            }
            
            if (characters.length > 0) {
                // User has characters, proceed to barracks
                console.log('Starting BarracksScene with:', { userId, characters });
                this.scene.start('BarracksScene', { userId, characters });
            } else {
                // User has no characters, proceed to character creation
                console.log('Starting CharacterCreationScene with:', { userId });
                this.scene.start('CharacterCreationScene', { userId });
            }
        } catch (error) {
            console.error('Error fetching characters:', error);
            this.errorText.setText('Error loading game data. Please try again.');
            this.loadingText.setVisible(false);
            
            // Clear stored credentials on error
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
        }
    }
    
    private cleanupInputElements(): void {
        // Clean up input elements when scene is shut down
        try {
            if (this.usernameInput && document.body.contains(this.usernameInput)) {
                document.body.removeChild(this.usernameInput);
                this.usernameInput = null as any;
            }
            if (this.passwordInput && document.body.contains(this.passwordInput)) {
                document.body.removeChild(this.passwordInput);
                this.passwordInput = null as any;
            }
        } catch (error) {
            console.error('Error cleaning up input elements:', error);
        }
    }

    shutdown(): void {
        // Clean up event listeners and input elements
        this.events.off('shutdown', this.cleanupInputElements, this);
        this.events.off('destroy', this.cleanupInputElements, this);
        this.cleanupInputElements();
    }
} 