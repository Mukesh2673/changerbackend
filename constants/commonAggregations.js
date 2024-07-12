const campaigncommonPipeline=[
    {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline:[
            {
              $project: { _id: 1 , first_name:1, last_name:1, username:1 } 
            }  
          ]
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "advocates",
          localField: "advocate",
          foreignField: "_id",
          as: "advocate",
          pipeline:[
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                  {
                    $project: {
                      profileImage: 1,
                      _id :0
                    },
                  },
                ],
              },
            },
            {
              $project: {
                user: 1,
                _id: 0
              },
            }
          ]
        }
      },
      {
        $lookup: {
          from: "campaignPhase",
          localField: "phases",
          foreignField: "_id",
          as: "phases",
          pipeline:[
            {
              $lookup: {
                from: "campaingVolunteering",
                localField: "_id",
                foreignField: "phaseId",
                as: "campaignVolunteering",
                pipeline:[
                    {
                      $lookup: {
                        from: "skills",
                        localField: "skills",
                        foreignField: "_id",
                        as: "skills",
                        pipeline:[
                          {
                            $project: { _id: 1 , name: 1 } 
                          }
                        ]
                      }
                    },
                    {
                      $project: { requirements: 0 , provides: 0,karmaPoint: 0, phaseId: 0, responsibilities: 0 } 
   
                    }
                  ]
              },
            },
            { 
              $lookup: {
                from: "campaignVolunteers",
                localField: "participation",
                foreignField: "participation",
                as: "volunteers",
                pipeline:[
                  {
                    $match: {
                      approved: true
                    }
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "user",
                      foreignField: "_id",
                      as: "user",
                      pipeline:[
                        {
                          $project: { _id: 1 , first_name:1, last_name:1, username:1 } 
                        }
                      ]
                    },

                  },
                  { $project: { _id: 1 , user:1 } }
                  ]
              },
            },
            {
              $lookup: {
                from: "campaignSignedPetition",
                localField: "petition",
                foreignField: "petition",
                as: "signendPetitions",
                pipeline:[
                  {
                    $lookup: {
                      from: "users",
                      localField: "user",
                      foreignField: "_id",
                      as: "user",
                      pipeline:[
                        {
                          $project: { _id: 1 , first_name:1, last_name:1, username:1 } 
                        }
                      ]
                    },

                  },
                  { $project: { _id: 1 , user:1 } }
                  ]
              }
            },
            {
              $lookup: {
                from: "campaignDonation",
                localField: "_id",
                foreignField: "phaseId",
                as: "donation",
                pipeline:[
                  {
                    $project: { karmaPoint: 0 , phaseId:0, updatedAt:0, __v:0 } 
                  }
                ]
              }
            },
            {
              $lookup: {
                from: "campaignPetition",
                localField: "_id",
                foreignField: "phaseId",
                as: "petition",
                pipeline:[
                  {
                    $project: { karmaPoint: 0 , phaseId:0, updatedAt:0, __v:0 } 
                  }
                ]
              },
            },
            {
              $lookup: {
                from: "campaignDonated",
                localField: "campaignDonationId",
                foreignField: "donation",
                as: "donated",
                pipeline:[
                  {
                    $lookup: {
                      from: "users",
                      localField: "user",
                      foreignField: "_id",
                      as: "donatedBy",
                      pipeline:[
                        {
                          $project: { _id: 1 , first_name:1, last_name:1, username:1,profileImage:1 } 
                        }  
                      ]
                    },    
                 
                  },
                    {$project: { amount: 1 , donatedBy:1 }}
                ]
              },
            },
            {
              $addFields: {
                totalDonatedAmount: { $sum: "$donated.amount" }
              }
            },
            {
              $project: { _id: 1 , title: 1, donation: 1, createdAt: 1, volunteers: 1, signendPetitions: 1, campaignVolunteering:1, donated: 1, totalDonatedAmount:1,petition:1 }
            }
          ]

        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
          pipeline:[
            {
              $project: { _id: 1 , video_url: 1, thumbnail_url: 1, title: 1,likes: 1, comments: 1  } 
            }
          ]
        },
      },
      { $unwind: { path: "$video", preserveNullAndEmptyArrays: true } }, // Video may be null, so preserve nulls
      {
        $lookup: {
          from: "videos",
          localField: "impacts",
          foreignField: "_id",
          as: "impacts",
        },
      },
      {
        $lookup: {
          from: "notifications",
          localField: "updates",
          foreignField: "_id",
          as: "updates",
        },
      },    
]
// pipeline for card list campaign
const campaignListingPipeline=[
  {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline:[
          {
            $project: { _id: 1 , first_name:1, last_name:1, username:1 } 
          }  
        ]
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "advocates",
        localField: "advocate",
        foreignField: "_id",
        as: "advocate",
        pipeline:[
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    profileImage: 1,
                    _id :0
                  },
                },
              ],
            },
          },
          {
            $project: {
              user: 1,
              _id: 0
            },
          }
        ]
      }
    },
    {
      $lookup: {
        from: "campaignPhase",
        localField: "phases",
        foreignField: "_id",
        as: "phases",
        pipeline:[
          {
            $lookup: {
              from: "campaingVolunteering",
              localField: "_id",
              foreignField: "phaseId",
              as: "campaignVolunteering",
              pipeline:[
                  {
                    $project: { participant: 1 , roleTitle: 1, _id:0 } 
 
                  }
                ]
            },
          },
          {
            $lookup: {
              from: "campaignDonation",
              localField: "_id",
              foreignField: "phaseId",
              as: "donation",
              pipeline:[
                {
                  $project: { amount: 1 , description: 1, _id: 0} 
                }
              ]
            }
          },
   
   
          {
            $project: { campaignVolunteering: 1 , title: 1, donation: 1 }
          }
        ]

      },
    },
    {
      $project:{
        advocate: 1,
        phases: 1,
        image: 1,
        cause: 1,
        title: 1,
        createdAt: 1
      }
    }
  
]

//pipeline for card listing Issue
const issueListingPipeLine=[  
        {
        $lookup: {
          from: "users",
          localField: "joined",
          foreignField: "_id", 
          as: "joined",
          pipeline:[
            {
              $project:{
                first_name:1,
                last_name:1,
                profileImage:1
              }
            }
          ]
        }
      },
      { $project: { _id: 0,title:1,cause:1, location:1,address:1,joined:1, issueState:1 }}
]

//pipeline for card impact listing
const impactListingPipeLine=[
{
  $lookup:{
    from: "users",
    localField: "user",
    foreignField: "_id",
    as: "user",
    pipeline:[
      {$project: {first_name:1,last_name:1,profileImage:1, _id:0 }}

    ] 
  }
  },
  {
    $lookup: {
      from: "campaigns",
      localField: "campaign",
      foreignField: "_id",
      as: "campaign",
      pipeline:[
        { $project: { _id: 0,title:1,cause:1 }
      }]
    },
  },
  {
    $lookup: {
      from: "issues",
      localField: "issue",
      foreignField: "_id",
      as: "issue",
      pipeline:[
        { $project: { _id: 0,title:1,cause:1 }
      }]
    },
  },
  {
  $project:{
    user: 1,
    campaign: 1,
    issue: 1,
    title: 1,
    video_url: 1,
    thumbnail_url: 1,
    createdAt: 1,
  }
  }
]

//pipeline for user Listing
const userListingPipeLine=[
  {
    $lookup:{
      from: "videos",
      localField: "_id",
      foreignField: "user",
      as:"impacts"
    }
  },
  {
    $lookup:{
      from: "users",
      localField: "followers",
      foreignField: "_id",
      as:"followers",
      pipeline:[
        {
          $project:{
            _id:1
          }
        }
      ]
    }  
  },
  {
    $project: {
      _id: 1,
      username: 1,
      profileImage: 1,
      followers: 1,
      profileImage: 1,
      first_name: 1,
      last_name: 1,
      impacts: { $size: "$impacts" },
      cause:1
    },
  },
]

const campignIdDonationPipeline=[
  {
    $lookup: {
      from: "campaignDonation",
      localField: "campaignDonationId",
      foreignField: "_id",
      as: "campaignDonation",
    },
  },
  {
    $unwind: "$campaignDonation",
  },
  {
    $lookup: {
      from: "campaignPhase",
      localField: "campaignDonation.phaseId",
      foreignField: "_id",
      as: "campaignPhase",
      pipeline:[
        {$project: {campaign:1,_id:0 }}
      ]
    },
  },
  {
    $unwind: "$campaignPhase",
  },
  {$project: {campaign:"$campaignPhase.campaign"}}
]

const campignIdPetitionPipeline=[
  {
    $lookup: {
      from: "campaignPetition",
      localField: "petition",
      foreignField: "_id",
      as: "campaignPetition",
    },
  },
  {
    $unwind: "$campaignPetition",
  },
  {
    $lookup: {
      from: "campaignPhase",
      localField: "campaignPetition.phaseId",
      foreignField: "_id",
      as: "campaignPhase",
      pipeline:[
        {$project: {campaign:1,_id:0 }}
      ]
    },
  },
  {
    $unwind: "$campaignPhase",
  },
  {$project: {campaign:"$campaignPhase.campaign"}}

]

const videoCommonPipeline=[
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
      pipeline:[
        {
          $project: { _id: 1 , username: 1 ,first_name: 1, last_name: 1, profileImage: 1 } 
        }  
      ]
    }
  },     
{$unwind: '$user'},
  {
  $lookup: {
    from: 'campaigns',
    localField: 'campaign',
    foreignField: '_id',
    as: 'campaign',
    pipeline:[
      {
        $project: { _id: 1 , title: 1 ,story: 1, cause: 1} 
      }  
    ]
  }
 },
{
  $lookup: {
    from: 'issues',
    localField: 'issue',
    foreignField: '_id',
    as: 'issue',
    pipeline:[
      {
        $project: { _id: 1 , title: 1 ,description: 1, cause: 1} 
      }  
    ]
  }
},
{
  $lookup: {
    from: 'comments',
    localField: 'comments',
    foreignField: '_id',
    as: 'comments',
    pipeline: [
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
          pipeline:[
            {
              $project: { _id: 1 , username: 1 ,first_name: 1, last_name: 1, profileImage: 1 } 
            }  
          ]
        }
      },
      {
        $unwind: '$sender'
      },
      {
        $lookup: {
          from: 'commentsLikes',
          localField: 'likes',
          foreignField: '_id',
          as: 'likes',
          pipeline:[
            {
              $project: { _id: 1 , user: 1} 
            }  
          ]
        }
      },
      {
        $lookup: {
          from: 'repliesComments',
          localField: 'replies',
          foreignField: '_id',
          as: 'replies',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'sender',
                pipeline:[
                  {
                    $project: { _id: 1 , username: 1 ,first_name: 1, last_name: 1, profileImage: 1 } 
                  }  
                ]
              }
            },
            {
              $unwind: '$sender'
            },
            {
              $lookup: {
                from: 'commentsLikes',
                localField: 'likes',
                foreignField: '_id',
                as: 'likes'
              }
            },
            {
              $project:{
                updatedAt:0, __v:0, comment:0 
              }
            }

          ]
        }
      },
      {
        $project:{ updatedAt:0, __v:0}
      }
    ]
  },

}
]

module.exports = {
  campaignListingPipeline,
  issueListingPipeLine,
  impactListingPipeLine,
  userListingPipeLine,
  campaigncommonPipeline,
  campignIdDonationPipeline,
  campignIdPetitionPipeline,
  videoCommonPipeline
  // Add other pipelines as needed
};

