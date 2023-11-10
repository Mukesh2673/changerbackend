const AWS = require("aws-sdk");
const { deleteFile } = require("../libs/utils");
const {
  MediaConvertClient,
  CreateJobCommand,
} = require("@aws-sdk/client-mediaconvert");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const options = {
  secretAccessKey: process.env["AWS_SECRET_KEY"],
  accessKeyId: process.env["AWS_ACCESS_KEY"],
  region: process.env["AWS_REGION"],
  endpoint: process.env["AWS_BUCKET_END_POINT"],
};
const mediaConvertClient = new MediaConvertClient({
  region: process.env["AWS_REGION"],
  credentials: {
    secretAccessKey: process.env["AWS_SECRET_KEY"],
    accessKeyId: process.env["AWS_ACCESS_KEY"],
  },
  endpoint: process.env["AWS_MEDIA_CONVERT_END_POINT"],
});

exports.upload = async (file) => {
  return new Promise((resolve, reject) => {
    const source = `uploads/${file.filename}`;
    new ffmpeg(source)
      .videoCodec("libx265")
      .videoCodec('libx264')
  .videoBitrate(1000)
  .outputOptions([
    '-minrate 200k',
    '-maxrate 1500k'
  ])
      .on("end", async function () {
        AWS.config.update(options);
        const s3 = new AWS.S3({
          s3ForcePathStyle: true,
        });
        let newName = Date.now() + ".mp4";
        const resizeVideoFile = fs.readdirSync("media/");

        let s3Params = {
          //ACL: 'public-read',
          ContentType: "video/mp4",
          Bucket: "videos",
          Body: fs.createReadStream(`media/${resizeVideoFile[0]}`),
          Key: `${newName}`,
        };
        try {
          let data = await s3.upload(s3Params).promise();
          if (data) {
            const outputKey = Date.now();
            //automated abr
            const params = {
              UserMetadata: {},
              Role: process.env["AWS_IAM_ROLE"],
              Settings: {
                TimecodeConfig: {
                  Source: "ZEROBASED",
                },
                OutputGroups: [
                  {
                    Name: "Apple HLS",
                    Outputs: [
                      {
                        ContainerSettings: {
                          Container: "M3U8",
                          M3u8Settings: {
                            AudioFramesPerPes: 4,
                            PcrControl: "PCR_EVERY_PES_PACKET",
                            PmtPid: 480,
                            PrivateMetadataPid: 503,
                            ProgramNumber: 1,
                            PatInterval: 0,
                            PmtInterval: 0,
                            Scte35Source: "NONE",
                            NielsenId3: "NONE",
                            TimedMetadata: "NONE",
                            VideoPid: 481,
                            AudioPids: [
                              482, 483, 484, 485, 486, 487, 488, 489, 490, 491,
                              492,
                            ],
                          },
                        },
                        VideoDescription: {
                          ScalingBehavior: "DEFAULT",
                          TimecodeInsertion: "DISABLED",
                          AntiAlias: "ENABLED",
                          Sharpness: 50,
                          CodecSettings: {
                            Codec: "H_264",
                            H264Settings: {
                              InterlaceMode: "PROGRESSIVE",
                              NumberReferenceFrames: 3,
                              Syntax: "DEFAULT",
                              Softness: 0,
                              FramerateDenominator: 1,
                              GopClosedCadence: 1,
                              GopSize: 60,
                              Slices: 2,
                              GopBReference: "DISABLED",
                              EntropyEncoding: "CABAC",
                              FramerateControl: "SPECIFIED",
                              RateControlMode: "QVBR",
                              CodecProfile: "MAIN",
                              Telecine: "NONE",
                              FramerateNumerator: 30,
                              MinIInterval: 0,
                              AdaptiveQuantization: "AUTO",
                              CodecLevel: "AUTO",
                              FieldEncoding: "PAFF",
                              SceneChangeDetect: "ENABLED",
                              QualityTuningLevel: "MULTI_PASS_HQ",
                              FramerateConversionAlgorithm: "DUPLICATE_DROP",
                              UnregisteredSeiTimecode: "DISABLED",
                              GopSizeUnits: "FRAMES",
                              ParControl: "INITIALIZE_FROM_SOURCE",
                              NumberBFramesBetweenReferenceFrames: 2,
                              RepeatPps: "DISABLED",
                              DynamicSubGop: "STATIC",
                            },
                          },
                          AfdSignaling: "NONE",
                          DropFrameTimecode: "ENABLED",
                          RespondToAfd: "NONE",
                          ColorMetadata: "INSERT",
                        },
                        OutputSettings: {
                          HlsSettings: {
                            AudioGroupId: "program_audio",
                            AudioRenditionSets: "program_audio",
                            AudioOnlyContainer: "AUTOMATIC",
                            IFrameOnlyManifest: "EXCLUDE",
                          },
                        },
                        NameModifier: "video",
                      },
                      {
                        ContainerSettings: {
                          Container: "M3U8",
                          M3u8Settings: {
                            AudioFramesPerPes: 4,
                            PcrControl: "PCR_EVERY_PES_PACKET",
                            PmtPid: 480,
                            PrivateMetadataPid: 503,
                            ProgramNumber: 1,
                            PatInterval: 0,
                            PmtInterval: 0,
                            Scte35Source: "NONE",
                            NielsenId3: "NONE",
                            TimedMetadata: "NONE",
                            TimedMetadataPid: 502,
                            VideoPid: 481,
                            AudioPids: [
                              482, 483, 484, 485, 486, 487, 488, 489, 490, 491,
                              492,
                            ],
                          },
                        },
                        AudioDescriptions: [
                          {
                            AudioTypeControl: "FOLLOW_INPUT",
                            AudioSourceName: "Audio Selector 1",
                            CodecSettings: {
                              Codec: "AAC",
                              AacSettings: {
                                AudioDescriptionBroadcasterMix: "NORMAL",
                                Bitrate: 96000,
                                RateControlMode: "CBR",
                                CodecProfile: "LC",
                                CodingMode: "CODING_MODE_2_0",
                                RawFormat: "NONE",
                                SampleRate: 48000,
                                Specification: "MPEG4",
                              },
                            },
                            LanguageCodeControl: "FOLLOW_INPUT",
                          },
                        ],
                        OutputSettings: {
                          HlsSettings: {
                            AudioGroupId: "program_audio",
                            AudioTrackType:
                              "ALTERNATE_AUDIO_AUTO_SELECT_DEFAULT",
                            AudioOnlyContainer: "AUTOMATIC",
                            IFrameOnlyManifest: "EXCLUDE",
                          },
                        },
                        NameModifier: "audio",
                      },
                    ],
                    OutputGroupSettings: {
                      Type: "HLS_GROUP_SETTINGS",
                      HlsGroupSettings: {
                        ManifestDurationFormat: "FLOATING_POINT",
                        SegmentLength: 10,
                        TimedMetadataId3Period: 10,
                        CaptionLanguageSetting: "OMIT",
                        Destination: `s3://changer-mvp/encoded/${outputKey}`,
                        TimedMetadataId3Frame: "PRIV",
                        CodecSpecification: "RFC_4281",
                        OutputSelection: "MANIFESTS_AND_SEGMENTS",
                        ProgramDateTimePeriod: 600,
                        MinSegmentLength: 0,
                        MinFinalSegmentLength: 0,
                        DirectoryStructure: "SINGLE_DIRECTORY",
                        ProgramDateTime: "EXCLUDE",
                        SegmentControl: "SEGMENTED_FILES",
                        ManifestCompression: "NONE",
                        ClientCache: "ENABLED",
                        AudioOnlyHeader: "INCLUDE",
                        StreamInfResolution: "INCLUDE",
                      },
                    },
                    AutomatedEncodingSettings: {
                      AbrSettings: {
                        MaxRenditions: 6,
                        MaxAbrBitrate: 5000000,
                        MinAbrBitrate: 100000,
                      },
                    },
                  },
                ],
                AdAvailOffset: 0,
                Inputs: [
                  {
                    AudioSelectors: {
                      "Audio Selector 1": {
                        Offset: 0,
                        DefaultSelection: "DEFAULT",
                        ProgramSelection: 1,
                      },
                    },
                    VideoSelector: {
                      ColorSpace: "FOLLOW",
                      Rotate: "DEGREE_0",
                      AlphaBehavior: "DISCARD",
                    },
                    FilterEnable: "AUTO",
                    PsiControl: "USE_PSI",
                    FilterStrength: 0,
                    DeblockFilter: "DISABLED",
                    DenoiseFilter: "DISABLED",
                    InputScanType: "AUTO",
                    TimecodeSource: "ZEROBASED",
                    FileInput: `s3://changer-mvp/videos/${newName}`,
                  },
                ],
              },
              AccelerationSettings: {
                Mode: "PREFERRED",
              },
              StatusUpdateInterval: "SECONDS_60",
              Priority: 0,
            };
            const command = new CreateJobCommand(params);
            let encodedResult = await mediaConvertClient.send(command);
            if (encodedResult.Job.Status === "SUBMITTED") {
              let response = {
                encodedKey: outputKey + ".m3u8",
                //encodedKey: outputKey + ".mp4",
                status: encodedResult.Job.Status,
                status: 200,
              };
              deleteFile("media/");
              deleteFile("uploads/");
              resolve(response);
            }
          }
          resolve(data);
        } catch (err) {
          deleteFile("uploads/");
          deleteFile("media/");
          console.log(`Error uploading file to S3. Details: ${err}`);
          reject(err);
        }
      })
      .on("error", function (error) {
        deleteFile("uploads/");
        deleteFile("media/");
        console.log("err is", error);
        reject({ error: error, status: 400 });
      })
      .save(`media/${file.filename}`);
  });
};
exports.uploadVideoThumbnail = async (file) => {
  return new Promise((resolve, reject) => {
    const source = `uploads/${file.filename}`;
    new ffmpeg({ source: source, nolog: true })
      .takeScreenshots(
        { timemarks: ["00:00:01.000"], size: "1150x1400" },
        "thumbnail/"
      )
      .on("end", async function () {
        AWS.config.update(options);
        const s3 = new AWS.S3({
          s3ForcePathStyle: true,
        });
        let newName = Date.now() + ".mp4";
        const imageFiles = fs.readdirSync("thumbnail/");
        let s3Params = {
          ContentType: "video/mp4",
          Bucket: "thumbnail",
          Body: fs.createReadStream(`thumbnail/${imageFiles[0]}`),
          Key: `${newName}`,
        };
        try {
          let data = await s3.upload(s3Params).promise();
          if (data) {
            deleteFile("thumbnail");
          }
          resolve(data);
        } catch (err) {
          deleteFile("thumbnail");
          console.log("erroris", err);
        }
      })
      .on("error", function () {
        deleteFile("uploads/");
        deleteFile("thumbnail");
        console.log("err is", error);
        reject({ error: error, status: 400 });
      });
  });
};
