// Invoice validation and sanitization utilities

export function validateInvoiceData(invoice) {
  const errors = [];

  // Check required fields
  if (!invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
    errors.push('Invoice must have at least one item');
  }

  // Validate each item
  if (invoice.items) {
    invoice.items.forEach((item, index) => {
      if (!item.model) {
        errors.push(`Item ${index + 1}: Model is required`);
      }
      if (!item.imei) {
        errors.push(`Item ${index + 1}: IMEI is required`);
      }
      if (item.price === undefined || item.price === null || item.price < 0) {
        errors.push(`Item ${index + 1}: Valid price is required`);
      }
    });
  }

  // Validate buyer (either buyer_id or buyer details)
  if (!invoice.buyer_id) {
    if (!invoice.buyer_name || !invoice.buyer_email) {
      errors.push('Buyer name and email are required');
    }
    if (invoice.buyer_email && !isValidEmail(invoice.buyer_email)) {
      errors.push('Invalid email format');
    }
  }

  return errors;
}

export function sanitizeInvoiceData(invoice) {
  // Calculate totals
  const itemsTotal = (invoice.items || []).reduce((sum, item) => {
    const price = parseFloat(item.price || item.selling_price || 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  // Sanitize and structure the invoice
  return {
    buyer_id: invoice.buyer_id || null,
    buyer_name: invoice.buyer_name?.trim() || null,
    buyer_email: invoice.buyer_email?.trim()?.toLowerCase() || null,
    buyer_phone: invoice.buyer_phone?.trim() || null,
    buyer_company: invoice.buyer_company?.trim() || null,
    buyer_address: invoice.buyer_address?.trim() || null,
    buyer_city: invoice.buyer_city?.trim() || null,
    buyer_state: invoice.buyer_state?.trim()?.toUpperCase() || null,
    buyer_zip: invoice.buyer_zip?.trim() || null,
    buyer_country: invoice.buyer_country || 'US',
    items: (invoice.items || []).map(item => ({
      inventory_id: item.inventory_id || item.id || null,
      model: item.model?.trim() || '',
      imei: item.imei?.trim() || '',
      price: parseFloat(item.price || item.selling_price || 0),
      cost: parseFloat(item.cost || item.price_paid || 0)
    })),
    subtotal: invoice.subtotal || itemsTotal,
    total: invoice.total || itemsTotal,
    total_amount: itemsTotal, // For backwards compatibility
    notes: invoice.notes?.trim() || null,
    payment_terms: invoice.payment_terms || 'Net 30',
    shipping_method: invoice.shipping_method || null,
    status: invoice.status || 'pending',
    due_date: invoice.due_date || null
  };
}

export function validateBuyerData(buyer) {
  const errors = [];

  if (!buyer.name || buyer.name.trim() === '') {
    errors.push('Buyer name is required');
  }

  if (!buyer.email || buyer.email.trim() === '') {
    errors.push('Buyer email is required');
  } else if (!isValidEmail(buyer.email)) {
    errors.push('Invalid email format');
  }

  if (buyer.state && buyer.state.length !== 2) {
    errors.push('State must be 2-letter code (e.g., CA)');
  }

  if (buyer.zip && !/^\d{5}(-\d{4})?$/.test(buyer.zip)) {
    errors.push('Invalid ZIP code format');
  }

  if (buyer.phone && !/^[\d\s\-\(\)\+]+$/.test(buyer.phone)) {
    errors.push('Invalid phone number format');
  }

  return errors;
}

export function sanitizeBuyerData(buyer) {
  return {
    name: buyer.name?.trim() || null,
    email: buyer.email?.trim()?.toLowerCase() || null,
    phone: buyer.phone?.trim()?.replace(/[^\d\+]/g, '') || null,
    company: buyer.company?.trim() || null,
    address: buyer.address?.trim() || null,
    city: buyer.city?.trim() || null,
    state: buyer.state?.trim()?.toUpperCase()?.substring(0, 2) || null,
    zip: buyer.zip?.trim() || null,
    country: buyer.country || 'US'
  };
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function calculateInvoiceTotals(items, shippingCost = 0, taxRate = 0) {
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price || item.selling_price || 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const tax = subtotal * taxRate;
  const shipping = parseFloat(shippingCost) || 0;
  const total = subtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}