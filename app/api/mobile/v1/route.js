import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    endpoints: {
      auth: {
        connect: '/api/mobile/v1/auth/connect',
        verify: '/api/mobile/v1/auth/verify',
        disconnect: '/api/mobile/v1/auth/disconnect'
      },
      phone: {
        models: '/api/mobile/v1/phone/models',
        quote: '/api/mobile/v1/phone/quote',
        validate: '/api/mobile/v1/phone/validate'
      },
      orders: {
        create: '/api/mobile/v1/orders/create',
        list: '/api/mobile/v1/orders',
        detail: '/api/mobile/v1/orders/[id]',
        status: '/api/mobile/v1/orders/[id]/status'
      },
      shipping: {
        validate: '/api/mobile/v1/shipping/validate',
        label: '/api/mobile/v1/shipping/label'
      },
      wallet: {
        balance: '/api/mobile/v1/wallet/balance',
        transactions: '/api/mobile/v1/wallet/transactions'
      }
    },
    features: {
      seedVault: true,
      mobileWalletAdapter: true,
      pushNotifications: true,
      cameraIntegration: true
    }
  });
}