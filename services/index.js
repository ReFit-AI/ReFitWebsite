// Service factory to switch between mock and production services
import { config, getService } from '../config/production';

// Import mock service classes
import MockShippingService, { ShippingService as BaseShippingService, MockShippingService as MockShipping } from './shipping';
import mockUserProfileService from './userProfile';

// Import production service classes (ESM)
import BrowserShippingService from './shipping.browser';
import ProductionUserProfileService from './userProfile.production';

// Create service instances
const mockShippingService = new MockShipping();

let productionShippingService = null;
let productionUserProfileService = null;

if (config.features.useShippo && config.shippo.apiKey) {
  try {
    productionShippingService = new BrowserShippingService();
  } catch (error) {
    console.warn('Failed to init browser shipping service', error);
  }
}

if (config.features.useSupabase && config.supabase.url && config.supabase.anonKey) {
  try {
    productionUserProfileService = new ProductionUserProfileService();
  } catch (error) {
    console.warn('Failed to init production user profile service', error);
  }
}

// Export service factory
export const getShippingService = () => getService(
  mockShippingService,
  productionShippingService
);

export const getUserProfileService = () => getService(
  mockUserProfileService,
  productionUserProfileService
);

// Export services directly for testing
export { mockShippingService, mockUserProfileService };

export async function initializeServices(walletAddress) {
  if (walletAddress && config.features.useSupabase && productionUserProfileService) {
    await productionUserProfileService.initializeProfile(walletAddress);
  }
}

export async function cleanupServices() {
  if (config.features.useSupabase && productionUserProfileService) {
    await productionUserProfileService.signOut();
  }
}
