use anchor_lang::prelude::*;

use crate::challenge::Challenge;
use crate::constants::ANCHOR_DISCRIMINTOR_SIZE;
use crate::errors::ErrCode;
use crate::states::program_state::ProgramState;

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
    require!(description.len() <= 256, ErrCode::DescriptionTooLong);
    require!(image_url.len() <= 120, ErrCode::ImageUrlTooLong);
    require!(location.len() <= 20, ErrCode::LocationTooLong);
    require!(reward_amount > 0, ErrCode::InvalidRewardAmount);
    require!(
        reward_type == 0 || reward_type == 1,
        ErrCode::InvalidRewardType
    );

    let challenge = &mut ctx.accounts.challenge;
    let program_state = &mut ctx.accounts.program_state;
    let clock = Clock::get()?;

    challenge.cid = cid;
    challenge.owner = ctx.accounts.creator.key();
    challenge.description = description;
    challenge.image_url = image_url;
    challenge.location = location;
    challenge.program_state = program_state.key();
    challenge.timestamp = clock.unix_timestamp as u64;
    // 0 = Native SOL, 1 = SPL
    challenge.reward_type = reward_type;
    challenge.reward_amount = reward_amount;
    challenge.reward_mint = reward_mint;
    // 0 = Open, 1 = InProgress, 2 = Completed, 3 = Verified, 4 = Rejected
    challenge.status = 0;
    challenge.participant = None;
    challenge.proof_url = None;
    challenge.certified_by = None;

    program_state.challenge_count = program_state
        .challenge_count
        .checked_add(1)
        .ok_or(ErrCode::ChallangeCountOverflowed)?;

    Ok(())
}

pub fn delete_challenge(_ctx: Context<DeleteChallenge>, _cid: u64) -> Result<()> {
    Ok(())
}

pub fn update_challenge(
    ctx: Context<UpdateChallenge>,
    _cid: u64,
    description: String,
    image_url: String,
    location: String,
    reward_type: u8,
    reward_amount: u64,
    reward_mint: Pubkey,
) -> Result<()> {
    require!(description.len() <= 256, ErrCode::DescriptionTooLong);
    require!(image_url.len()    <= 120, ErrCode::ImageUrlTooLong);
    require!(location.len()     <= 20,  ErrCode::LocationTooLong);
    require!(reward_amount > 0,          ErrCode::InvalidRewardAmount);
    require!(reward_type == 0 || reward_type == 1, ErrCode::InvalidRewardType);

    let challenge = &mut ctx.accounts.challenge;

    challenge.description  = description;
    challenge.image_url    = image_url;
    challenge.location     = location;
    challenge.reward_type  = reward_type;
    challenge.reward_amount= reward_amount;
    challenge.reward_mint  = reward_mint;


    Ok(())
}

#[derive(Accounts)]
pub struct CreateChallenge<'info> {
    pub program_state: Account<'info, ProgramState>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = ANCHOR_DISCRIMINTOR_SIZE + Challenge::INIT_SPACE,
        seeds = [
            b"challenge", 
            creator.key().as_ref(),
            (program_state.challenge_count + 1).to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub challenge: Account<'info, Challenge>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct DeleteChallenge<'info> {
    #[account(mut)]
    pub creator: Signer<'info>, 

    #[account(
        mut, 
        seeds = [
            b"challenge", 
            cid.to_le_bytes().as_ref(),
        ],
        bump, 
        close = creator, 
        constraint = challenge.owner == creator.key() @ ErrCode::Unauthorized,
    )]  
    pub challenge: Account<'info, Challenge>, 

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct UpdateChallenge<'info> { 
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut, 
        seeds = [
            b"challenge", 
            cid.to_le_bytes().as_ref(),
        ],
        bump, 
        constraint = challenge.owner == creator.key() @ ErrCode::Unauthorized, 
        constraint = challenge.status == 0 @ ErrCode::ChallengeAlreadyOpened,
        realloc = ANCHOR_DISCRIMINTOR_SIZE + Challenge::INIT_SPACE,
        realloc::payer = creator,
        realloc::zero = true,
    )]
    pub challenge: Account<'info, Challenge>,

    pub system_program: Program<'info, System>,
}
