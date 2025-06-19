use anchor_lang::prelude::*;

pub mod challenge;
pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;
pub mod user;

use instructions::*;

declare_id!("4UsmWa9UTxFw1Z9FYpHnpzLqqxX5jgc2e78hdCfQhMEs");

#[program]
pub mod solana_challenge_application {
    use super::*;

    pub fn initialize_program_state(ctx: Context<InitializeProgramState>) -> Result<()> {
        instructions::initialize_program_state(ctx)
    }

    pub fn close_program_state(ctx: Context<CloseProgramState>) -> Result<()> {
        instructions::close_program_state(ctx)
    }

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
        title: String,
        description: String,
        image_url: String,
        location: String,
        reward_type: u8,
        reward_amount: u64,
    ) -> Result<()> {
        instructions::create_challenge(
            ctx,
            cid,
            title,
            description,
            image_url,
            location,
            reward_type,
            reward_amount,
        )
    }

    pub fn delete_challenge(ctx: Context<DeleteChallenge>, cid: u64) -> Result<()> {
        instructions::delete_challenge(ctx, cid)
    }

    pub fn update_challenge(
        ctx: Context<UpdateChallenge>,
        cid: u64,
        title: String,
        description: String,
        image_url: String,
        location: String,
        reward_type: u8,
        reward_amount: u64,
    ) -> Result<()> {
        instructions::update_challenge(
            ctx,
            cid,
            title,
            description,
            image_url,
            location,
            reward_type,
            reward_amount,
        )
    }

    pub fn submit_challenge(
        ctx: Context<SubmitChallenge>,
        cid: u64,
        creator: Pubkey,
        proof_url: String,
    ) -> Result<()> {
        instructions::submit_challenge(ctx, cid, creator, proof_url)
    }

    pub fn start_challenge(ctx: Context<StartChallange>, cid: u64, creator: Pubkey) -> Result<()> {
        instructions::start_challange(ctx, cid, creator)
    }

    pub fn accept_submission(ctx: Context<AcceptSubmission>) -> Result<()> {
        instructions::accept_submission(ctx)
    }
}
