use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub wallet: Pubkey,
    #[max_len(15)]
    pub username: String,
    #[max_len(100)]
    pub avatar_url: String,
    pub created_at: u64,
    pub creator_score: u64,
    pub participant_score: u64,
}
