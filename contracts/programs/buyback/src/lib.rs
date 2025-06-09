use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111"); // Replace with your program ID

#[program]
pub mod solana_buyback {
    use super::*;

    /// Creates a new buyback order
    pub fn create_buyback_order(
        ctx: Context<CreateBuybackOrder>,
        device_model: String,
        device_condition: String,
        storage_capacity: String,
        price_lamports: u64,
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let clock = Clock::get()?;
        
        order.owner = ctx.accounts.user.key();
        order.device_model = device_model;
        order.device_condition = device_condition;
        order.storage_capacity = storage_capacity;
        order.price_lamports = price_lamports;
        order.status = OrderStatus::PendingShipment;
        order.created_at = clock.unix_timestamp;
        order.order_id = ctx.accounts.user.key().to_bytes()[0..8].try_into().unwrap();
        
        Ok(())
    }

    /// Updates order status when device is shipped
    pub fn mark_as_shipped(
        ctx: Context<UpdateOrder>,
        tracking_number: String,
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;
        require!(order.owner == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(order.status == OrderStatus::PendingShipment, ErrorCode::InvalidStatus);
        
        order.status = OrderStatus::Shipped;
        order.tracking_number = Some(tracking_number);
        
        Ok(())
    }

    /// Completes order and transfers payment
    pub fn complete_order(
        ctx: Context<CompleteOrder>,
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;
        require!(order.status == OrderStatus::Shipped, ErrorCode::InvalidStatus);
        
        // Transfer SOL from platform to user
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.platform_wallet.key(),
            &ctx.accounts.user.key(),
            order.price_lamports,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.platform_wallet.to_account_info(),
                ctx.accounts.user.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        order.status = OrderStatus::Completed;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBuybackOrder<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + BuybackOrder::INIT_SPACE,
    )]
    pub order: Account<'info, BuybackOrder>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateOrder<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized,
    )]
    pub order: Account<'info, BuybackOrder>,
}

#[derive(Accounts)]
pub struct CompleteOrder<'info> {
    /// CHECK: Platform wallet that pays users
    #[account(mut)]
    pub platform_wallet: AccountInfo<'info>,
    
    #[account(mut)]
    pub user: SystemAccount<'info>,
    
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized,
    )]
    pub order: Account<'info, BuybackOrder>,
    
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct BuybackOrder {
    pub owner: Pubkey,
    pub order_id: [u8; 8],
    #[max_len(50)]
    pub device_model: String,
    #[max_len(20)]
    pub device_condition: String,
    #[max_len(10)]
    pub storage_capacity: String,
    pub price_lamports: u64,
    pub status: OrderStatus,
    pub created_at: i64,
    #[max_len(50)]
    pub tracking_number: Option<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum OrderStatus {
    PendingShipment,
    Shipped,
    Completed,
    Cancelled,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid order status for this operation")]
    InvalidStatus,
}
