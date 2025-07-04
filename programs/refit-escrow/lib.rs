use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("ReFit11111111111111111111111111111111111111");

#[program]
pub mod refit_escrow {
    use super::*;

    /// Create a new escrow for a phone purchase with trade-in
    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        purchase_amount: u64,
        trade_in_value: u64,
        expiry_timestamp: i64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = ctx.accounts.seller.key();
        escrow.purchase_amount = purchase_amount;
        escrow.trade_in_value = trade_in_value;
        escrow.expiry_timestamp = expiry_timestamp;
        escrow.state = EscrowState::AwaitingPayment;
        escrow.bump = *ctx.bumps.get("escrow").unwrap();

        msg!("Escrow created: purchase {} SOL, trade-in {} SOL", 
            purchase_amount as f64 / 1e9, 
            trade_in_value as f64 / 1e9
        );

        Ok(())
    }

    /// Buyer deposits funds into escrow
    pub fn deposit_funds(ctx: Context<DepositFunds>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.state == EscrowState::AwaitingPayment,
            ErrorCode::InvalidState
        );

        // Transfer funds from buyer to escrow
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_token_account.to_account_info(),
                    to: ctx.accounts.escrow_token_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            escrow.purchase_amount,
        )?;

        escrow.state = EscrowState::FundsDeposited;
        
        msg!("Funds deposited: {} SOL", escrow.purchase_amount as f64 / 1e9);

        Ok(())
    }

    /// Seller confirms new phone shipped
    pub fn confirm_new_phone_shipped(ctx: Context<UpdateEscrow>, tracking_number: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.state == EscrowState::FundsDeposited,
            ErrorCode::InvalidState
        );
        
        require!(
            ctx.accounts.authority.key() == escrow.seller,
            ErrorCode::Unauthorized
        );

        escrow.state = EscrowState::NewPhoneShipped;
        escrow.new_phone_tracking = Some(tracking_number);
        
        msg!("New phone shipped with tracking: {}", escrow.new_phone_tracking.as_ref().unwrap());

        Ok(())
    }

    /// Buyer confirms receipt and ships old phone
    pub fn confirm_old_phone_shipped(ctx: Context<UpdateEscrow>, tracking_number: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.state == EscrowState::NewPhoneShipped,
            ErrorCode::InvalidState
        );
        
        require!(
            ctx.accounts.authority.key() == escrow.buyer,
            ErrorCode::Unauthorized
        );

        escrow.state = EscrowState::OldPhoneShipped;
        escrow.old_phone_tracking = Some(tracking_number);
        
        msg!("Old phone shipped with tracking: {}", escrow.old_phone_tracking.as_ref().unwrap());

        Ok(())
    }

    /// Complete the escrow - release funds and trade-in credit
    pub fn complete_escrow(ctx: Context<CompleteEscrow>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        
        require!(
            escrow.state == EscrowState::OldPhoneShipped,
            ErrorCode::InvalidState
        );
        
        require!(
            ctx.accounts.authority.key() == escrow.seller,
            ErrorCode::Unauthorized
        );

        let seeds = &[
            b"escrow",
            escrow.buyer.as_ref(),
            escrow.seller.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        // Transfer trade-in value back to buyer
        if escrow.trade_in_value > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: ctx.accounts.buyer_token_account.to_account_info(),
                        authority: ctx.accounts.escrow.to_account_info(),
                    },
                    signer,
                ),
                escrow.trade_in_value,
            )?;
        }

        // Transfer remaining amount to seller
        let seller_amount = escrow.purchase_amount - escrow.trade_in_value;
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.seller_token_account.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
                signer,
            ),
            seller_amount,
        )?;

        msg!("Escrow completed: {} SOL to buyer, {} SOL to seller", 
            escrow.trade_in_value as f64 / 1e9,
            seller_amount as f64 / 1e9
        );

        Ok(())
    }

    /// Cancel expired escrow
    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        let clock = Clock::get()?;
        
        require!(
            clock.unix_timestamp > escrow.expiry_timestamp,
            ErrorCode::NotExpired
        );

        let seeds = &[
            b"escrow",
            escrow.buyer.as_ref(),
            escrow.seller.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        // Refund buyer if funds were deposited
        if escrow.state != EscrowState::AwaitingPayment {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_token_account.to_account_info(),
                        to: ctx.accounts.buyer_token_account.to_account_info(),
                        authority: ctx.accounts.escrow.to_account_info(),
                    },
                    signer,
                ),
                escrow.purchase_amount,
            )?;
        }

        msg!("Escrow cancelled and refunded");

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: Seller pubkey for escrow creation
    pub seller: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key()
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow.key()
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateEscrow<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteEscrow<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow.key()
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = buyer_token_account.owner == escrow.buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = seller_token_account.owner == escrow.seller
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(mut, close = buyer)]
    pub escrow: Account<'info, Escrow>,
    
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub buyer: SystemAccount<'info>,
    
    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow.key()
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = buyer_token_account.owner == escrow.buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub purchase_amount: u64,
    pub trade_in_value: u64,
    pub state: EscrowState,
    pub expiry_timestamp: i64,
    #[max_len(50)]
    pub new_phone_tracking: Option<String>,
    #[max_len(50)]
    pub old_phone_tracking: Option<String>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum EscrowState {
    AwaitingPayment,
    FundsDeposited,
    NewPhoneShipped,
    OldPhoneShipped,
    Completed,
    Cancelled,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid escrow state for this operation")]
    InvalidState,
    #[msg("Unauthorized - only buyer or seller can perform this action")]
    Unauthorized,
    #[msg("Escrow has not expired yet")]
    NotExpired,
}