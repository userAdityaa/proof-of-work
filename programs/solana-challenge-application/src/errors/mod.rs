use anchor_lang::prelude::*;

#[error_code]
pub enum ErrCode {
    #[msg("Challange count overflowed.")]
    ChallangeCountOverflowed,
    #[msg("Description may not exceed 256 characters.")]
    DescriptionTooLong,
    #[msg("Image URL may not exceed 120 characters.")]
    ImageUrlTooLong,
    #[msg("Location may not exceed 20 characters.")]
    LocationTooLong,
    #[msg("Reward amount must be greater than zero.")]
    InvalidRewardAmount,
    #[msg("Unknown reward type.")]
    InvalidRewardType,
    #[msg("The account is not authorized for this action.")]
    Unauthorized,
    #[msg("In progress challenge can't be updated in between.")]
    ChallengeAlreadyOpened,
    #[msg("The challenge id didn't match.")]
    InvalidChallengeId,
    #[msg("Challenge is not open for participation.")]
    ChallengeNotOpen,
    #[msg("Maximum participants reached.")]
    MaxParticipantsReached,
}
