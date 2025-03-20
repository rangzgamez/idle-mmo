import { Character } from '../models/Character';
import { Item } from '../models/Item';

const API_URL = 'http://localhost:3001';

class ApiService {
    // User methods
    async login(username: string, password: string): Promise<{ token: string; userId: string }> {
        try {
            console.log('Sending login request to:', `${API_URL}/users/login`, {
                username, 
                password: password ? '********' : undefined
            });
            
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Login response status:', response.status);
            
            // Check if response is not ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Login error data:', errorData);
                throw new Error(errorData.message || `Login failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('Login response data (sanitized):', { ...data, token: '[REDACTED]' });
            return data;
        } catch (error) {
            console.error('Login request error:', error);
            throw error;
        }
    }

    async register(username: string, password: string): Promise<{ token: string; userId: string }> {
        try {
            console.log('Sending register request to:', `${API_URL}/users/register`, {
                username, 
                password: password ? '********' : undefined
            });
            
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Register response status:', response.status);
            
            // Check if response is not ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Register error data:', errorData);
                throw new Error(errorData.message || `Registration failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('Register response data (sanitized):', { ...data, token: '[REDACTED]' });
            return data;
        } catch (error) {
            console.error('Register request error:', error);
            throw error;
        }
    }

    // Character methods
    async getCharacters(userId: string): Promise<Character[]> {
        const response = await fetch(`${API_URL}/characters/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch characters');
        }

        return response.json();
    }

    async createCharacter(character: Partial<Character>): Promise<Character> {
        const response = await fetch(`${API_URL}/characters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            },
            body: JSON.stringify(character),
        });

        if (!response.ok) {
            throw new Error('Failed to create character');
        }

        return response.json();
    }

    async updateCharacter(id: string, character: Partial<Character>): Promise<Character> {
        const response = await fetch(`${API_URL}/characters/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            },
            body: JSON.stringify(character),
        });

        if (!response.ok) {
            throw new Error('Failed to update character');
        }

        return response.json();
    }

    // Item methods
    async getItems(): Promise<Item[]> {
        const response = await fetch(`${API_URL}/items`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch items');
        }

        return response.json();
    }

    async getCharacterItems(characterId: string): Promise<Item[]> {
        const response = await fetch(`${API_URL}/characters/${characterId}/items`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch character items');
        }

        return response.json();
    }

    async equipItem(characterId: string, itemId: string): Promise<Character> {
        try {
            console.log(`API call: equipItem - characterId: ${characterId}, itemId: ${itemId}`);
            
            // Check if we have a token before making the request
            const token = this.getToken();
            if (!token) {
                console.error('No authentication token found for equipItem request');
                throw new Error('Authentication token missing');
            }
            
            const response = await fetch(`${API_URL}/characters/${characterId}/equip/${itemId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`equipItem response status: ${response.status}`);
            
            if (!response.ok) {
                let errorMessage = `Failed to equip item. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('Equipment error response:', errorData);
                } catch (parseError) {
                    console.error('Could not parse error response:', parseError);
                }
                
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            console.error('equipItem request error:', error);
            throw error;
        }
    }

    async unequipItem(characterId: string, itemId: string): Promise<Character> {
        try {
            console.log(`API call: unequipItem - characterId: ${characterId}, itemId: ${itemId}`);
            
            // Check if we have a token before making the request
            const token = this.getToken();
            if (!token) {
                console.error('No authentication token found for unequipItem request');
                throw new Error('Authentication token missing');
            }
            
            const response = await fetch(`${API_URL}/characters/${characterId}/unequip/${itemId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`unequipItem response status: ${response.status}`);
            
            if (!response.ok) {
                let errorMessage = `Failed to unequip item. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('Unequip error response:', errorData);
                } catch (parseError) {
                    console.error('Could not parse error response:', parseError);
                }
                
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            console.error('unequipItem request error:', error);
            throw error;
        }
    }

    async updateCharacterStats(): Promise<{ updated: number, characters: Character[] }> {
        const response = await fetch(`${API_URL}/characters/update-stats`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to update character stats');
        }

        return response.json();
    }

    async createItemForCharacter(characterId: string, item: Partial<Item>): Promise<Item> {
        const response = await fetch(`${API_URL}/characters/${characterId}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            },
            body: JSON.stringify(item),
        });

        if (!response.ok) {
            throw new Error('Failed to create item for character');
        }

        return response.json();
    }

    async getPlayerItems(): Promise<Item[]> {
        try {
            console.log('Getting all player items from shared inventory');
            const token = this.getToken();
            if (!token) {
                console.error('No authentication token found for getPlayerItems request');
                throw new Error('Authentication token missing');
            }
            
            // Get the user ID from the token if needed
            // For now, we'll just query without a userId param
            const response = await fetch(`${API_URL}/items/player`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log(`getPlayerItems response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch player items');
            }

            const items = await response.json();
            console.log('Received shared player items:', items.length);
            return items;
        } catch (error) {
            console.error('getPlayerItems request error:', error);
            throw error;
        }
    }

    // Helper methods
    private getToken(): string {
        return localStorage.getItem('token') || '';
    }
}

export const apiService = new ApiService(); 