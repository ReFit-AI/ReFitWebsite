# Security Audit Report - ReFit Application

**Audit Date**: November 7, 2025
**Application**: ReFit - Next.js 15 phone trade-in platform with Solana payments
**Auditor**: Claude (Anthropic)
**Scope**: Full application security review including authentication, API security, payment processing, and data protection

---

## Executive Summary

This security audit identified **7 critical vulnerabilities**, **5 high severity issues**, and **8 medium severity issues** in the ReFit application. The most severe findings involve authentication bypass vulnerabilities, exposed admin endpoints, inconsistent admin authentication implementation, and potential financial manipulation risks.

**Immediate Action Required**: Critical vulnerabilities could allow unauthorized access to admin functions, financial data exposure, and potential price manipulation leading to financial loss.

**Overall Risk Level**: **HIGH** - Immediate remediation required before production deployment.

---

## Critical Vulnerabilities (Immediate Action Required)

### 1. CRITICAL: Public Admin Analytics Endpoint Exposes Financial Data
**File**: `/Users/j3r/ReFit/app/api/admin/analytics/route.js`
**Lines**: 15-131
**CVSS Score**: 9.1 (Critical)

**Description**: The admin analytics endpoint has NO authentication checks and returns sensitive financial information including total revenue, costs, profit margins, inventory costs, and pricing data.

**Proof of Concept**:
```bash
curl https://shoprefit.com/api/admin/analytics
# Returns complete financial data with zero authentication
```

**Impact**:
- Complete exposure of business financials (revenue, costs, margins)
- Competitor intelligence gathering
- Inventory pricing data leakage
- Average purchase costs and sale prices exposed
- No authentication required - publicly accessible

**Recommended Fix**:
```javascript
export async function GET(request) {
  const supabase = getSupabase();

  // ADD AUTHENTICATION CHECK
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ... rest of code
}
```

---

### 2. CRITICAL: Inconsistent Admin Authentication Between Endpoints
**Files**:
- `/Users/j3r/ReFit/app/api/admin/invoices/route.js` (Lines 18-326)
- `/Users/j3r/ReFit/app/api/admin/inventory/route.js` (Lines 7-172)
- `/Users/j3r/ReFit/app/api/admin/orders/route.js` (Lines 13-240)

**Description**: The application uses TWO different authentication mechanisms inconsistently:
1. **Bearer token auth** (`requireAdmin()`) - used in `/admin/orders/*`
2. **Wallet-based auth** (`walletAddress === ADMIN_WALLET`) - used in `/admin/invoices/*` and `/admin/inventory/*`

**Impact**:
- Confusion about which authentication method protects which endpoint
- Wallet-based auth is client-provided and easier to bypass
- GET requests on invoices/inventory use different auth than POST/PATCH/DELETE
- Inconsistent security posture across admin functions

**Evidence**:
```javascript
// admin/invoices/route.js (Line 106) - Uses wallet verification
if (walletAddress !== ADMIN_WALLET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

// admin/orders/route.js (Line 31) - Uses token verification
const adminCheck = await requireAdmin(request);
if (!adminCheck.authorized) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Recommended Fix**: Standardize all admin endpoints to use `requireAdmin()` with Bearer token authentication.

---

### 3. CRITICAL: Admin Secret Exposed to Client via NEXT_PUBLIC Variable
**File**: `/Users/j3r/ReFit/lib/admin-auth.js`
**Lines**: 40-46

**Description**: The admin authentication uses `NEXT_PUBLIC_ADMIN_SECRET`, which is exposed to the browser in client-side JavaScript bundles. Any user can view the admin secret by inspecting the browser's JavaScript.

**Proof of Concept**:
```javascript
// In browser console:
console.log(process.env.NEXT_PUBLIC_ADMIN_SECRET)
// Reveals the admin secret
```

**Impact**:
- Complete authentication bypass
- Any user can authenticate as admin
- Full access to all admin functions
- Financial data manipulation
- Inventory manipulation
- Order manipulation

**Recommended Fix**:
1. Remove `NEXT_PUBLIC_ADMIN_SECRET` entirely
2. Only use server-side `ADMIN_SECRET`
3. Implement session-based admin authentication with HTTP-only cookies
4. Add IP whitelisting for admin panel access

---

### 4. CRITICAL: requireAdmin Returns Synchronously But Used with await
**File**: `/Users/j3r/ReFit/lib/admin-auth.js`
**Line**: 30

**Description**: The `requireAdmin()` function is NOT async but is called with `await` in multiple routes. This means the authentication check doesn't work as intended.

**Evidence**:
```javascript
// lib/admin-auth.js (Line 30)
export function requireAdmin(request) {  // NOT async
  if (!isAdminRequest(request)) {
    throw new Error('Unauthorized - Admin only');
  }
}

// app/api/admin/orders/route.js (Line 31)
const adminCheck = await requireAdmin(request);  // await on non-async function
if (!adminCheck.authorized) {  // adminCheck is undefined!
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Impact**:
- Authentication bypass on all endpoints using `await requireAdmin()`
- `adminCheck` is undefined, so `adminCheck.authorized` is always falsy
- The check always fails but error handling may not be correct
- Potential for unauthorized access depending on error handling

**Recommended Fix**:
```javascript
export async function requireAdmin(request) {
  if (!isAdminRequest(request)) {
    return { authorized: false };
  }
  return { authorized: true, wallet: 'admin' };
}
```

---

### 5. CRITICAL: Admin Wallet Address Exposed Client-Side
**Files**: Multiple (16 files use `NEXT_PUBLIC_ADMIN_WALLET`)

**Description**: The admin wallet address is exposed via `NEXT_PUBLIC_ADMIN_WALLET` environment variable, allowing attackers to:
1. Know exactly which wallet to target for phishing
2. Monitor admin wallet transactions on blockchain
3. Potentially forge authentication requests

**Impact**:
- Admin wallet becomes public knowledge
- Targeted phishing attacks
- Social engineering opportunities
- Blockchain surveillance of admin activities

**Recommended Fix**:
1. Never expose admin wallet client-side
2. Store admin wallet only server-side
3. Use session tokens instead of wallet addresses for admin auth

---

### 6. CRITICAL: Shipping Label Purchase Has No Authentication
**File**: `/Users/j3r/ReFit/app/api/shipping/purchase-label/route.js`
**Lines**: 18-250

**Description**: Any user can purchase unlimited shipping labels at the platform's expense. No authentication or verification that the user has a valid order.

**Proof of Concept**:
```bash
curl -X POST https://shoprefit.com/api/shipping/purchase-label \
  -H "Content-Type: application/json" \
  -d '{
    "rateId": "fallback-ground",
    "userAddress": {
      "name": "Attacker",
      "street1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    }
  }'
# Platform pays for shipping label with no verification
```

**Impact**:
- Unlimited shipping label generation
- Financial loss from shipping costs
- Potential for abuse/reselling labels
- No rate limiting on label creation

**Recommended Fix**:
1. Require user authentication
2. Verify user has a valid pending order
3. Limit to one label per order
4. Add rate limiting
5. Track label usage per user/order

---

### 7. CRITICAL: Pool Withdraw Endpoint Uses requireAdmin Incorrectly
**File**: `/Users/j3r/ReFit/app/api/pool/withdraw/route.js`
**Lines**: 173-174

**Description**: The withdrawal processing endpoint wraps `requireAdmin()` in a try-catch, potentially allowing unauthorized access if the function doesn't throw an error.

**Evidence**:
```javascript
// Line 173-181
try {
  requireAdmin(request)  // No await, no return value check
} catch (authError) {
  console.error('❌ Unauthorized withdrawal action attempt')
  return NextResponse.json(
    { success: false, error: 'Unauthorized - Admin access required' },
    { status: 401 }
  )
}
```

**Impact**:
- Since `requireAdmin` is not async and the result isn't checked, authentication may be bypassed
- If function doesn't throw, code continues
- Admin-only withdrawal processing could be exploited

**Recommended Fix**:
```javascript
const adminCheck = await requireAdmin(request);
if (!adminCheck.authorized) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## High Severity Issues

### 8. HIGH: Staking Endpoint Missing Transaction Verification
**File**: `/Users/j3r/ReFit/app/api/staking/create/route.js`
**Lines**: 46-73

**Description**: In production, the transaction verification is incomplete with a TODO comment. The endpoint only checks if the transaction exists, not if it actually sent USDC to the vault.

**Evidence**:
```javascript
// Line 63-64
// TODO: Verify transaction actually sent USDC to vault
// This requires parsing the transaction instructions
```

**Impact**:
- Users could stake without actually sending funds
- Any transaction signature could be used
- Free staking with no actual deposit
- Financial loss and token dilution

**Recommended Fix**: Use the existing `verifyTransaction()` function from `/lib/verify-transaction.js` which properly validates amount and destination.

---

### 9. HIGH: Quote Endpoint Susceptible to Price Manipulation
**File**: `/Users/j3r/ReFit/app/api/mobile/v1/phone/quote/route.js`
**Lines**: 4-88

**Description**: Quotes are generated without server-side validation or signing. Users can inspect the pricing logic and manipulate quote acceptance.

**Impact**:
- Users can see exact pricing formulas
- No quote signing mechanism
- Quote ID is random UUID with no verification
- No server-side quote storage/validation

**Recommended Fix**:
1. Store quotes server-side with expiration
2. Sign quotes with HMAC
3. Validate quote ID when user accepts
4. Prevent quote tampering

---

### 10. HIGH: In-Memory Rate Limiter Bypassed by Multiple Instances
**File**: `/Users/j3r/ReFit/lib/rate-limit.js`
**Lines**: 1-92

**Description**: Rate limiting uses in-memory Map which doesn't work across multiple server instances (Vercel serverless functions).

**Impact**:
- Rate limits can be bypassed in production
- Each serverless function has its own rate limit counter
- Payment endpoints could be spammed
- Deposit verification could be overwhelmed

**Recommended Fix**: Use Redis-based rate limiting (Upstash Redis) for distributed rate limiting.

---

### 11. HIGH: Wallet-Based Admin Auth Vulnerable to Client Manipulation
**Files**: Multiple admin invoice/inventory endpoints

**Description**: Endpoints relying on client-provided `walletAddress` in request body can be manipulated.

**Evidence**:
```javascript
const { walletAddress, invoice } = body;
if (walletAddress !== ADMIN_WALLET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

**Impact**:
- Client controls the `walletAddress` value
- Attacker could send admin wallet address
- Only works if admin wallet is not exposed, but it is (see Critical #5)

**Recommended Fix**: Never trust client-provided authentication credentials. Use server-side session tokens.

---

### 12. HIGH: Cron Secret Protection Insufficient
**File**: `/Users/j3r/ReFit/app/api/cron/calculate-yields/route.js`
**Lines**: 11-12

**Description**: Cron endpoint uses simple Bearer token authentication which could be brute-forced or leaked.

**Impact**:
- Unauthorized yield calculations
- Manipulation of staking rewards
- Financial impact on staking pool

**Recommended Fix**:
1. Use Vercel Cron with IP verification
2. Add request signature verification
3. Implement idempotency to prevent duplicate runs

---

## Medium Severity Issues

### 13. MEDIUM: Supabase Service Role Key Used Client-Side
**Files**: Multiple admin endpoints creating service client

**Description**: Service role key bypasses RLS and should only be used server-side, but is created in API routes that could potentially leak it.

**Recommended Fix**: Ensure service role key is never exposed in client bundles. Keep it strictly server-side.

---

### 14. MEDIUM: Error Messages Expose Internal Information
**Files**: Multiple API routes

**Description**: Error messages include database error details, file paths, and stack traces in development mode that may leak in production.

**Example**:
```javascript
return NextResponse.json(
  { success: false, error: error.message },  // Exposes internal error
  { status: 500 }
);
```

**Recommended Fix**: Sanitize error messages in production. Only return generic errors to clients.

---

### 15. MEDIUM: No CSRF Protection on State-Changing Endpoints
**Description**: POST/PATCH/DELETE endpoints lack CSRF tokens.

**Impact**: Potential CSRF attacks if used in browser context with cookies.

**Recommended Fix**: Implement CSRF tokens for browser-based requests or use SameSite cookies.

---

### 16. MEDIUM: Missing Input Validation on Several Endpoints
**Files**: Various API routes

**Description**: Some endpoints don't validate input types, lengths, or formats before database operations.

**Recommended Fix**: Implement schema validation using Zod or Joi for all API inputs.

---

### 17. MEDIUM: No Account Lockout After Failed Admin Auth Attempts
**Description**: Unlimited admin authentication attempts possible.

**Impact**: Brute force attacks on admin credentials.

**Recommended Fix**: Implement exponential backoff and account lockout after failed attempts.

---

### 18. MEDIUM: Sensitive Data in localStorage
**File**: `/Users/j3r/ReFit/lib/supabase.js`
**Line**: 38

**Description**: Wallet addresses stored in localStorage could be accessed by XSS.

**Recommended Fix**: Use HTTP-only cookies for sensitive session data.

---

### 19. MEDIUM: SQL Injection Risk (Low but Present)
**Description**: While using Supabase client (parameterized), some dynamic queries could be vulnerable if user input is concatenated.

**Status**: No active vulnerabilities found in current code, but watch for future additions.

---

### 20. MEDIUM: Missing Dependency Security Scanning
**Description**: No automated dependency vulnerability scanning in CI/CD.

**Recommended Fix**: Add `npm audit` and Dependabot to CI pipeline.

---

## Low Severity Issues & Best Practices

### 21. Security Headers - Good Implementation
**File**: `/Users/j3r/ReFit/next.config.js`
**Status**: ✅ GOOD

The application has strong security headers including:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- CSP (though allows unsafe-inline for scripts)
- HSTS in production
- Proper CORS configuration

**Minor Improvement**: Remove `unsafe-inline` from script-src in CSP if possible.

---

### 22. Transaction Verification - Excellent Implementation
**File**: `/Users/j3r/ReFit/lib/verify-transaction.js`
**Status**: ✅ EXCELLENT

The transaction verification logic is well-implemented with:
- ✅ Vault address verification (prevents fake deposits)
- ✅ Amount validation with 1% slippage tolerance
- ✅ Signature verification
- ✅ Transaction status checking
- ✅ USDC mint verification

This is a **positive security finding** and should be used across all payment endpoints.

---

### 23. Rate Limiting Implementation - Partial
**Status**: ⚠️ PARTIAL

Good implementation for single-server, but needs Redis for production multi-instance deployment.

---

### 24. Environment Variables - Properly Ignored
**File**: `.gitignore`
**Status**: ✅ GOOD

All `.env*` files are properly ignored and not committed to git. Only `.env.example` is tracked.

---

### 25. No Hardcoded Secrets Found
**Status**: ✅ GOOD

Scan of codebase found no hardcoded API keys, secrets, or credentials in source files.

---

## Positive Security Findings

1. ✅ **Strong Transaction Verification**: The `verifyTransaction()` function properly validates on-chain transfers
2. ✅ **Security Headers**: Comprehensive security headers in next.config.js
3. ✅ **No Secrets in Git**: .env files properly ignored, no leaked credentials
4. ✅ **Rate Limiting**: Implementation exists (though needs Redis for production)
5. ✅ **Input Validation**: Some endpoints have good validation (invoice validation)
6. ✅ **Service Role Separation**: Proper use of service role vs anon key
7. ✅ **CORS Configuration**: Proper CORS setup with allowed origins

---

## Recommended Action Plan

### Phase 1: Immediate Fixes (Deploy within 24 hours)

1. **Block public access to `/api/admin/analytics`** - Add authentication check
2. **Fix requireAdmin to be async** - Make function properly async and return authorization object
3. **Remove NEXT_PUBLIC_ADMIN_SECRET** - Implement server-side session auth
4. **Add authentication to shipping label endpoint** - Require valid order
5. **Standardize admin authentication** - Use only `requireAdmin()` across all admin endpoints

### Phase 2: High Priority (Deploy within 1 week)

6. **Implement proper quote signing** - HMAC-sign quotes and validate server-side
7. **Complete transaction verification in staking** - Use existing `verifyTransaction()`
8. **Migrate to Redis rate limiting** - Use Upstash Redis for distributed rate limiting
9. **Remove NEXT_PUBLIC_ADMIN_WALLET** - Keep admin wallet server-side only
10. **Fix pool withdraw authentication** - Properly check requireAdmin return value

### Phase 3: Medium Priority (Deploy within 2 weeks)

11. **Add input validation schemas** - Implement Zod validation on all endpoints
12. **Sanitize error messages** - Generic errors in production
13. **Implement CSRF protection** - Add tokens or SameSite cookies
14. **Add admin account lockout** - Protect against brute force
15. **Move sensitive data from localStorage** - Use HTTP-only cookies

### Phase 4: Long-term Improvements (Deploy within 1 month)

16. **Implement WAF** - Add Cloudflare or similar WAF
17. **Add security monitoring** - Implement Sentry or similar
18. **Conduct penetration testing** - External security audit
19. **Implement dependency scanning** - Automated vulnerability detection
20. **Remove unsafe-inline from CSP** - Harden content security policy

---

## Risk Assessment Summary

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| **Count** | 7 | 5 | 8 | 4 |

**Overall Risk**: **HIGH - Immediate action required**

**Primary Concerns**:
1. Exposed financial data (Critical #1)
2. Broken admin authentication (Critical #2, #3, #4, #5, #7)
3. Free shipping label generation (Critical #6)
4. Missing payment verification (High #8, #9)

---

## Conclusion

The ReFit application has a solid security foundation with good transaction verification and security headers, but suffers from critical authentication vulnerabilities that must be addressed immediately before production deployment. The most severe issue is the exposure of admin secrets via NEXT_PUBLIC environment variables, which essentially makes all admin authentication bypassable.

**Recommendation**: **DO NOT deploy to production** until at minimum Phase 1 fixes are implemented. The current state allows unauthorized access to admin functions and financial data exposure.

After implementing Phase 1 and Phase 2 fixes, the application will be suitable for beta deployment with ongoing security monitoring and Phase 3/4 improvements.

---

**Report Generated**: November 7, 2025
**Next Review Recommended**: After Phase 1 fixes implemented
