use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ParticipantSubmission {
    pub participant: Pubkey,
    #[max_len(200)]
    pub proof_url: String,
    pub wallet_address: Pubkey,
    pub verified: bool,
}

#[account]
#[derive(InitSpace)]
pub struct Challenge {
    pub cid: u64,
    pub owner: Pubkey,
    #[max_len(20)]
    pub title: String,
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
    pub status: u8,
    #[max_len(20)]
    pub participant: Vec<Pubkey>,
    #[max_len(20)]
    pub submissions: Vec<Pubkey>,
}
