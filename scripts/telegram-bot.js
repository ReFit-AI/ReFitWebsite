#!/usr/bin/env node

/**
 * ReFit Telegram Trading Bot
 * Quick manual trade processing for MVP
 * 
 * Setup:
 * 1. npm install node-telegram-bot-api dotenv
 * 2. Create bot with @BotFather on Telegram
 * 3. Add bot token to .env as TELEGRAM_BOT_TOKEN
 * 4. Run: node telegram-bot.js
 */

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Replace with your bot token from BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, { polling: true });

// Store user sessions
const userSessions = new Map();

// Device prices (would fetch from API in production)
const DEVICE_PRICES = {
  'iphone15pro': { name: 'iPhone 15 Pro', price: 900 },
  'iphone14pro': { name: 'iPhone 14 Pro', price: 600 },
  'iphone13pro': { name: 'iPhone 13 Pro', price: 450 },
  'saga': { name: 'Solana Saga', price: 200 },
  'samsung': { name: 'Samsung S23', price: 350 },
};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  const welcomeMessage = `
🚀 Welcome to ReFit Upgrade Forever, ${firstName}!

Turn your old phone into a permanent income stream that funds your future upgrades.

📱 *How it works:*
1. Tell me what device you want to trade
2. Get an instant quote
3. Choose how much to stake
4. Ship your device
5. Start earning ~6.5% APY forever

*Commands:*
/trade - Start a new trade
/calculate - Calculate your upgrade timeline
/status - Check your trade status
/help - Get help

Ready to never pay full price for a phone again?
Type /trade to begin!
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Trade command
bot.onText(/\/trade/, (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📱 iPhone 15 Pro', callback_data: 'trade_iphone15pro' },
          { text: '📱 iPhone 14 Pro', callback_data: 'trade_iphone14pro' }
        ],
        [
          { text: '📱 iPhone 13 Pro', callback_data: 'trade_iphone13pro' },
          { text: '📱 Solana Saga', callback_data: 'trade_saga' }
        ],
        [
          { text: '📱 Samsung S23', callback_data: 'trade_samsung' },
          { text: '💬 Other Device', callback_data: 'trade_other' }
        ]
      ]
    }
  };
  
  bot.sendMessage(chatId, '📱 What device do you want to trade in?', keyboard);
});

// Calculate command
bot.onText(/\/calculate/, (msg) => {
  const chatId = msg.chat.id;
  
  const message = `
💰 *Upgrade Calculator*

Let me show you some examples:

*Scenario 1: iPhone 14 Pro ($600)*
• Stake 100% = $600
• Earn ~$40/year
• Free Saga in: 11 years
• Free Seeker in: 7.5 years

*Scenario 2: Family Stack (4 phones = $2000)*
• Stake all = $2000
• Earn ~$130/year
• Free phone every 3.5 years!

*Scenario 3: The Infinity Phone ($10,000 staked)*
• Earn ~$650/year
• Free phone EVERY YEAR forever!

🎯 *Pro Tip:* First 100 users get +0.5% bonus APY!

Ready to start? Type /trade
  `;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Handle device selection
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  if (data.startsWith('trade_')) {
    const deviceKey = data.replace('trade_', '');
    
    if (deviceKey === 'other') {
      bot.sendMessage(chatId, 'Please describe your device and condition:');
      userSessions.set(chatId, { step: 'custom_device' });
      return;
    }
    
    const device = DEVICE_PRICES[deviceKey];
    userSessions.set(chatId, { device, step: 'stake_choice' });
    
    const stakeOptions = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💰 100% Cash Now', callback_data: 'stake_0' }],
          [{ text: '⚡ 75% Cash + 25% Stake', callback_data: 'stake_25' }],
          [{ text: '🚀 100% Stake (Max Earnings)', callback_data: 'stake_100' }]
        ]
      }
    };
    
    const message = `
✅ Great choice! ${device.name}

💵 *Trade-in value: $${device.price}*

Now choose your payout option:

• *100% Cash:* Get $${device.price} immediately
• *75/25 Split:* $${device.price * 0.75} now + $${device.price * 0.25} staked earning ~$${(device.price * 0.25 * 0.065).toFixed(0)}/year
• *100% Stake:* Earn ~$${(device.price * 0.065).toFixed(0)}/year toward upgrades

Which option do you prefer?
    `;
    
    bot.sendMessage(chatId, message, { ...stakeOptions, parse_mode: 'Markdown' });
  }
  
  if (data.startsWith('stake_')) {
    const session = userSessions.get(chatId);
    const stakePercent = parseInt(data.replace('stake_', ''));
    
    const device = session.device;
    const stakedAmount = (device.price * stakePercent) / 100;
    const instantPayout = device.price - stakedAmount;
    const yearlyEarnings = stakedAmount * 0.065;
    
    session.stakePercent = stakePercent;
    session.stakedAmount = stakedAmount;
    session.instantPayout = instantPayout;
    
    let confirmMessage = `
🎉 *Perfect! Here's your upgrade plan:*

📱 Device: ${device.name}
💵 Trade Value: $${device.price}
`;

    if (stakePercent === 0) {
      confirmMessage += `
💰 Instant Payout: $${device.price}
📈 Staked: $0
🎯 Upgrade Fund: No recurring earnings
`;
    } else if (stakePercent === 100) {
      confirmMessage += `
💰 Instant Payout: $0
📈 Staked: $${stakedAmount}
🎯 Annual Earnings: ~$${yearlyEarnings.toFixed(0)}
⏰ Free Seeker ($450) in: ${(450/yearlyEarnings).toFixed(1)} years
`;
    } else {
      confirmMessage += `
💰 Instant Payout: $${instantPayout}
📈 Staked: $${stakedAmount}
🎯 Annual Earnings: ~$${yearlyEarnings.toFixed(0)}
`;
    }
    
    confirmMessage += `
📦 *Next Steps:*
1. I'll send you a prepaid shipping label
2. Ship your device (free shipping!)
3. We verify and process payment
4. Watch your upgrade fund grow!

*Ready to proceed?*
    `;
    
    const confirmButtons = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirm Trade', callback_data: 'confirm_trade' },
            { text: '❌ Cancel', callback_data: 'cancel_trade' }
          ]
        ]
      }
    };
    
    bot.sendMessage(chatId, confirmMessage, { ...confirmButtons, parse_mode: 'Markdown' });
  }
  
  if (data === 'confirm_trade') {
    const session = userSessions.get(chatId);
    
    // Generate trade ID
    const tradeId = 'RFT' + Date.now().toString(36).toUpperCase();
    
    const finalMessage = `
✅ *Trade Confirmed!*

Your Trade ID: \`${tradeId}\`

📧 Please provide your email address and Solana wallet address:

Example:
email@example.com
YourSolanaWalletAddress

I'll send the shipping label to your email and payment to your wallet.
    `;
    
    session.tradeId = tradeId;
    session.step = 'collect_details';
    
    bot.sendMessage(chatId, finalMessage, { parse_mode: 'Markdown' });
    
    // Log trade for manual processing
    console.log('NEW TRADE:', {
      tradeId,
      chatId,
      username: callbackQuery.from.username,
      device: session.device,
      stakePercent: session.stakePercent,
      timestamp: new Date().toISOString()
    });
  }
  
  if (data === 'cancel_trade') {
    userSessions.delete(chatId);
    bot.sendMessage(chatId, 'Trade cancelled. Type /trade to start over.');
  }
  
  // Answer callback to remove loading state
  bot.answerCallbackQuery(callbackQuery.id);
});

// Handle text messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Skip if it's a command
  if (text && text.startsWith('/')) return;
  
  const session = userSessions.get(chatId);
  
  if (session && session.step === 'collect_details') {
    // Parse email and wallet
    const lines = text.split('\n');
    const email = lines[0];
    const wallet = lines[1];
    
    if (email && wallet) {
      const successMessage = `
🎉 *Perfect! Trade ${session.tradeId} is being processed!*

📧 Email: ${email}
💳 Wallet: ${wallet.substring(0, 4)}...${wallet.substring(wallet.length - 4)}

📦 *What happens next:*
1. Shipping label sent within 2 hours
2. Pack your device securely
3. Drop off at any post office
4. Payment processed within 24h of receipt

💬 Questions? Reply here or email support@refit.trade

Thank you for joining the Upgrade Forever revolution! 🚀
      `;
      
      bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });
      
      // Log for manual processing
      console.log('TRADE DETAILS:', {
        tradeId: session.tradeId,
        email,
        wallet,
        device: session.device,
        stakeDetails: {
          percent: session.stakePercent,
          amount: session.stakedAmount,
          instant: session.instantPayout
        }
      });
      
      // Clear session
      userSessions.delete(chatId);
      
      // Send admin notification
      if (process.env.ADMIN_CHAT_ID) {
        bot.sendMessage(process.env.ADMIN_CHAT_ID, 
          `New trade ${session.tradeId}:\n${session.device.name}\nStake: ${session.stakePercent}%\nEmail: ${email}`
        );
      }
    } else {
      bot.sendMessage(chatId, 'Please provide both email and wallet address, one per line.');
    }
  }
});

// Status command
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  
  const message = `
📊 *Your Upgrade Fund Status*

Currently in beta - connect your wallet at refit.trade to see your full dashboard.

*Platform Stats:*
• Active Funds: 0 (launching today!)
• Network APY: 6.5%
• Bonus APY: +0.5% (first 100 users)
• Total Staked: $0

Be one of the first! Type /trade to start.
  `;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Help command  
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const message = `
ℹ️ *ReFit Help*

*Commands:*
/trade - Start a new trade
/calculate - See example calculations
/status - Check your fund status
/help - This help message

*FAQs:*

Q: How does staking work?
A: Your trade-in value is staked in a Solana validator earning ~6.5% APY

Q: Can I withdraw?
A: Yes, after standard Solana unstaking period (2-3 days)

Q: Is this real?
A: Yes! We're launching with manual processing for first 100 users

*Support:*
Telegram: @ReFitSupport
Email: support@refit.trade
Website: refit.trade

Ready to start? Type /trade
  `;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

console.log('🤖 ReFit Telegram Bot is running...');
console.log('Commands: /start, /trade, /calculate, /status, /help');

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nBot shutting down...');
  bot.stopPolling();
  process.exit(0);
});