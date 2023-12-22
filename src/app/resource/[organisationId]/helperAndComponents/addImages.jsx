"use client";
import Image from "next/image";
import upload from "./images.png";
import { useState } from "react";

function App({ setImages, images }) {
  let [error, setError] = useState("");
  function handleChange(e) {
    if (images.length > 4) setError("cant add more than 5 images");
    let data = e.target.files[0];
    let flag = 0;
    let temp = [...images];
    images.map((image) => {
      if (typeof image == "string") {
        let str = image.split(/\.com\/(.*?)\?/)[1];
        str = decodeURIComponent(str);
        if (str == data.name) {
          console.log("preventing");
          flag = 1;
        }
      } else if (typeof image == "object") {
        if (image.file.name == data.name) {
          console.log("preventing");
          flag = 1;
        }
      }
    });
    if (flag) {
      setError("the image already exists");
      setTimeout(() => setError(""), 10000);
    } else {
      console.log("adding new");
      temp = [...images, { blob: URL.createObjectURL(data), file: data }];
    }

    setImages(temp);
    e.target.value = "";
  }

  function removeImage(name) {
    let image = images.filter((x) => (x.blob || x) != name);
    setImages(image);
  }

  return (
    <>
      <label htmlFor="createResourceImages">Add Images</label>
      <span className=" grid  grid-cols-3 gap-5 h-fit w-3/5 m-auto justify-items-center bg-stone-700 p-6 ">
        <label htmlFor="createResourceImages">
          <Image src={upload} width={100} height={100} alt="upload image" />
        </label>
        <input
          type="file"
          id="createResourceImages"
          onChange={handleChange}
          disabled={images?.length >= 5}
          className="hidden"
          accept="image/*"
        />
        {images &&
          images?.length > 0 &&
          images.map((x, y) => (
            <span className="relative" key={`${y}_resource_image`}>
              <img
                src={x.blob || x}
                className="h-32 w-32 inline-block"
                alt={`image of the resource`}
              />
              <button
                type="button"
                className="absolute right-0 bg-white/40 rounded-full p-1 backdrop-blur-sm"
                onClick={() => {
                  removeImage(x.blob || x);
                }}
              >
                ❌
              </button>
            </span>
          ))}
        {error && error?.length >= 5 && (
          <p className="text-red-500 text-center">{error}</p>
        )}
      </span>
    </>
  );
}

export default App;
