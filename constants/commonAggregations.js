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
        },
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
module.exports = {
  campaigncommonPipeline,
  // Add other pipelines as needed
};

