import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/app/components/ui/Navbar'
import { auth } from "@/lib/auth"
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Resource Reserve App',
  description: 'A resource reservation application',
}

export default async function RootLayout({ children }) {

  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
