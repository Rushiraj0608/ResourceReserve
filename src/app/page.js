import Image from 'next/image'
import { auth } from "@/lib/auth"
import Link from 'next/link';

export default async function Home() {
  const session = await auth();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-center px-4">
      <Image src="/logo.png" alt="Resource Reserver" width={200} height={200} />
      <h1 className="text-6xl font-bold mt-4">Resource Reserve</h1>
      {session && <h2 className="text-2xl mt-4">Welcome {session.user.name}</h2>}

      <p className="mt-6 text-lg text-gray-700 max-w-2xl">
        ResourceReserve is your go-to solution for simplifying the reservation process for a wide range of resources in both university campuses and apartment communities. Whether you need to book a study room, a sports field, or a communal area, this user-friendly platform ensures a seamless experience.
      </p>
      <Link href="/organizations" className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
        View Organizations
      </Link>
    </div>
  );
}
