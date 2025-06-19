use anchor_lang::prelude::*;

use crate::constants::ANCHOR_DISCRIMINTOR_SIZE;
use crate::states::ProgramState;

pub fn initialize_program_state(ctx: Context<InitializeProgramState>) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;

    // Initialize fields in your ProgramState account
    program_state.challenge_count = 0;
    program_state.initialize = true;
    program_state.admin = *ctx.accounts.initializer.key;
    // Add any other fields that ProgramState has

    Ok(())
}

pub fn close_program_state(ctx: Context<CloseProgramState>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeProgramState<'info> {
    #[account(
        init,
        payer = initializer,
        space = ANCHOR_DISCRIMINTOR_SIZE + ProgramState::INIT_SPACE,
        seeds = [b"program_state"],
        bump,
    )]
    pub program_state: Account<'info, ProgramState>,

    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseProgramState<'info> {
    #[account(mut, close = recipient)]
    pub program_state: Account<'info, ProgramState>,

    /// CHECK: This is safe because we're just receiving lamports
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
}
