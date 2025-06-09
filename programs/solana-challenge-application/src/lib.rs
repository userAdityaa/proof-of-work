use anchor_lang::prelude::*;

declare_id!("3ktaaLhu7U97irLAWRjWWDnSf4rzLgVwQWtijUQ15tFF");

#[program]
pub mod solana_challenge_application {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
