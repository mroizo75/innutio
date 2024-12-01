"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { KontaktDialog } from './KontaktDialog'

export default function Navbar() {
  const [navIsOpened, setNavIsOpened] = useState(false)
  
  
  const toggleNavbar = () => {
    setNavIsOpened(prevState => !prevState)
  }

  return (
    <header className="sticky left-0 top-0 w-full flex items-center h-20 border-b border-b-gray-100 dark:border-b-gray-900 z-40 bg-white dark:bg-gray-950 bg-opacity-80 backdrop-filter backdrop-blur-xl">
      <nav className="relative mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 flex gap-x-5 justify-between items-center">
        <div className="flex items-center min-w-max">
          <Link href="/" className="text-xl font-semibold flex items-center gap-x-2">
            <Image src="/images/nav-logo.png" alt="InnUt.io - HMS" width={200} height={200} priority className="dark:invert" />
          </Link>
        </div>
        <div className={`
          absolute top-full left-0 bg-white dark:bg-gray-950 lg:bg-transparent border-b border-gray-200 dark:border-gray-800 py-8 lg:py-0 px-5 sm:px-10 md:px-12 lg:px-0 lg:border-none w-full lg:top-0 lg:relative lg:flex lg:justify-between duration-300 ease-linear
          ${navIsOpened ? "translate-y-0 opacity-100 visible" : "translate-y-10 opacity-0 invisible lg:visible lg:translate-y-0 lg:opacity-100"}
        `}>
          <ul className="flex flex-col lg:flex-row gap-6 lg:items-center text-gray-700 dark:text-gray-300 lg:w-full lg:justify-center">
            <li>
              <Link href="#" className="relative py-2.5 duration-300 ease-linear hover:text-green-800 after:absolute after:w-full after:left-0 after:bottom-0 after:h-px after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-100 after:bg-green-800">Hjem</Link>
            </li>
            <li>
              <Link href="#tjeneste" className="relative py-2.5 duration-300 ease-linear hover:text-green-800 after:absolute after:w-full after:left-0 after:bottom-0 after:h-px after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-100 after:bg-green-800">Tjenester</Link>
            </li>
            <li>
              <Link href="#om" className="relative py-2.5 duration-300 ease-linear hover:text-green-800 after:absolute after:w-full after:left-0 after:bottom-0 after:h-px after:rounded-md after:origin-left after:ease-linear after:duration-300 after:scale-x-0 hover:after:scale-100 after:bg-green-800">Om oss</Link>
            </li>
          </ul>
          <div className="flex sm:items-center lg:min-w-max mt-10 lg:mt-0">
          <KontaktDialog className="bg-green-800 text-white hover:bg-green-900 m-2">
                Kontakt oss
              </KontaktDialog>
          <Link href="/auth/login">
            <Button variant="secondary" size="lg" className="hover:bg-gray-200 dark:hover:bg-gray-800">
              Logg inn
            </Button>
          </Link>
        </div>
        </div>
        <div aria-hidden="true" className="flex items-center lg:hidden">
          <button onClick={toggleNavbar} aria-label='toggle navbar' className="outline-none border-l border-l-indigo-100 dark:border-l-gray-800 pl-3 relative py-3">
            <span aria-hidden={true} className={`
              flex h-0.5 w-6 rounded bg-gray-800 dark:bg-gray-300 transition duration-300
              ${navIsOpened ? "rotate-45 translate-y-[.324rem]" : ""}
            `} />
            <span aria-hidden={true} className={`
              mt-2 flex h-0.5 w-6 rounded bg-gray-800 dark:bg-gray-300 transition duration-300
              ${navIsOpened ? "-rotate-45 -translate-y-[.324rem]" : ""}
              `} />
          </button>
        </div>
      </nav>
    </header>
  )
}