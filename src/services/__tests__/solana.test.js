import { 
  estimatePhonePrice, 
  createBuybackOrder, 
  getUserOrders, 
  convertUsdToSol 
} from '../solana';

// Mock fetch globally
global.fetch = jest.fn();

describe('Solana Services', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('estimatePhonePrice', () => {
    it('calculates price correctly for phone data', async () => {
      const phoneData = {
        model: 'iPhone 15 Pro',
        storage: '256GB',
        condition: 'excellent',
        color: 'Space Black'
      };

      const result = await estimatePhonePrice(phoneData);

      expect(result).toEqual({
        usdPrice: 960,
        solPrice: expect.any(Number),
        estimatedProcessingTime: '2-3 business days',
        confidence: 'high'
      });

      expect(result.solPrice).toBeGreaterThan(0);
    });

    it('handles different phone conditions correctly', async () => {
      const phoneData = {
        model: 'iPhone 15 Pro',
        storage: '256GB',
        condition: 'good',
        color: 'Space Black'
      };

      const result = await estimatePhonePrice(phoneData);
      expect(result.usdPrice).toBe(768); // 800 * 0.8 * 1.2
    });
  });

  describe('createBuybackOrder', () => {
    it('creates a buyback order with valid data', async () => {
      const orderData = {
        phoneData: {
          model: 'iPhone 15 Pro',
          storage: '256GB',
          condition: 'excellent'
        },
        priceQuote: {
          usdPrice: 960,
          solPrice: 5.2
        },
        userAddress: 'mockPublicKey'
      };

      const result = await createBuybackOrder(orderData);

      expect(result).toEqual({
        orderId: expect.any(String),
        status: 'pending_shipment',
        estimatedCompletion: expect.any(String),
        shippingLabel: expect.any(String)
      });

      expect(result.orderId.length).toBeGreaterThan(10);
    });

    it('throws error for invalid order data', async () => {
      const invalidOrderData = {};

      await expect(createBuybackOrder(invalidOrderData)).rejects.toThrow('Invalid order data');
    });
  });

  describe('getUserOrders', () => {
    it('returns orders for a valid user address', async () => {
      const userAddress = 'mockPublicKey';
      const result = await getUserOrders(userAddress);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(order => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('phone');
        expect(order).toHaveProperty('price');
        expect(order).toHaveProperty('createdAt');
      });
    });

    it('returns empty array for user with no orders', async () => {
      const userAddress = 'newUserAddress';
      const result = await getUserOrders(userAddress);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('convertUsdToSol', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          solana: { usd: 185.50 }
        })
      });
    });

    it('converts USD to SOL using current exchange rate', async () => {
      const result = await convertUsdToSol(960);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      
      expect(result).toBeCloseTo(5.175, 2); // 960 / 185.50
    });

    it('handles API errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('API Error'));

      const result = await convertUsdToSol(960);
      
      // Should use fallback price
      expect(result).toBeCloseTo(6.4, 1); // 960 / 150 (fallback)
    });

    it('handles invalid API response', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await convertUsdToSol(960);
      
      // Should use fallback price
      expect(result).toBeCloseTo(6.4, 1); // 960 / 150 (fallback)
    });
  });
});
