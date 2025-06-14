use anchor_lang::prelude::*;

pub mod challenge;
pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;
pub mod user;

use instructions::*;

declare_id!("3ktaaLhu7U97irLAWRjWWDnSf4rzLgVwQWtijUQ15tFF");

#[program]
pub mod solana_challenge_application {
    use super::*;

    pub fn create_user(
        ctx: Context<CreateUser>,
        username: String,
        avatar_url: String,
    ) -> Result<()> {
        instructions::create_user(ctx, username, avatar_url)
    }

    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        cid: u64,
        description: String,
        image_url: String,
        location: String,
        reward_type: u8,
        reward_amount: u64,
        reward_mint: Pubkey,
    ) -> Result<()> {
        instructions::create_challenge(
            ctx,
            cid,
            description,
            image_url,
            location,
            reward_type,
            reward_amount,
            reward_mint,
        )
    }

    pub fn delete_challenge(ctx: Context<DeleteChallenge>, cid: u64) -> Result<()> {
        instructions::delete_challenge(ctx, cid)
    }

    pub fn update_challenge(
        ctx: Context<UpdateChallenge>,
        cid: u64,
        description: String,
        image_url: String,
        location: String,
        reward_type: u8,
        reward_amount: u64,
        reward_mint: Pubkey,
    ) -> Result<()> {
        instructions::update_challenge(
            ctx,
            cid,
            description,
            image_url,
            location,
            reward_type,
            reward_amount,
            reward_mint,
        )
    }

    pub fn start_challenge(ctx: Context<StartChallange>, cid: u64) -> Result<()> {
        instructions::start_challange(ctx, cid)
    }
}
