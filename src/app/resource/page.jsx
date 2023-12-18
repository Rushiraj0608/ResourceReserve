import UploadImageToS3WithNativeSdk from "./TryComponent";

import AWS from "aws-sdk";
import { db } from "../config";
import { addDoc, getDoc, setDoc, doc, collection } from "firebase/firestore";

async function getFile() {
  "use server";
  let x;
  let s3 = new AWS.S3();
  s3.listObjectsV2(
    { Bucket: process.env.AMAZONS3_BUCKETNAME_NEW2 },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        return data;
      }
    }
  );
}
async function uploadFile(frm) {
  "use server";

  // const S3_BUCKET = "YOUR_BUCKET_NAME_HERE";
  // const REGION = "YOUR_DESIRED_REGION_HERE";
  let file = frm.get("file");
  file = new File([file], "kjanlkfja");
  console.log(file);

  // const myBucket = new AWS.S3({
  //   params: { Bucket: process.env.AMAZONS3_BUCKETNAME_NEW2 },
  //   region: process.env.AMAZONS3_REGION,
  // });
}

export default async function Page() {
  return (
    <UploadImageToS3WithNativeSdk uploadFile={uploadFile} getFile={getFile} />
  );
}
