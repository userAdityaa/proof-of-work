use anchor_lang::prelude::*;

use crate::states::ProgramState;

#[account]
pub struct Challange {
    cid: u64,
    owner: Pubkey,
    description: String,
    image_url: String,
    location: String,
    program_state: ProgramState,
    timestamp: u64,
    reward_type: u8,
    reward_amount: u64,
    reward_mint: Pubkey,
    status: u8,
    participant: Option<Pubkey>,
    proof_url: Option<String>,
    verified_by: Option<Pubkey>,
}
