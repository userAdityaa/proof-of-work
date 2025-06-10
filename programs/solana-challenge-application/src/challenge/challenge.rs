use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Challenge {
    pub cid: u64,
    pub owner: Pubkey,
    #[max_len(256)]
    pub description: String,
    #[max_len(120)]
    pub image_url: String,
    #[max_len(20)]
    pub location: String,
    pub program_state: Pubkey,
    pub timestamp: u64,
    pub reward_type: u8,
    pub reward_amount: u64,
    pub reward_mint: Pubkey,
    pub status: u8,
    pub participant: Option<Pubkey>,
    #[max_len(120)]
    pub proof_url: Option<String>,
    pub certified_by: Option<Pubkey>,
}
