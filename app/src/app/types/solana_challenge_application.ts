/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_challenge_application.json`.
 */
export type SolanaChallengeApplication = {
  "address": "4JtqnSvkAqUMKPyJ42goKuci2uodrQpaEsVcQGPX38ZD",
  "metadata": {
    "name": "solanaChallengeApplication",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acceptSubmission",
      "discriminator": [
        65,
        133,
        222,
        91,
        162,
        82,
        229,
        203
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "challenge"
          ]
        },
        {
          "name": "challenge",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "challenge.cid",
                "account": "challenge"
              }
            ]
          }
        },
        {
          "name": "participantSubmission",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "participant_submission.participant",
                "account": "participantSubmission"
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "challenge.cid",
                "account": "challenge"
              }
            ]
          }
        },
        {
          "name": "recipientWallet",
          "writable": true
        },
        {
          "name": "rewardPayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "ownerUserAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "participantUserAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "participant_submission.participant",
                "account": "participantSubmission"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeProgramState",
      "discriminator": [
        71,
        153,
        195,
        5,
        141,
        244,
        200,
        84
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "createChallenge",
      "discriminator": [
        170,
        244,
        47,
        1,
        1,
        15,
        173,
        239
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "imageUrl",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "rewardType",
          "type": "u8"
        },
        {
          "name": "rewardAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createUser",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "profile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "avatarUrl",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteChallenge",
      "discriminator": [
        39,
        138,
        78,
        63,
        120,
        101,
        153,
        117
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeProgramState",
      "discriminator": [
        114,
        90,
        170,
        208,
        223,
        41,
        40,
        160
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "initializer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "startChallenge",
      "discriminator": [
        241,
        96,
        253,
        187,
        177,
        158,
        16,
        122
      ],
      "accounts": [
        {
          "name": "challanger",
          "writable": true,
          "signer": true
        },
        {
          "name": "challange",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "creator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "submitChallenge",
      "discriminator": [
        138,
        65,
        75,
        102,
        164,
        142,
        10,
        202
      ],
      "accounts": [
        {
          "name": "challenger",
          "writable": true,
          "signer": true
        },
        {
          "name": "participantSubmission",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "challenger"
              },
              {
                "kind": "arg",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "challenge",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "proofUrl",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateChallenge",
      "discriminator": [
        189,
        212,
        76,
        181,
        2,
        202,
        238,
        16
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "imageUrl",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "rewardType",
          "type": "u8"
        },
        {
          "name": "rewardAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "challenge",
      "discriminator": [
        119,
        250,
        161,
        121,
        119,
        81,
        22,
        208
      ]
    },
    {
      "name": "participantSubmission",
      "discriminator": [
        236,
        194,
        199,
        219,
        172,
        248,
        206,
        66
      ]
    },
    {
      "name": "programState",
      "discriminator": [
        77,
        209,
        137,
        229,
        149,
        67,
        167,
        230
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "challangeCountOverflowed",
      "msg": "Challange count overflowed."
    },
    {
      "code": 6001,
      "name": "titleTooLong",
      "msg": "Title exceeded 20 characters."
    },
    {
      "code": 6002,
      "name": "descriptionTooLong",
      "msg": "Description may not exceed 256 characters."
    },
    {
      "code": 6003,
      "name": "imageUrlTooLong",
      "msg": "Image URL may not exceed 120 characters."
    },
    {
      "code": 6004,
      "name": "locationTooLong",
      "msg": "Location may not exceed 20 characters."
    },
    {
      "code": 6005,
      "name": "invalidRewardAmount",
      "msg": "Reward amount must be greater than zero."
    },
    {
      "code": 6006,
      "name": "invalidRewardType",
      "msg": "Unknown reward type."
    },
    {
      "code": 6007,
      "name": "unauthorized",
      "msg": "The account is not authorized for this action."
    },
    {
      "code": 6008,
      "name": "challengeAlreadyOpened",
      "msg": "In progress challenge can't be updated in between."
    },
    {
      "code": 6009,
      "name": "invalidChallengeId",
      "msg": "The challenge id didn't match."
    },
    {
      "code": 6010,
      "name": "challengeNotOpen",
      "msg": "Challenge is not open for participation."
    },
    {
      "code": 6011,
      "name": "maxParticipantsReached",
      "msg": "Maximum participants reached."
    },
    {
      "code": 6012,
      "name": "usernameTooLong",
      "msg": "Username is greater than 15 character."
    },
    {
      "code": 6013,
      "name": "avatarTooLong",
      "msg": "Avatar url is greater than 100 character."
    },
    {
      "code": 6014,
      "name": "challengeClosed",
      "msg": "Challenge is now closed."
    },
    {
      "code": 6015,
      "name": "overflow",
      "msg": "User Score overflowed."
    }
  ],
  "types": [
    {
      "name": "challenge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "programState",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "rewardType",
            "type": "u8"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "participant",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "submissions",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "participantSubmission",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "participant",
            "type": "pubkey"
          },
          {
            "name": "proofUrl",
            "type": "string"
          },
          {
            "name": "walletAddress",
            "type": "pubkey"
          },
          {
            "name": "verified",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "programState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialize",
            "type": "bool"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "challengeCount",
            "type": "u64"
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "platformAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "avatarUrl",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "creatorScore",
            "type": "u64"
          },
          {
            "name": "participantScore",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
