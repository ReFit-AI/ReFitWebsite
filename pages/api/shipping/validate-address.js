// API endpoint to validate shipping addresses
import { createClient } from '@supabase/supabase-js';
import Shippo from 'shippo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const shippo = Shippo(process.env.SHIPPO_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { address } = req.body;

    // Validate address with Shippo
    const validation = await shippo.address.create({
      name: address.name,
      street1: address.street1,
      street2: address.street2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country || 'US',
      phone: address.phone || '',
      validate: true
    });

    const isValid = validation.validation_results?.is_valid ?? false;
    const messages = validation.validation_results?.messages || [];

    // Save to database if valid and requested
    if (isValid && address.save) {
      const { data: savedAddress, error: saveError } = await supabase
        .from('shipping_addresses')
        .insert({
          user_id: user.id,
          name: validation.name,
          street1: validation.street1,
          street2: validation.street2,
          city: validation.city,
          state: validation.state,
          zip: validation.zip,
          country: validation.country,
          phone: validation.phone,
          is_validated: true,
          validation_data: validation.validation_results,
          is_default: address.is_default || false
        })
        .select()
        .single();

      if (saveError) {
        console.error('Save address error:', saveError);
      }

      return res.status(200).json({
        success: true,
        valid: isValid,
        address: savedAddress || validation,
        messages
      });
    }

    res.status(200).json({
      success: true,
      valid: isValid,
      address: {
        name: validation.name,
        street1: validation.street1,
        street2: validation.street2,
        city: validation.city,
        state: validation.state,
        zip: validation.zip,
        country: validation.country,
        phone: validation.phone
      },
      messages
    });
  } catch (error) {
    console.error('Validate address error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to validate address',
      message: error.message 
    });
  }
}
