// Browser-side shipping service that calls API routes
import axios from 'axios'

class BrowserShippingService {
  async validateAddress(address) {
    try {
      const response = await axios.post('/api/shipping/validate-address', address)
      return response.data
    } catch (error) {
      console.error('Address validation error:', error)
      return { 
        success: false, 
        error: error.message,
        messages: ['Failed to validate address']
      }
    }
  }

  async getRates(fromAddress, toAddress, parcel = null) {
    try {
      const response = await axios.post('/api/shipping/rates', {
        fromAddress,
        toAddress,
        parcel
      })
      return response.data
    } catch (error) {
      console.error('Get rates error:', error)
      return { 
        success: false, 
        error: error.message,
        rates: []
      }
    }
  }

  async purchaseLabel(rateId, userAddress) {
    try {
      const response = await axios.post('/api/shipping/purchase-label', {
        rateId,
        userAddress
      })
      return response.data
    } catch (error) {
      console.error('Purchase label error - Full details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data,
        fullError: error
      })
      
      // Extract error message from response or use default
      const errorMessage = error.response?.data?.error || error.message || 'Failed to purchase shipping label'
      const errorDetails = error.response?.data?.details || error.response?.data
      
      // Log details for debugging
      if (errorDetails) {
        console.error('Error details:', JSON.stringify(errorDetails, null, 2))
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      }
    }
  }
}

export default BrowserShippingService
