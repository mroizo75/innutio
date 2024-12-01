import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Feature from '@/components/Feature'
import Om from '@/components/Om'
import { KontaktDialog } from "@/components/KontaktDialog"
import SalgContent from '@/components/SalgContent'
import SalgPains from '@/components/SalgPains'

export default async function Home() {
  const user = await getCurrentUser()

  if (user?.role) {
    switch (user.role) {
      case 'ADMIN':
        redirect('/admin')
      case 'LEDER':
        redirect('/leder')
      case 'USER':
        redirect('/ansatt')
      case 'PROSJEKTLEDER':
        redirect('/prosjektleder')
      default:
        redirect('/dashboard')
    }
  }

  return (
    <>
      <Navbar />
      <main className="py-4 mt-14 sm:mt-16 lg:mt-0">
        <div className="mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 grid lg:grid-cols-2 lg:items-center gap-10">
          <div className="flex flex-col space-y-8 sm:space-y-10 lg:items-center text-center lg:text-left max-w-2xl md:max-w-3xl mx-auto">
            <h1 className="font-semibold leading-tight text-teal-950 dark:text-white text-4xl sm:text-5xl lg:text-6xl">
              HMS og Prosjektstyring <span className="text-transparent bg-clip-text bg-gradient-to-tr from-green-700 to-green-800">Ferdig Gjort for Deg</span>
            </h1>
            <p className="text-gray-700 dark:text-gray-300 tracking-tight md:font-normal max-w-xl mx-auto lg:max-w-none lg:text-lg">
              Stresset med HMS? InnUt.io gir deg alt du trenger – komplett
              HMS-håndbok, stoffkartotek, vernerunder og prosjektstyring.
              Få kontroll på SJA, risikoanalyser og rapportering.
              Vi sørger for at din bedrift er trygg, effektiv og klar for
              tilsyn.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
              <Link href="/auth/register">
                <Button variant="secondary" size="lg" className="hover:bg-gray-200 dark:hover:bg-gray-800">
                  Kom i gang
                </Button>
              </Link>
              <KontaktDialog variant="default" className="bg-green-800 size-lg">
                Bestill en demo
              </KontaktDialog>
            </div>
          </div>
          <div className="flex aspect-square lg:aspect-auto lg:h-[35rem] relative">
            <div className="w-3/5 h-[80%] rounded-3xl overflow-clip border-8 border-gray-200 dark:border-gray-950 z-30">
              <Image src="/images/buildingImg.jpg" alt="Bygningsplanbilde" width={1300} height={1300} className="w-full h-full object-cover z-30" />
            </div>
            <div className="absolute right-0 bottom-0 h-[calc(100%-50px)] w-4/5 rounded-3xl overflow-clip border-4 border-gray-200 dark:border-gray-800 z-10">
              <Image src="/images/working-on-housing-project.jpg" alt="Arbeider på boligprosjekt" height={1300} width={1300} className="z-10 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </main>
      <section id="pains">
        <SalgPains />
      </section>
      <section id="tjeneste">
        <Feature />
      </section>
      <section id="salg">
        <SalgContent />
      </section>
      <section id="om">
        <Om />
      </section>
      <Footer />
    </>
  )
}
