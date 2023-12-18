"use client";

import React, { useState } from "react";
import AWS from "aws-sdk";

const UploadImageToS3WithNativeSdk = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const handleFileInput = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  return (
    <div>
      <button onClick={async () => {}}>get</button>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          console.log(selectedFile);
          AWS.config.update({
            credentials: new AWS.Credentials(
              "AKIAUDTZ2EG4NN6OZRFT",
              "TkIdbjHsytTyp+SoURIS0GkFKwCuTPMbTHNVOGR7"
            ),
            region: "us-east-1",
          });
          let s3 = new AWS.S3();
          let folder = await s3
            .putObject({
              Bucket: "resourcereserves3",
              Key: "folder for an organisation/",
            })
            .promise();
          console.log(folder);
          const command = {
            Bucket: "resourcereserves3",
            Key: "forlder for an organisation",
          };
          console.log(command);
          var files = document.getElementById("photoupload").files;
          let file = files[0];
          console.log(file);
          let upload = new AWS.S3.ManagedUpload({
            params: {
              Bucket: "resourcereserves3",
              Key: file.name,
              Body: file,
              ContentType: file.name.split(".")[1],
            },
          });
          var promise = upload.promise();

          promise.then(
            function (data) {
              console.log(data);
              let s3 = new AWS.S3();
              const url = s3.getSignedUrl("getObject", {
                Bucket: "resourcereserves3",
                Key: data.Key,
                Expires: 36000,
              });
              console.log(url);
              setImages([...images, url]);
            },
            function (err) {
              return alert(
                "There was an error uploading your photo: ",
                err.message
              );
            }
          );
        }}
      >
        <input
          type="file"
          name="img"
          id="photoupload"
          accept="image/*"
          onChange={handleFileInput}
        />
        <button> Upload to S3</button>
      </form>

      <button
        onClick={() => {
          AWS.config.update({
            credentials: new AWS.Credentials(
              "AKIAUDTZ2EG4NN6OZRFT",
              "TkIdbjHsytTyp+SoURIS0GkFKwCuTPMbTHNVOGR7"
            ),
            region: "us-east-1",
          });

          let s3 = new AWS.S3({
            params: { Bucket: "resourcereserves3" },
          });
          s3.listObjects((err, data) => {
            if (err) console.log(err);
            else {
              console.log(this);
              // var href = this.request.httpRequest.endpoint.href;
              var bucketUrl = "https://s3.amazonaws.com/resourcereserves3/";
              var photos = data.Contents.map(function (photo) {
                var photoKey = photo.Key;
                var photoUrl = bucketUrl + encodeURIComponent(photoKey);
                return photoUrl;
              });
              setImages([...photos]);
            }
          }).on("success", (res) => {
            console.log(res);
          });
        }}
      >
        get image
      </button>
      {images &&
        images.length > 0 &&
        images.map((img, y) => <img key={`${y}`} src={img} />)}
    </div>
  );
};

export default UploadImageToS3WithNativeSdk;
