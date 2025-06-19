use anchor_lang::prelude::*;

use crate::constants::ANCHOR_DISCRIMINTOR_SIZE;
use crate::user::User;
use crate::errors::ErrCode;

pub fn create_user(ctx: Context<CreateUser>, username: String, avatar_url: String) -> Result<()> {
    let profile = &mut ctx.accounts.profile;

    require!(username.len() <= 15, ErrCode::UsernameTooLong);
    require!(avatar_url.len() <= 100, ErrCode::AvatarTooLong);

    profile.wallet = ctx.accounts.user.key();
    profile.username = username;
    profile.avatar_url = avatar_url;
    profile.created_at = Clock::get()?.unix_timestamp as u64;
    profile.participant_score = 0;
    profile.creator_score = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>, 

    #[account(
        init, 
        space = ANCHOR_DISCRIMINTOR_SIZE + User::INIT_SPACE, 
        payer = user, 
        seeds = [
            b"profile", 
            user.key().as_ref()
        ],
        bump
    )]
    pub profile: Account<'info, User>, 

    pub system_program: Program<'info, System>,
}
