// ResourceCard.jsx
import Image from "next/image";
import Link from "next/link";

const ResourceCard = ({ resource }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex flex-col items-center">
        {resource.images && resource.images.length > 0 ? (
          <Image
            src={resource.images[0]} // Display the first image from the array
            alt={`${resource.name} Image`}
            width={96}
            height={96}
            className="rounded-full mb-4"
          />
        ) : (
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
            alt="Default Image"
            width={96}
            height={96}
            className="rounded-full mb-4"
          />
        )}
        <div className="text-center">
          <h2 className="text-lg font-semibold">{resource.name}</h2>
          <Link href={`dashboard/managerResources/${resource.id}`}>
            <p className="text-blue-500 mb-2">View Resource</p>
          </Link>
          {/* You can add additional content here based on user type */}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
