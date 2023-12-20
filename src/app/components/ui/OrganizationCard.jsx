// OrganizationCard.jsx
import Image from "next/image";
import Link from "next/link";

const OrganizationCard = ({ organization, onDelete, userType }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex flex-col items-center">
        {organization.image ? (
          <Image
            src={organization.image}
            alt={`${organization.name} Image`}
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
          <h2 className="text-lg text-black font-semibold">{organization.name}</h2>

          {userType === "SuperAdmin" && (
            <Link href={`dashboard/superAdminOrgs/${organization.id}`}>
              <p className="text-blue-500 mb-2">View Organization</p>
            </Link>
          )}

          {userType === "Admin" && (
            <Link href={`dashboard/adminOrgs/${organization.id}`}>
              <p className="text-blue-500 mb-2">View Organization</p>
            </Link>
          )}

          {userType === "SuperAdmin" && (
            <button
              onClick={() => onDelete(organization.id)}
              className="bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Delete Organization
            </button>
          )}

          {userType === "user" && (
            <Link href={`/organizations/${organization.id}`}>
              <p className="text-blue-500 mb-2">View Organization</p>
            </Link>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
