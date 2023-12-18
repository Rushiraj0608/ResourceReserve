import { useState } from "react";
import { nameCheck } from "./helper";

const Tags = (props) => {
  const [error, setError] = useState("");
  const addTags = () => {
    let tag = document.getElementById("createResourceTags").value;
    let tags = [];
    tag = nameCheck(tag, "tag");
    if (!tag.validity) {
      setError(tag.data);
    } else {
      setError("");
      tags = [...props.tags, tag.data];
      props.setTags(tags);
    }
    document.getElementById("createResourceTags").value = "";
  };
  const removeTag = (tag) => {
    let tags = props.tags.filter((x) => x != tag);
    console.log(tags);
    props.setTags(tags);
  };
  return (
    <div className="">
      <div className="ml-2">
        <label htmlFor="createResourceTags" className="block">
          Enter tag name and click Add tag to add tags
        </label>
        <input
          type="text"
          name="createResourceTags"
          id="createResourceTags"
          className=" border-b-4 w-max border-black focus:outline-none"
          placeholder="Enter tag name "
        />
        <button
          onClick={addTags}
          type="button"
          disabled={props?.tags?.length >= 5}
          className="m-2 p-3 rounded-xl bg-green-400 "
        >
          Add Tag
        </button>

        {props.tags && props?.tags?.length > 0 && (
          <div className="mt-4 mb-4">
            {props.tags.map((x) => (
              <span
                className="inline-block bg-gray-300 rounded-xl border-2 p-2 m-2 w-fit "
                key={`${x}_tag`}
              >
                <span className=" text-lg">{x}</span>
                <button
                  onClick={() => removeTag(x)}
                  className="text-xs"
                  type="button"
                >
                  ❌
                </button>
              </span>
            ))}
          </div>
        )}
        {error && error.length > 0 && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Tags;
