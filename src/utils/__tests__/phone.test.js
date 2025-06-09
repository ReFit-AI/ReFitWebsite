import { calculatePhonePrice, validatePhoneData, formatPrice } from '../phone';

describe('Phone Utilities', () => {
  describe('calculatePhonePrice', () => {
    it('calculates price for iPhone 15 Pro in excellent condition', () => {
      const price = calculatePhonePrice('iPhone 15 Pro', 'excellent', '256GB');
      expect(price).toBe(960); // 800 * 1.0 * 1.2
    });

    it('calculates price for Solana Phone in good condition', () => {
      const price = calculatePhonePrice('Solana Phone', 'good', '128GB');
      expect(price).toBe(240); // 300 * 0.8 * 1.0
    });

    it('handles unknown models with default price', () => {
      const price = calculatePhonePrice('Unknown Phone', 'excellent', '128GB');
      expect(price).toBe(100); // default price
    });

    it('handles unknown conditions with default multiplier', () => {
      const price = calculatePhonePrice('iPhone 15 Pro', 'unknown', '128GB');
      expect(price).toBe(400); // 800 * 0.5 * 1.0
    });
  });

  describe('validatePhoneData', () => {
    it('validates complete phone data', () => {
      const phoneData = {
        model: 'iPhone 15 Pro',
        storage: '256GB',
        condition: 'excellent',
        color: 'Space Black',
      };

      const result = validatePhoneData(phoneData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns errors for missing required fields', () => {
      const phoneData = {
        color: 'Space Black',
      };

      const result = validatePhoneData(phoneData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        model: 'Please select a phone model',
        storage: 'Please select storage capacity',
        condition: 'Please select device condition',
      });
    });

    it('returns specific errors for partially filled data', () => {
      const phoneData = {
        model: 'iPhone 15 Pro',
        color: 'Space Black',
      };

      const result = validatePhoneData(phoneData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        storage: 'Please select storage capacity',
        condition: 'Please select device condition',
      });
    });
  });

  describe('formatPrice', () => {
    it('formats USD prices correctly', () => {
      expect(formatPrice(800, 'USD')).toBe('$800.00');
      expect(formatPrice(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('formats SOL prices correctly', () => {
      expect(formatPrice(5.2345, 'SOL')).toBe('5.2345 SOL');
      expect(formatPrice(0.1, 'SOL')).toBe('0.1000 SOL');
    });

    it('defaults to USD when no currency specified', () => {
      expect(formatPrice(500)).toBe('$500.00');
    });

    it('handles other currencies as string', () => {
      expect(formatPrice(100, 'EUR')).toBe('100');
    });
  });
});
