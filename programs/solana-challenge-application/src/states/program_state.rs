use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    pub initialize: bool,
    pub admin: Pubkey,
    pub challenge_count: u64,
    pub platform_fee: u64,
    pub platform_address: Pubkey,
}
