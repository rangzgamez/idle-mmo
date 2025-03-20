import { apiService } from '../services/api.service';

/**
 * Utility class to update character stats across the game
 */
export class StatsUpdater {
    /**
     * Update all character stats based on their level and class
     * This will call the backend to recalculate HP and MP for all characters
     */
    static async updateAllCharacterStats(): Promise<void> {
        try {
            console.log('Updating character stats...');
            const result = await apiService.updateCharacterStats();
            console.log(`Updated stats for ${result.updated} characters`);
            console.log('Characters after update:', result.characters);
            return Promise.resolve();
        } catch (error) {
            console.error('Failed to update character stats:', error);
            return Promise.reject(error);
        }
    }
} 