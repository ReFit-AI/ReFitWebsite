use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use mpl_bubblegum::state::metaplex_adapter::MetadataArgs;

declare_id!("MKT1111111111111111111111111111111111111111"); // Replace with actual program ID

#[program]
pub mod refit_marketplace {
    use super::*;

    /// Creates a compressed NFT for a phone and lists it on the marketplace
    pub fn create_phone_listing(
        ctx: Context<CreatePhoneListing>,
        metadata: PhoneMetadata,
        price_usdc: u64,
        require_stake: bool,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let clock = Clock::get()?;

        // Generate unique listing ID from seller + timestamp
        let listing_id = generate_listing_id(&ctx.accounts.seller.key(), clock.unix_timestamp);

        listing.listing_id = listing_id;
        listing.seller = ctx.accounts.seller.key();
        listing.phone_metadata = metadata;
        listing.price_usdc = price_usdc;
        listing.status = ListingStatus::Active;
        listing.created_at = clock.unix_timestamp;
        listing.require_stake = require_stake;
        listing.escrow_account = ctx.accounts.escrow_account.key();
        listing.nft_mint = None; // Will be set after cNFT creation

        msg!("Phone listing created: {}", listing_id);

        Ok(())
    }

    /// Buyer initiates purchase - funds go into escrow
    pub fn initiate_purchase(
        ctx: Context<InitiatePurchase>,
        listing_id: [u8; 32],
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let escrow = &mut ctx.accounts.escrow_order;
        let clock = Clock::get()?;

        require!(listing.status == ListingStatus::Active, ErrorCode::ListingNotActive);
        require!(listing.listing_id == listing_id, ErrorCode::InvalidListing);

        // Transfer USDC from buyer to escrow PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        token::transfer(cpi_context, listing.price_usdc)?;

        // Create escrow order
        escrow.order_id = generate_order_id(&listing_id, &ctx.accounts.buyer.key());
        escrow.listing_id = listing_id;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = listing.seller;
        escrow.amount_usdc = listing.price_usdc;
        escrow.status = EscrowStatus::AwaitingShipment;
        escrow.created_at = clock.unix_timestamp;
        escrow.shipping_deadline = clock.unix_timestamp + (7 * 24 * 60 * 60); // 7 days

        // Update listing status
        listing.status = ListingStatus::PendingEscrow;
        listing.buyer = Some(ctx.accounts.buyer.key());

        msg!("Purchase initiated for listing: {:?}", listing_id);

        Ok(())
    }

    /// Seller confirms shipment with tracking info
    pub fn confirm_shipment(
        ctx: Context<ConfirmShipment>,
        order_id: [u8; 32],
        tracking_number: String,
        carrier: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_order;
        let listing = &mut ctx.accounts.listing;
        let clock = Clock::get()?;

        require!(escrow.seller == ctx.accounts.seller.key(), ErrorCode::Unauthorized);
        require!(escrow.status == EscrowStatus::AwaitingShipment, ErrorCode::InvalidEscrowStatus);
        require!(clock.unix_timestamp <= escrow.shipping_deadline, ErrorCode::ShippingDeadlineExceeded);

        escrow.status = EscrowStatus::Shipped;
        escrow.tracking_info = Some(TrackingInfo {
            tracking_number,
            carrier,
            shipped_at: clock.unix_timestamp,
            delivery_deadline: clock.unix_timestamp + (10 * 24 * 60 * 60), // 10 days for delivery
        });

        listing.status = ListingStatus::Shipped;

        msg!("Shipment confirmed for order: {:?}", order_id);

        Ok(())
    }

    /// Buyer confirms receipt - releases funds to seller
    pub fn confirm_delivery(
        ctx: Context<ConfirmDelivery>,
        order_id: [u8; 32],
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_order;
        let listing = &mut ctx.accounts.listing;

        require!(escrow.buyer == ctx.accounts.buyer.key(), ErrorCode::Unauthorized);
        require!(escrow.status == EscrowStatus::Shipped, ErrorCode::InvalidEscrowStatus);

        // Calculate platform fee (1%)
        let platform_fee = escrow.amount_usdc / 100;
        let seller_amount = escrow.amount_usdc - platform_fee;

        // Transfer USDC from escrow to seller
        let seeds = &[
            b"escrow",
            escrow.order_id.as_ref(),
            &[ctx.bumps.escrow_order],
        ];
        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.escrow_order.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi_context, seller_amount)?;

        // Transfer platform fee
        let fee_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.platform_fee_account.to_account_info(),
                authority: ctx.accounts.escrow_order.to_account_info(),
            },
            signer,
        );
        token::transfer(fee_context, platform_fee)?;

        // Update statuses
        escrow.status = EscrowStatus::Completed;
        listing.status = ListingStatus::Sold;

        msg!("Delivery confirmed, funds released for order: {:?}", order_id);

        Ok(())
    }

    /// Opens a dispute for an order
    pub fn open_dispute(
        ctx: Context<OpenDispute>,
        order_id: [u8; 32],
        reason: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_order;
        let dispute = &mut ctx.accounts.dispute;
        let clock = Clock::get()?;

        // Either buyer or seller can open dispute
        require!(
            escrow.buyer == ctx.accounts.initiator.key() ||
            escrow.seller == ctx.accounts.initiator.key(),
            ErrorCode::Unauthorized
        );
        require!(
            escrow.status == EscrowStatus::Shipped ||
            escrow.status == EscrowStatus::AwaitingShipment,
            ErrorCode::InvalidEscrowStatus
        );

        dispute.dispute_id = generate_dispute_id(&order_id, clock.unix_timestamp);
        dispute.order_id = order_id;
        dispute.initiator = ctx.accounts.initiator.key();
        dispute.reason = reason;
        dispute.status = DisputeStatus::Open;
        dispute.created_at = clock.unix_timestamp;

        escrow.status = EscrowStatus::Disputed;

        msg!("Dispute opened for order: {:?}", order_id);

        Ok(())
    }

    /// Resolves a dispute (requires DAO vote or admin)
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        dispute_id: [u8; 32],
        resolution: DisputeResolution,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        let escrow = &mut ctx.accounts.escrow_order;

        require!(dispute.status == DisputeStatus::Open, ErrorCode::DisputeNotOpen);
        require!(ctx.accounts.resolver.key() == ADMIN_PUBKEY.parse::<Pubkey>().unwrap(), ErrorCode::Unauthorized);

        let seeds = &[
            b"escrow",
            escrow.order_id.as_ref(),
            &[ctx.bumps.escrow_order],
        ];
        let signer = &[&seeds[..]];

        match resolution {
            DisputeResolution::FavorBuyer => {
                // Refund buyer
                let cpi_context = CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: ctx.accounts.buyer_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_order.to_account_info(),
                    },
                    signer,
                );
                token::transfer(cpi_context, escrow.amount_usdc)?;
                escrow.status = EscrowStatus::Refunded;
            },
            DisputeResolution::FavorSeller => {
                // Pay seller
                let platform_fee = escrow.amount_usdc / 100;
                let seller_amount = escrow.amount_usdc - platform_fee;

                let cpi_context = CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: ctx.accounts.seller_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_order.to_account_info(),
                    },
                    signer,
                );
                token::transfer(cpi_context, seller_amount)?;
                escrow.status = EscrowStatus::Completed;
            },
            DisputeResolution::Split { buyer_percentage } => {
                // Split funds
                let buyer_amount = (escrow.amount_usdc * buyer_percentage as u64) / 100;
                let seller_amount = escrow.amount_usdc - buyer_amount;

                // Transfer to buyer
                let buyer_context = CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: ctx.accounts.buyer_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_order.to_account_info(),
                    },
                    signer,
                );
                token::transfer(buyer_context, buyer_amount)?;

                // Transfer to seller
                let seller_context = CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: ctx.accounts.seller_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_order.to_account_info(),
                    },
                    signer,
                );
                token::transfer(seller_context, seller_amount)?;

                escrow.status = EscrowStatus::Resolved;
            }
        }

        dispute.status = DisputeStatus::Resolved;
        dispute.resolution = Some(resolution);

        msg!("Dispute resolved: {:?}", dispute_id);

        Ok(())
    }

    /// Auto-release funds if delivery deadline passes without dispute
    pub fn auto_release_funds(
        ctx: Context<AutoRelease>,
        order_id: [u8; 32],
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_order;
        let clock = Clock::get()?;

        require!(escrow.status == EscrowStatus::Shipped, ErrorCode::InvalidEscrowStatus);

        let tracking = escrow.tracking_info.as_ref().unwrap();
        require!(clock.unix_timestamp > tracking.delivery_deadline, ErrorCode::DeadlineNotReached);

        // Auto-release to seller after deadline
        let platform_fee = escrow.amount_usdc / 100;
        let seller_amount = escrow.amount_usdc - platform_fee;

        let seeds = &[
            b"escrow",
            escrow.order_id.as_ref(),
            &[ctx.bumps.escrow_order],
        ];
        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.escrow_order.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi_context, seller_amount)?;

        escrow.status = EscrowStatus::AutoReleased;

        msg!("Funds auto-released for order: {:?}", order_id);

        Ok(())
    }
}

// ===== ACCOUNT STRUCTURES =====

#[derive(Accounts)]
pub struct CreatePhoneListing<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        init,
        payer = seller,
        space = 8 + PhoneListing::INIT_SPACE,
        seeds = [b"listing", seller.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub listing: Account<'info, PhoneListing>,

    /// CHECK: Escrow account for holding phone NFT
    pub escrow_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct InitiatePurchase<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        constraint = listing.status == ListingStatus::Active @ ErrorCode::ListingNotActive
    )]
    pub listing: Account<'info, PhoneListing>,

    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowOrder::INIT_SPACE,
        seeds = [b"escrow", listing.listing_id.as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub escrow_order: Account<'info, EscrowOrder>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key() @ ErrorCode::InvalidTokenAccount,
        constraint = buyer_token_account.amount >= listing.price_usdc @ ErrorCode::InsufficientFunds
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow_order
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// CHECK: USDC mint
    pub usdc_mint: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ConfirmShipment<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        constraint = escrow_order.seller == seller.key() @ ErrorCode::Unauthorized
    )]
    pub escrow_order: Account<'info, EscrowOrder>,

    #[account(
        mut,
        constraint = listing.seller == seller.key() @ ErrorCode::Unauthorized
    )]
    pub listing: Account<'info, PhoneListing>,
}

#[derive(Accounts)]
pub struct ConfirmDelivery<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_order.order_id.as_ref()],
        bump,
        constraint = escrow_order.buyer == buyer.key() @ ErrorCode::Unauthorized
    )]
    pub escrow_order: Account<'info, EscrowOrder>,

    #[account(mut)]
    pub listing: Account<'info, PhoneListing>,

    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow_order.key() @ ErrorCode::InvalidTokenAccount
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = seller_token_account.owner == listing.seller @ ErrorCode::InvalidTokenAccount
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = platform_fee_account.owner == PLATFORM_FEE_WALLET.parse::<Pubkey>().unwrap() @ ErrorCode::InvalidTokenAccount
    )]
    pub platform_fee_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct OpenDispute<'info> {
    #[account(mut)]
    pub initiator: Signer<'info>,

    #[account(
        mut,
        constraint = escrow_order.buyer == initiator.key() || escrow_order.seller == initiator.key() @ ErrorCode::Unauthorized
    )]
    pub escrow_order: Account<'info, EscrowOrder>,

    #[account(
        init,
        payer = initiator,
        space = 8 + Dispute::INIT_SPACE,
        seeds = [b"dispute", escrow_order.order_id.as_ref()],
        bump
    )]
    pub dispute: Account<'info, Dispute>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub resolver: Signer<'info>,

    #[account(mut)]
    pub dispute: Account<'info, Dispute>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_order.order_id.as_ref()],
        bump
    )]
    pub escrow_order: Account<'info, EscrowOrder>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AutoRelease<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_order.order_id.as_ref()],
        bump
    )]
    pub escrow_order: Account<'info, EscrowOrder>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ===== STATE STRUCTURES =====

#[account]
#[derive(InitSpace)]
pub struct PhoneListing {
    pub listing_id: [u8; 32],
    pub seller: Pubkey,
    pub phone_metadata: PhoneMetadata,
    pub price_usdc: u64,
    pub status: ListingStatus,
    pub created_at: i64,
    pub buyer: Option<Pubkey>,
    pub require_stake: bool,
    pub escrow_account: Pubkey,
    pub nft_mint: Option<Pubkey>,
}

#[account]
#[derive(InitSpace)]
pub struct EscrowOrder {
    pub order_id: [u8; 32],
    pub listing_id: [u8; 32],
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount_usdc: u64,
    pub status: EscrowStatus,
    pub created_at: i64,
    pub shipping_deadline: i64,
    pub tracking_info: Option<TrackingInfo>,
}

#[account]
#[derive(InitSpace)]
pub struct Dispute {
    pub dispute_id: [u8; 32],
    pub order_id: [u8; 32],
    pub initiator: Pubkey,
    #[max_len(500)]
    pub reason: String,
    pub status: DisputeStatus,
    pub created_at: i64,
    pub resolution: Option<DisputeResolution>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct PhoneMetadata {
    #[max_len(50)]
    pub model: String,
    #[max_len(20)]
    pub brand: String,
    #[max_len(10)]
    pub storage: String,
    #[max_len(20)]
    pub condition: String,
    #[max_len(20)]
    pub carrier_status: String,
    #[max_len(20)]
    pub imei: String,
    pub battery_health: u8,
    #[max_len(200)]
    pub issues: String, // JSON string of issues
    #[max_len(500)]
    pub images_url: String, // IPFS or Arweave URL
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct TrackingInfo {
    #[max_len(50)]
    pub tracking_number: String,
    #[max_len(20)]
    pub carrier: String,
    pub shipped_at: i64,
    pub delivery_deadline: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ListingStatus {
    Active,
    PendingEscrow,
    Shipped,
    Sold,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum EscrowStatus {
    AwaitingShipment,
    Shipped,
    Completed,
    Refunded,
    Disputed,
    AutoReleased,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum DisputeStatus {
    Open,
    UnderReview,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum DisputeResolution {
    FavorBuyer,
    FavorSeller,
    Split { buyer_percentage: u8 },
}

// ===== ERRORS =====

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid listing")]
    InvalidListing,
    #[msg("Listing is not active")]
    ListingNotActive,
    #[msg("Invalid escrow status for this operation")]
    InvalidEscrowStatus,
    #[msg("Shipping deadline exceeded")]
    ShippingDeadlineExceeded,
    #[msg("Deadline not reached yet")]
    DeadlineNotReached,
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Dispute is not open")]
    DisputeNotOpen,
}

// ===== CONSTANTS =====

const ADMIN_PUBKEY: &str = "7dvcw3CJ4Y9rWFsRa9SuSN46C7c6Aq2XK4c5NkYUfpAV"; // Your admin wallet
const PLATFORM_FEE_WALLET: &str = "9H6VYFrirtuKm5X1hxjt9s6AQC3PZe6Y4zqtNzUZdpPk"; // Platform fee wallet

// ===== HELPER FUNCTIONS =====

fn generate_listing_id(seller: &Pubkey, timestamp: i64) -> [u8; 32] {
    let mut id = [0u8; 32];
    id[..32].copy_from_slice(&seller.to_bytes());
    id[24..32].copy_from_slice(&timestamp.to_le_bytes());
    id
}

fn generate_order_id(listing_id: &[u8; 32], buyer: &Pubkey) -> [u8; 32] {
    let mut id = [0u8; 32];
    id[..16].copy_from_slice(&listing_id[..16]);
    id[16..32].copy_from_slice(&buyer.to_bytes()[..16]);
    id
}

fn generate_dispute_id(order_id: &[u8; 32], timestamp: i64) -> [u8; 32] {
    let mut id = [0u8; 32];
    id[..24].copy_from_slice(&order_id[..24]);
    id[24..32].copy_from_slice(&timestamp.to_le_bytes());
    id
}