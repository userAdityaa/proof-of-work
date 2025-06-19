use anchor_lang::prelude::*;

use crate::challenge::challenge::ParticipantSubmission;
use crate::challenge::*;
use crate::constants::ANCHOR_DISCRIMINTOR_SIZE;
use crate::errors::ErrCode;
use crate::states::program_state::ProgramState;

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
    require!(title.len() <= 20, ErrCode::TitleTooLong);
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
    challenge.title = title;
    challenge.description = description;
    challenge.image_url = image_url;
    challenge.location = location;
    challenge.program_state = program_state.key();
    challenge.timestamp = clock.unix_timestamp as u64;
    // 0 = Native SOL, 1 = SPL
    challenge.reward_type = reward_type;
    challenge.reward_amount = reward_amount;
    // 0 = Open, 1 = InProgress, 2 = Completed, 3 = Verified, 4 = Rejected
    challenge.status = 0;
    challenge.participant = Vec::new();
    challenge.submissions = Vec::new();

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
    title: String,
    description: String,
    image_url: String,
    location: String,
    reward_type: u8,
    reward_amount: u64,
) -> Result<()> {
    require!(description.len() <= 256, ErrCode::DescriptionTooLong);
    require!(image_url.len()    <= 120, ErrCode::ImageUrlTooLong);
    require!(location.len()     <= 20,  ErrCode::LocationTooLong);
    require!(reward_amount > 0,          ErrCode::InvalidRewardAmount);
    require!(reward_type == 0 || reward_type == 1, ErrCode::InvalidRewardType);

    let challenge = &mut ctx.accounts.challenge;

    challenge.title = title;
    challenge.description  = description;
    challenge.image_url    = image_url;
    challenge.location     = location;
    challenge.reward_type  = reward_type;
    challenge.reward_amount= reward_amount;


    Ok(())
}

pub fn start_challange(ctx: Context<StartChallange>, cid: u64, creator: Pubkey) -> Result<()> { 
    let challenge = &mut ctx.accounts.challange; 
    let challanger=  &mut ctx.accounts.challanger;

    require!(challenge.cid == cid, ErrCode::InvalidChallengeId);
    require!(challenge.status == 0 || challenge.status == 1, ErrCode:: ChallengeNotOpen);
    require!(challenge.participant.len() < 20, ErrCode::MaxParticipantsReached);

    challenge.participant.push(challanger.key());
    Ok(())
}

pub fn accept_submission(ctx: Context<AcceptSubmission>) -> Result<()> {
    let challenge = &mut ctx.accounts.challenge;
    let submission = &mut ctx.accounts.participant_submission;

    require!(challenge.status == 0, ErrCode::ChallengeClosed);

    // Mark as verified
    submission.verified = true;
    submission.score = challenge.reward_amount;

    // Transfer reward
    let reward_amount = challenge.reward_amount;
    if reward_amount > 0 {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.reward_payer.key(),
            &ctx.accounts.recipient_wallet.key(),
            reward_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.reward_payer.to_account_info(),
                ctx.accounts.recipient_wallet.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
    }

    // Optional: mark challenge as completed (e.g., status = 1)
    challenge.status = 1;

    Ok(())
}


pub fn submit_challenge(ctx: Context<SubmitChallenge>, cid: u64, creator: Pubkey, proof_url: String) -> Result<()> {
    let challenge = &mut ctx.accounts.challenge;
    let challenger = &ctx.accounts.challenger;
    let participant_submission = &mut ctx.accounts.participant_submission;

    require!(challenge.status == 0, ErrCode::ChallengeClosed);

    participant_submission.participant= challenger.key();
    participant_submission.proof_url = proof_url;
    participant_submission.verified = false;
    participant_submission.score = 0;
    participant_submission.wallet_address = challenger.key();
    let submission_pda = participant_submission.key();

    if !challenge.submissions.contains(&submission_pda) {
        challenge.submissions.push(submission_pda);
    }

    Ok(())
}


#[derive(Accounts)]
pub struct CreateChallenge<'info> {
    #[account(mut)]
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
            creator.key().as_ref(),
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
            creator.key().as_ref(),
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


#[derive(Accounts)]
#[instruction(cid: u64, creator: Pubkey)]
pub struct StartChallange<'info> { 
    #[account(mut)]
    pub challanger: Signer<'info>, 

    #[account(
        mut,
        seeds = [
            b"challenge",
            creator.key().as_ref(),
            cid.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub challange: Account<'info, Challenge>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(cid: u64, creator: Pubkey)]
pub struct SubmitChallenge<'info> { 
    #[account(mut)]
    pub challenger: Signer<'info>, 

    #[account(
        init, 
        payer = challenger,
        space = ANCHOR_DISCRIMINTOR_SIZE + ParticipantSubmission::INIT_SPACE,
        seeds = [
            b"submission", 
            challenger.key().as_ref(), 
            creator.as_ref(),
            cid.to_le_bytes().as_ref(),
        ], 
        bump
    )]
    pub participant_submission: Account<'info, ParticipantSubmission>,

    #[account(
        mut, 
        seeds = [
            b"challenge", 
            creator.key().as_ref(), 
            cid.to_le_bytes().as_ref(),
        ], 
        bump
    )]
    pub challenge: Account<'info, Challenge>, 

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AcceptSubmission<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, 
        seeds = [
            b"challenge", 
            owner.key().as_ref(),
            challenge.cid.to_le_bytes().as_ref(),
        ],
        bump,
        has_one = owner,
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(mut,
        seeds = [
            b"submission", 
            participant_submission.participant.as_ref(),
            owner.key().as_ref(),
            challenge.cid.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub participant_submission: Account<'info, ParticipantSubmission>,

    /// CHECK: We'll transfer SOL to this wallet, validate before transfer
    #[account(mut, address = participant_submission.wallet_address)]
    pub recipient_wallet: UncheckedAccount<'info>,

    #[account(mut)]
    pub reward_payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
