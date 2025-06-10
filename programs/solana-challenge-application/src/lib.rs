use anchor_lang::prelude::*;

pub mod challange;
pub mod states;

use crate::challange::Challange;
use crate::states::ProgramState;

declare_id!("3ktaaLhu7U97irLAWRjWWDnSf4rzLgVwQWtijUQ15tFF");

#[program]
pub mod solana_challenge_application {
    use super::*;
}
