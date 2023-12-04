"use client";
import Image from "next/image";
import upload from "./images.png";

function App({ setImages, images }) {
  function handleChange(e) {
    let data = e.target.files[0];
    let image = [...images, URL.createObjectURL(data)];
    setImages(image);
    e.target.value = "";
  }
  function removeImage(e) {
    let image = images.filter((x) => x != e.target.getAttribute("image"));
    setImages(image);
  }

  return (
    <>
      <label htmlFor="images">Add Images</label>
      <span className=" grid  grid-cols-3 gap-5 h-fit w-3/5 m-auto justify-items-center bg-stone-700 p-6 ">
        <label htmlFor="addImage">
          <Image src={upload} width={100} height={100} alt="upload image" />
        </label>
        <input
          type="file"
          id="addImage"
          onChange={handleChange}
          disabled={images?.length >= 5}
          className="hidden"
        />
        {images &&
          images?.length > 0 &&
          images.map((x) => (
            <span className="relative" key={`${x}_resource_image`}>
              <button
                type="button"
                className="absolute right-0 bg-white/40 rounded-full p-1 backdrop-blur-sm"
                image={x}
                onClick={removeImage}
                alt="added new image"
              >
                ❌
              </button>
              <img src={x} className="h-32 w-32 inline-block" />
            </span>
          ))}
      </span>
      {images && images?.length >= 5 && (
        <p className="text-red-500 text-center">you can add atmost 5 images</p>
      )}
    </>
  );
}

export default App;
