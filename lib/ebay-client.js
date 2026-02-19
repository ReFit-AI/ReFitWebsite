/**
 * Server-only eBay client wrapper using ebay-api npm package
 * Handles OAuth, order syncing, and tracking URL generation
 * DO NOT import this in client-side code
 */

import eBayApi from 'ebay-api'
import { supabaseAdmin } from '@/lib/supabase-server'

const EBAY_CONFIG = {
  appId: process.env.EBAY_APP_ID,
  certId: process.env.EBAY_CERT_ID,
  devId: process.env.EBAY_DEV_ID,
  redirectUri: process.env.EBAY_REDIRECT_URI,
  sandbox: process.env.EBAY_ENVIRONMENT !== 'PRODUCTION'
}

// Carrier tracking URL templates
const CARRIER_URLS = {
  UPS: (num) => `https://www.ups.com/track?tracknum=${num}`,
  USPS: (num) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`,
  FedEx: (num) => `https://www.fedex.com/fedextrack/?trknbr=${num}`,
  DHL: (num) => `https://www.dhl.com/us-en/home/tracking/tracking-parcel.html?submit=1&tracking-id=${num}`,
}

/**
 * Auto-detect carrier from tracking number pattern
 */
function detectCarrier(trackingNumber) {
  if (!trackingNumber) return null
  const num = trackingNumber.trim()
  if (num.startsWith('1Z')) return 'UPS'
  if (/^(94|92|93|70|23|13|M|EA|CP)/.test(num)) return 'USPS'
  if (/^[0-9]{12,22}$/.test(num) && (num.length === 12 || num.length === 15 || num.length === 20 || num.length === 22)) return 'FedEx'
  if (/^[0-9]{10}$/.test(num)) return 'DHL'
  return null
}

/**
 * Build a clickable tracking URL for a given carrier and tracking number
 */
export function buildTrackingUrl(carrier, trackingNumber) {
  if (!trackingNumber) return null
  const normalizedCarrier = carrier || detectCarrier(trackingNumber)
  if (!normalizedCarrier) return null
  const builder = CARRIER_URLS[normalizedCarrier]
  return builder ? builder(trackingNumber) : null
}

/**
 * Create a configured eBay API instance (unauthenticated, for OAuth flow)
 */
function createEbayInstance() {
  return new eBayApi({
    appId: EBAY_CONFIG.appId,
    certId: EBAY_CONFIG.certId,
    devId: EBAY_CONFIG.devId,
    sandbox: EBAY_CONFIG.sandbox,
    ruName: EBAY_CONFIG.redirectUri,
    scope: [
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    ]
  })
}

/**
 * Create a configured eBay API instance with user tokens (for authenticated calls)
 */
async function createAuthenticatedEbayInstance(accountId) {
  const account = await getAccount(accountId)
  if (!account) throw new Error('eBay account not found')
  if (!account.is_active) throw new Error('eBay account is disconnected')

  // Auto-refresh if token is expired or expiring soon
  const refreshedAccount = await refreshTokenIfNeeded(account)

  const eBay = new eBayApi({
    appId: EBAY_CONFIG.appId,
    certId: EBAY_CONFIG.certId,
    devId: EBAY_CONFIG.devId,
    sandbox: EBAY_CONFIG.sandbox,
    ruName: EBAY_CONFIG.redirectUri,
    scope: [
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    ]
  })

  eBay.OAuth2.setCredentials({
    access_token: refreshedAccount.access_token,
    refresh_token: refreshedAccount.refresh_token,
    expires_in: Math.floor((new Date(refreshedAccount.token_expires_at) - Date.now()) / 1000)
  })

  return eBay
}

/**
 * Get the active eBay account from DB
 */
async function getAccount(accountId) {
  if (accountId) {
    const { data } = await supabaseAdmin
      .from('ebay_accounts')
      .select('*')
      .eq('id', accountId)
      .single()
    return data
  }
  // Get the first active account
  const { data } = await supabaseAdmin
    .from('ebay_accounts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

/**
 * Generate eBay OAuth consent URL for user authorization
 */
export function getAuthUrl() {
  const eBay = createEbayInstance()
  const authUrl = eBay.OAuth2.generateAuthUrl()
  return authUrl
}

/**
 * Exchange authorization code for access + refresh tokens, store in DB
 */
export async function exchangeCodeForTokens(code) {
  const eBay = createEbayInstance()
  const tokenResponse = await eBay.OAuth2.getToken(code)

  // Get user info to find eBay username
  eBay.OAuth2.setCredentials(tokenResponse)

  let ebayUsername = 'unknown'
  try {
    // Try Trading API GetUser to get the username
    const userResponse = await eBay.trading.GetUser()
    ebayUsername = userResponse?.User?.UserID || 'unknown'
  } catch {
    // If Trading API fails, still save the tokens
    console.warn('Could not fetch eBay username, saving as unknown')
  }

  const expiresAt = new Date(Date.now() + (tokenResponse.expires_in || 7200) * 1000)
  const refreshExpiresAt = new Date(Date.now() + (tokenResponse.refresh_token_expires_in || 47304000) * 1000) // ~18 months

  // Upsert account (deactivate any existing accounts first)
  await supabaseAdmin
    .from('ebay_accounts')
    .update({ is_active: false })
    .eq('is_active', true)

  const { data, error } = await supabaseAdmin
    .from('ebay_accounts')
    .insert({
      ebay_username: ebayUsername,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      refresh_token_expires_at: refreshExpiresAt.toISOString(),
      is_active: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Store a manually-provided OAuth token (from eBay Developer Portal)
 */
export async function storeManualToken(accessToken, refreshToken) {
  // Deactivate any existing accounts
  await supabaseAdmin
    .from('ebay_accounts')
    .update({ is_active: false })
    .eq('is_active', true)

  // Try to get username using the provided token
  let ebayUsername = 'unknown'
  try {
    const eBay = createEbayInstance()
    eBay.OAuth2.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    })
    const userResponse = await eBay.trading.GetUser()
    ebayUsername = userResponse?.User?.UserID || 'unknown'
  } catch {
    console.warn('Could not fetch eBay username with manual token')
  }

  // Access tokens from eBay portal expire in 2 hours
  // Refresh tokens expire in ~18 months
  const expiresAt = new Date(Date.now() + 7200 * 1000)
  const refreshExpiresAt = refreshToken
    ? new Date(Date.now() + 47304000 * 1000)
    : null

  const { data, error } = await supabaseAdmin
    .from('ebay_accounts')
    .insert({
      ebay_username: ebayUsername,
      access_token: accessToken,
      refresh_token: refreshToken || null,
      token_expires_at: expiresAt.toISOString(),
      refresh_token_expires_at: refreshExpiresAt?.toISOString() || null,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Check token expiry, auto-refresh if needed, persist to DB
 */
export async function refreshTokenIfNeeded(account) {
  if (!account) return null

  const now = new Date()
  const expiresAt = new Date(account.token_expires_at)
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  // Token still valid for 5+ minutes
  if (expiresAt > fiveMinutesFromNow) return account

  // Token expired or expiring soon — refresh it
  const eBay = createEbayInstance()
  eBay.OAuth2.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expires_in: 0
  })

  try {
    const tokenResponse = await eBay.OAuth2.refreshToken()
    const newExpiresAt = new Date(Date.now() + (tokenResponse.expires_in || 7200) * 1000)

    const { data, error } = await supabaseAdmin
      .from('ebay_accounts')
      .update({
        access_token: tokenResponse.access_token,
        token_expires_at: newExpiresAt.toISOString(),
        // Refresh token may also be rotated
        ...(tokenResponse.refresh_token && { refresh_token: tokenResponse.refresh_token })
      })
      .eq('id', account.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Failed to refresh eBay token:', err.message)
    throw new Error('eBay token refresh failed — reconnect your account')
  }
}

/**
 * Get eBay connection status
 */
export async function getConnectionStatus() {
  const account = await getAccount()
  if (!account) {
    return { connected: false, tokenStatus: 'none' }
  }

  const now = new Date()
  const expiresAt = new Date(account.token_expires_at)
  const refreshExpiresAt = account.refresh_token_expires_at ? new Date(account.refresh_token_expires_at) : null

  let tokenStatus = 'active'
  if (expiresAt < now && refreshExpiresAt && refreshExpiresAt < now) {
    tokenStatus = 'expired'
  } else if (expiresAt < now) {
    tokenStatus = 'expiring_soon' // Access expired but refresh still works
  } else if (expiresAt < new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
    tokenStatus = 'expiring_soon'
  }

  return {
    connected: true,
    accountId: account.id,
    ebayUsername: account.ebay_username,
    tokenStatus,
    lastSyncAt: account.last_sync_at,
    isActive: account.is_active
  }
}

/**
 * Normalize an eBay order into our ebay_purchases schema
 */
export function normalizeOrder(ebayOrder) {
  // Handle both Trading API (GetOrders) and RESTful API formats
  const orderId = ebayOrder.OrderID || ebayOrder.orderId
  const transactions = ebayOrder.TransactionArray?.Transaction || []
  const firstTx = Array.isArray(transactions) ? transactions[0] : transactions

  const itemId = firstTx?.Item?.ItemID || ebayOrder.lineItems?.[0]?.legacyItemId || null
  const title = firstTx?.Item?.Title || ebayOrder.lineItems?.[0]?.title || 'Unknown Item'
  const sellerUsername = firstTx?.Item?.Seller?.UserID || ebayOrder.seller?.username || null

  // Pricing
  const amountPaid = parseFloat(ebayOrder.AmountPaid?.value || ebayOrder.total?.value || 0)
  const shippingCost = parseFloat(
    ebayOrder.ShippingServiceSelected?.ShippingServiceCost?.value ||
    ebayOrder.deliveryCost?.shippingCost?.value || 0
  )
  const itemPrice = amountPaid - shippingCost

  // Tracking
  const shippingDetails = ebayOrder.ShippingDetails?.ShipmentTrackingDetails
  const trackingArray = Array.isArray(shippingDetails) ? shippingDetails : shippingDetails ? [shippingDetails] : []
  const firstTracking = trackingArray[0] || {}
  const trackingNumber = firstTracking.ShipmentTrackingNumber ||
    ebayOrder.fulfillmentHrefs?.[0]?.trackingNumber || null
  const shippingCarrier = firstTracking.ShippingCarrierUsed ||
    ebayOrder.fulfillmentHrefs?.[0]?.shippingCarrier || null

  // Status mapping
  const ebayStatus = ebayOrder.OrderStatus || ebayOrder.orderFulfillmentStatus || ''
  let orderStatus = 'Active'
  if (/complete|fulfilled/i.test(ebayStatus)) orderStatus = 'Delivered'
  else if (/shipped|in.transit/i.test(ebayStatus)) orderStatus = 'Shipped'
  else if (/cancel/i.test(ebayStatus)) orderStatus = 'Cancelled'

  return {
    ebay_order_id: orderId,
    ebay_item_id: itemId,
    title,
    price: itemPrice,
    shipping_cost: shippingCost,
    total_cost: amountPaid,
    seller_username: sellerUsername,
    tracking_number: trackingNumber,
    shipping_carrier: shippingCarrier,
    tracking_url: buildTrackingUrl(shippingCarrier, trackingNumber),
    order_status: orderStatus,
    order_date: ebayOrder.CreatedTime || ebayOrder.creationDate || new Date().toISOString(),
    raw_api_data: ebayOrder
  }
}

/**
 * Fetch orders from eBay (Trading API GetOrders)
 */
export async function getOrders(accountId, { from, to, page = 1, perPage = 100 } = {}) {
  const eBay = await createAuthenticatedEbayInstance(accountId)

  const now = new Date()
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

  const createTimeFrom = from || defaultFrom.toISOString()
  const createTimeTo = to || now.toISOString()

  const response = await eBay.trading.GetOrders({
    OrderRole: 'Buyer',
    OrderStatus: 'All',
    CreateTimeFrom: createTimeFrom,
    CreateTimeTo: createTimeTo,
    Pagination: {
      EntriesPerPage: perPage,
      PageNumber: page
    },
    DetailLevel: 'ReturnAll'
  })

  const orders = response.OrderArray?.Order || []
  const orderArray = Array.isArray(orders) ? orders : [orders]

  return {
    orders: orderArray,
    totalPages: parseInt(response.PaginationResult?.TotalNumberOfPages || 1),
    totalEntries: parseInt(response.PaginationResult?.TotalNumberOfEntries || orderArray.length),
    hasMore: response.HasMoreOrders === 'true' || response.HasMoreOrders === true
  }
}

/**
 * Sync purchases from eBay into DB. Upserts purchases, auto-harvests contacts.
 */
export async function syncPurchases(accountId, { from, to } = {}) {
  // Create sync log entry
  const { data: syncLog } = await supabaseAdmin
    .from('ebay_sync_log')
    .insert({ sync_type: 'purchases', status: 'running' })
    .select()
    .single()

  let totalFetched = 0, totalCreated = 0, totalUpdated = 0

  try {
    let page = 1
    let hasMore = true

    while (hasMore) {
      const result = await getOrders(accountId, { from, to, page })
      totalFetched += result.orders.length

      for (const ebayOrder of result.orders) {
        const normalized = normalizeOrder(ebayOrder)

        // Upsert purchase
        const { data: existing } = await supabaseAdmin
          .from('ebay_purchases')
          .select('id')
          .eq('ebay_order_id', normalized.ebay_order_id)
          .maybeSingle()

        if (existing) {
          await supabaseAdmin
            .from('ebay_purchases')
            .update(normalized)
            .eq('id', existing.id)
          totalUpdated++
        } else {
          await supabaseAdmin
            .from('ebay_purchases')
            .insert(normalized)
          totalCreated++
        }

        // Auto-harvest seller contact
        if (normalized.seller_username) {
          await harvestContact(normalized)
        }
      }

      hasMore = result.hasMore
      page++
    }

    // Update account last_sync_at
    const account = await getAccount(accountId)
    if (account) {
      await supabaseAdmin
        .from('ebay_accounts')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', account.id)
    }

    // Update sync log
    await supabaseAdmin
      .from('ebay_sync_log')
      .update({
        status: 'completed',
        records_fetched: totalFetched,
        records_created: totalCreated,
        records_updated: totalUpdated,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncLog.id)

    return { totalFetched, totalCreated, totalUpdated }
  } catch (err) {
    // Log failure
    if (syncLog) {
      await supabaseAdmin
        .from('ebay_sync_log')
        .update({
          status: 'failed',
          records_fetched: totalFetched,
          records_created: totalCreated,
          records_updated: totalUpdated,
          error_message: err.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', syncLog.id)
    }
    throw err
  }
}

/**
 * Upsert a seller into ebay_contacts from a purchase record
 */
async function harvestContact(purchase) {
  const { data: existing } = await supabaseAdmin
    .from('ebay_contacts')
    .select('*')
    .eq('ebay_username', purchase.seller_username)
    .maybeSingle()

  if (existing) {
    // Update aggregates
    const newTotal = (existing.total_purchases || 0) + 1
    const newSpent = parseFloat(existing.total_spent || 0) + parseFloat(purchase.total_cost || 0)
    const newAvg = newSpent / newTotal

    await supabaseAdmin
      .from('ebay_contacts')
      .update({
        total_purchases: newTotal,
        total_spent: newSpent,
        avg_deal_size: Math.round(newAvg * 100) / 100,
        last_purchase_at: purchase.order_date,
        // Upgrade relationship based on volume
        ...(newTotal >= 5 && existing.relationship === 'new' ? { relationship: 'active' } : {}),
        ...(newTotal >= 15 && existing.relationship === 'active' ? { relationship: 'vip' } : {})
      })
      .eq('id', existing.id)
  } else {
    await supabaseAdmin
      .from('ebay_contacts')
      .insert({
        ebay_username: purchase.seller_username,
        contact_type: 'seller',
        relationship: 'new',
        total_purchases: 1,
        total_spent: purchase.total_cost || 0,
        avg_deal_size: purchase.total_cost || 0,
        last_purchase_at: purchase.order_date
      })
  }
}
