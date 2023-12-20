import React from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";

const Navbar = async () => {
  const session = await auth();
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 px-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" passHref>
          <Image src="/logo.png" alt="logo" width={80} height={30} />
        </Link>
        <ul className="flex space-x-6 text-gray-700">
          <li>
            <Link href="/" passHref>
              Home
            </Link>
          </li>
          {session ? (
            <>
              <li>
                <Link href="/user/profile" passHref>
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/api/auth/signout" passHref>
                  Sign Out
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link href="/api/auth/signin" passHref>
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
