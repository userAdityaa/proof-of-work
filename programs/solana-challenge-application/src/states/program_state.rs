use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

#[account]
pub struct ProgramState {
    initialize: bool,
    admin: Pubkey,
    campaign_count: u64,
    platform_fee: u64,
    platform_address: Pubkey,
}
