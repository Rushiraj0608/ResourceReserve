import AWS from "aws-sdk";

AWS.config.update({
  credentials: new AWS.Credentials(
    process.env.NEXT_PUBLIC_AMAZONS3_ACCESSKEY_NEW2,
    process.env.NEXT_PUBLIC_AMAZONS3_SECRETACCESSKEY_NEW2
  ),
  region: "us-east-1",
});

export const s3 = new AWS.S3();
