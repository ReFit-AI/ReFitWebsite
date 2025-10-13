import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Shippo from 'shippo'

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const shippo = new Shippo({
  apiToken: process.env.SHIPPO_API_KEY
})

export async function POST(req, { params }) {
  try {
    const { walletAddress, carrierAccount, serviceLevel } = await req.json()
    const invoiceId = params.id

    // Verify admin wallet
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 401 })
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, buyers(*)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 })
    }

    // Get invoice items for package details
    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)

    // Create shipment
    const shipment = await shippo.shipments.create({
      address_from: {
        name: "ReFit",
        street1: "123 Main St", // Update with actual address
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "US",
        phone: "4151234567",
        email: "shipping@refit.ai"
      },
      address_to: {
        name: invoice.buyers.name,
        company: invoice.buyers.company || "",
        street1: invoice.buyers.address || "123 Default St",
        street2: "",
        city: invoice.buyers.city || "Los Angeles",
        state: invoice.buyers.state || "CA",
        zip: invoice.buyers.zip || "90001",
        country: invoice.buyers.country || "US",
        phone: invoice.buyers.phone || "",
        email: invoice.buyers.email
      },
      parcels: [{
        length: "10",
        width: "8",
        height: "5",
        distance_unit: "in",
        weight: items.length * 0.5, // Estimate 0.5 lbs per phone
        mass_unit: "lb"
      }]
    })

    // Get rates
    const rates = shipment.rates.filter(rate => {
      if (carrierAccount && serviceLevel) {
        return rate.carrier_account === carrierAccount &&
               rate.servicelevel.name === serviceLevel
      }
      // Default to cheapest if not specified
      return true
    })

    if (rates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No shipping rates available'
      }, { status: 400 })
    }

    // Use specified rate or cheapest
    const selectedRate = rates.sort((a, b) =>
      parseFloat(a.amount) - parseFloat(b.amount)
    )[0]

    // Purchase label
    const transaction = await shippo.transactions.create({
      rate: selectedRate.object_id,
      label_file_type: "PDF",
      async: false
    })

    if (transaction.status !== "SUCCESS") {
      return NextResponse.json({
        success: false,
        error: 'Failed to create shipping label'
      }, { status: 400 })
    }

    // Update invoice with shipping info
    await supabase
      .from('invoices')
      .update({
        shipping_tracking: transaction.tracking_number,
        shipping_label_url: transaction.label_url,
        shipping_carrier: selectedRate.provider,
        shipping_cost: parseFloat(selectedRate.amount),
        shipped_at: new Date().toISOString()
      })
      .eq('id', invoiceId)

    return NextResponse.json({
      success: true,
      label: {
        tracking_number: transaction.tracking_number,
        label_url: transaction.label_url,
        carrier: selectedRate.provider,
        service: selectedRate.servicelevel.name,
        cost: selectedRate.amount,
        eta: selectedRate.estimated_days
      }
    })

  } catch (error) {
    console.error('Label generation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Get label status
export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')
    const invoiceId = params.id

    // Verify admin wallet
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 401 })
    }

    // Get invoice shipping details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('shipping_tracking, shipping_label_url, shipping_carrier, shipping_cost, shipped_at')
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      hasLabel: !!invoice.shipping_label_url,
      shipping: invoice
    })

  } catch (error) {
    console.error('Get label error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}