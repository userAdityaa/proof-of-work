use anchor_lang::prelude::*;

pub mod challenge;
pub mod constants;
pub mod instructions;
pub mod states;

use challenge::*;
use states::*;

declare_id!("3ktaaLhu7U97irLAWRjWWDnSf4rzLgVwQWtijUQ15tFF");

#[program]
pub mod solana_challenge_application {
    use super::*;
}
