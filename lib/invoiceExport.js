export function generateInvoicePDF(invoice) {
  // Dynamic imports to avoid SSR issues
  if (typeof window === 'undefined') return null

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jsPDF = require('jspdf').default
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('jspdf-autotable')

  const doc = new jsPDF()

  // Add logo/header
  doc.setFontSize(24)
  doc.setTextColor(153, 69, 255) // Purple
  doc.text('ReFit', 20, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Phone Trade-in Platform', 20, 27)

  // Invoice title
  doc.setFontSize(16)
  doc.setTextColor(0)
  doc.text('INVOICE', 150, 20)

  // Invoice details
  doc.setFontSize(10)
  doc.text(`Invoice #: ${invoice.invoice_number}`, 150, 27)
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 150, 33)
  if (invoice.due_date) {
    doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 150, 39)
  }

  // Bill To section
  doc.setFontSize(12)
  doc.text('Bill To:', 20, 50)
  doc.setFontSize(10)
  const billToY = 57
  if (invoice.buyer_name) doc.text(invoice.buyer_name, 20, billToY)
  if (invoice.buyer_email) doc.text(invoice.buyer_email, 20, billToY + 6)
  if (invoice.buyer_phone) doc.text(invoice.buyer_phone, 20, billToY + 12)

  // Shipping address
  if (invoice.buyer_address_line1) {
    let addrY = billToY + 18
    doc.text(invoice.buyer_address_line1, 20, addrY)
    if (invoice.buyer_address_line2) {
      addrY += 6
      doc.text(invoice.buyer_address_line2, 20, addrY)
    }
    addrY += 6
    const cityState = `${invoice.buyer_city}, ${invoice.buyer_state} ${invoice.buyer_zip}`
    doc.text(cityState, 20, addrY)
  }

  // Items table
  const tableStartY = 100
  const items = invoice.invoice_items.map(item => [
    item.model,
    item.imei,
    `$${parseFloat(item.price).toFixed(2)}`
  ])

  doc.autoTable({
    startY: tableStartY,
    head: [['Model', 'IMEI', 'Price']],
    body: items,
    theme: 'grid',
    headStyles: { fillColor: [153, 69, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60 },
      2: { cellWidth: 40, halign: 'right' }
    }
  })

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.text(`Total: $${parseFloat(invoice.total_amount).toFixed(2)}`, 150, finalY, { align: 'right' })

  if (invoice.shipping_cost && parseFloat(invoice.shipping_cost) > 0) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Shipping: $${parseFloat(invoice.shipping_cost).toFixed(2)}`, 150, finalY + 7, { align: 'right' })
    doc.setFontSize(12)
    doc.setTextColor(0)
    const grandTotal = parseFloat(invoice.total_amount) + parseFloat(invoice.shipping_cost)
    doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 150, finalY + 14, { align: 'right' })
  }

  // Notes
  if (invoice.notes) {
    const notesY = finalY + 30
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Notes:', 20, notesY)
    doc.setTextColor(0)
    const splitNotes = doc.splitTextToSize(invoice.notes, 170)
    doc.text(splitNotes, 20, notesY + 7)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Thank you for your business!', 105, 280, { align: 'center' })
  doc.text('shoprefit.com', 105, 285, { align: 'center' })

  // Status watermark
  if (invoice.status === 'paid') {
    doc.setFontSize(60)
    doc.setTextColor(34, 197, 94, 0.1)
    doc.text('PAID', 105, 150, { align: 'center', angle: 45 })
  } else if (invoice.status === 'cancelled') {
    doc.setFontSize(60)
    doc.setTextColor(239, 68, 68, 0.1)
    doc.text('CANCELLED', 105, 150, { align: 'center', angle: 45 })
  }

  return doc
}

export function downloadInvoicePDF(invoice) {
  const doc = generateInvoicePDF(invoice)
  doc.save(`${invoice.invoice_number}.pdf`)
}

export function downloadInvoiceExcel(invoice) {
  // Dynamic import to avoid SSR issues
  if (typeof window === 'undefined') return

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx')

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Invoice header
  const headerData = [
    ['ReFit Invoice'],
    [],
    ['Invoice Number:', invoice.invoice_number],
    ['Date:', new Date(invoice.created_at).toLocaleDateString()],
    ['Status:', invoice.status.toUpperCase()],
    [],
    ['BILL TO:'],
    ['Name:', invoice.buyer_name || ''],
    ['Email:', invoice.buyer_email || ''],
    ['Phone:', invoice.buyer_phone || ''],
    ['Address:', invoice.buyer_address_line1 || ''],
    ['', invoice.buyer_address_line2 || ''],
    ['', `${invoice.buyer_city || ''}, ${invoice.buyer_state || ''} ${invoice.buyer_zip || ''}`],
    [],
    ['ITEMS:'],
    ['Model', 'IMEI', 'Price']
  ]

  // Add items
  const itemsData = invoice.invoice_items.map(item => [
    item.model,
    item.imei,
    parseFloat(item.price)
  ])

  const allData = [...headerData, ...itemsData]

  // Add totals
  allData.push([])
  allData.push(['', 'Subtotal:', parseFloat(invoice.total_amount)])

  if (invoice.shipping_cost && parseFloat(invoice.shipping_cost) > 0) {
    allData.push(['', 'Shipping:', parseFloat(invoice.shipping_cost)])
    const grandTotal = parseFloat(invoice.total_amount) + parseFloat(invoice.shipping_cost)
    allData.push(['', 'Grand Total:', grandTotal])
  }

  if (invoice.notes) {
    allData.push([])
    allData.push(['Notes:', invoice.notes])
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allData)

  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Model/labels
    { wch: 20 }, // IMEI/values
    { wch: 15 }  // Price
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice')

  // Download
  XLSX.writeFile(wb, `${invoice.invoice_number}.xlsx`)
}
