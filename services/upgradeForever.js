/**
 * Upgrade Forever Service
 * Handles staking calculations, tracking, and upgrade fund management
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

// Current network APY (would fetch from validator in production)
const CURRENT_NETWORK_APY = 0.065 // 6.5%
const BONUS_APY_FIRST_100 = 0.005 // +0.5% for early adopters

export class UpgradeForeverService {
  /**
   * Calculate upgrade timeline based on trade value and stake percentage
   */
  static calculateUpgradeTimeline(tradeValue, stakePercentage, deviceGoalPrice) {
    const stakedAmount = (tradeValue * stakePercentage) / 100
    const instantPayout = tradeValue - stakedAmount
    const effectiveAPY = CURRENT_NETWORK_APY + BONUS_APY_FIRST_100
    const yearlyEarnings = stakedAmount * effectiveAPY
    const monthlyEarnings = yearlyEarnings / 12
    const timeToGoal = deviceGoalPrice / yearlyEarnings

    return {
      stakedAmount,
      instantPayout,
      yearlyEarnings,
      monthlyEarnings,
      timeToGoal,
      effectiveAPY: effectiveAPY * 100, // Convert to percentage
      projections: this.generateProjections(stakedAmount, effectiveAPY)
    }
  }

  /**
   * Generate multi-year projections
   */
  static generateProjections(stakedAmount, apy) {
    const projections = []
    let balance = stakedAmount

    for (let year = 1; year <= 5; year++) {
      const yearlyEarnings = balance * apy
      balance += yearlyEarnings
      
      projections.push({
        year,
        earnings: yearlyEarnings,
        totalBalance: balance,
        totalEarned: balance - stakedAmount
      })
    }

    return projections
  }

  /**
   * Create a new upgrade fund for a user
   */
  static async createUpgradeFund(walletAddress, tradeData) {
    try {
      const { 
        deviceModel, 
        tradeValue, 
        stakePercentage,
        deviceGoal,
        deviceGoalPrice 
      } = tradeData

      const calculations = this.calculateUpgradeTimeline(
        tradeValue, 
        stakePercentage, 
        deviceGoalPrice
      )

      // Store in database
      const { data, error } = await supabase
        .from('upgrade_funds')
        .insert({
          wallet_address: walletAddress,
          device_traded: deviceModel,
          trade_value: tradeValue,
          staked_amount: calculations.stakedAmount,
          instant_payout: calculations.instantPayout,
          device_goal: deviceGoal,
          device_goal_price: deviceGoalPrice,
          current_apy: calculations.effectiveAPY,
          estimated_goal_date: new Date(
            Date.now() + calculations.timeToGoal * 365 * 24 * 60 * 60 * 1000
          ),
          status: 'active',
          created_at: new Date()
        })

      if (error) throw error

      return {
        success: true,
        fundId: data[0].id,
        calculations
      }
    } catch (error) {
      console.error('Error creating upgrade fund:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get user's upgrade funds
   */
  static async getUserFunds(walletAddress) {
    try {
      const { data, error } = await supabase
        .from('upgrade_funds')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate current values
      const fundsWithCurrentValues = data.map(fund => {
        const daysSinceCreation = 
          (Date.now() - new Date(fund.created_at).getTime()) / (1000 * 60 * 60 * 24)
        const yearsSinceCreation = daysSinceCreation / 365
        const currentValue = fund.staked_amount * 
          Math.pow(1 + (fund.current_apy / 100), yearsSinceCreation)
        const totalEarned = currentValue - fund.staked_amount

        return {
          ...fund,
          currentValue,
          totalEarned,
          daysUntilGoal: Math.max(
            0,
            (fund.device_goal_price - currentValue) / 
            (fund.staked_amount * (fund.current_apy / 100) / 365)
          )
        }
      })

      return fundsWithCurrentValues
    } catch (error) {
      console.error('Error fetching user funds:', error)
      return []
    }
  }

  /**
   * Calculate family stacking benefits
   */
  static calculateFamilyStack(devices) {
    const totalValue = devices.reduce((sum, device) => sum + device.value, 0)
    const totalStaked = totalValue // Assuming 100% stake for max benefit
    const effectiveAPY = CURRENT_NETWORK_APY + BONUS_APY_FIRST_100
    const yearlyEarnings = totalStaked * effectiveAPY
    const monthlyEarnings = yearlyEarnings / 12

    return {
      totalValue,
      totalStaked,
      yearlyEarnings,
      monthlyEarnings,
      freePhoneEvery: totalValue / yearlyEarnings, // Years
      devices
    }
  }

  /**
   * Get current validator stats (mock for now)
   */
  static async getValidatorStats() {
    // In production, fetch from Solana RPC
    return {
      currentAPY: CURRENT_NETWORK_APY * 100,
      bonusAPY: BONUS_APY_FIRST_100 * 100,
      uptime: 99.8,
      commission: 5,
      totalStaked: 0, // Will increase as users join
      activeFunds: 0,
      epoch: 500,
      lastUpdate: new Date().toISOString()
    }
  }

  /**
   * Simulate earnings over time
   */
  static simulateEarnings(principal, apy, years) {
    const periods = years * 12 // Monthly compounding
    const monthlyRate = apy / 12
    let balance = principal

    const timeline = []
    
    for (let month = 1; month <= periods; month++) {
      const earnings = balance * monthlyRate
      balance += earnings
      
      if (month % 12 === 0 || month === 1 || month === periods) {
        timeline.push({
          month,
          year: Math.ceil(month / 12),
          balance: Math.round(balance * 100) / 100,
          totalEarnings: Math.round((balance - principal) * 100) / 100
        })
      }
    }

    return timeline
  }

  /**
   * Check if user qualifies for bonus APY (first 100 users)
   */
  static async qualifiesForBonus(walletAddress) {
    try {
      const { count } = await supabase
        .from('upgrade_funds')
        .select('*', { count: 'exact', head: true })

      return count < 100
    } catch (error) {
      console.error('Error checking bonus qualification:', error)
      return false
    }
  }
}

// Export for use in API routes and components
export default UpgradeForeverService