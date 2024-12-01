"use client"
import Image from "next/image"
import { useState } from "react";

const SalgContent = () => {
    const [activeImage, setActiveImage] = useState<string>("default");

    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5">
                <div className="flex flex-col gap-5">
                    <div className="space-y-4 max-w-xl">
                        <span className="rounded-lg bg-green-800 dark:bg-gray-900 px-2.5 py-1 text-xs font-semibold tracking-wide text-green-50 dark:text-gray-100">Dette gjør vi for deg</span>
                        <h1 className="text-3xl font-semibold text-green-950 dark:text-gray-200 md:text-4xl xl:text-5xl leading-tight">Få Kontroll på HMS-en – Vi Gjør Jobben for Deg!</h1>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Vi forstår utfordringene 
                        mange bedrifter møter når det gjelder å få på plass et komplett og funksjonelt 
                        HMS-system. Usikkerhet rundt lovkrav, mangel på tid og kunnskap, og frykten 
                        for ikke å ha alt på plass ved en kontroll kan skape mye stress. Med InnUt.io 
                        tar vi byrden fra dine skuldre og sørger for at din bedrift er trygg, 
                        compliant og effektiv.</p>
                </div>
                <div className="mt-16 flex flex-col md:flex-row gap-8 xl:gap-10">
                    <div className="md:w-96 lg:w-[26rem] space-y-5 flex flex-col md:py-6">
                        <div 
                            className="cursor-pointer relative p-3 before:rounded-md space-y-3 before:absolute before:transition-all before:ease-linear before:scale-x-105 before:scale-y-110 before:inset-0 before:bg-gray-100 dark:before:bg-gray-900"
                            onMouseEnter={() => setActiveImage("handbook")}
                            onMouseLeave={() => setActiveImage("default")}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">
                                HMS-håndbok skreddersydd
                            </h2>
                            <p className="relative text-gray-700 dark:text-gray-300 text-sm">
                                Vi utarbeider HMS-håndboken sammen med deg, tilpasset din 
                                virksomhets behov og lovkrav. Dette sikrer at du alltid har 
                                riktig dokumentasjon på plass.
                            </p>
                        </div>

                        <div 
                            className="cursor-pointer relative p-3 before:rounded-md space-y-3 before:absolute before:transition-all before:ease-linear hover:before:scale-x-105 before:scale-y-110 before:inset-0 hover:before:bg-gray-100 dark:hover:before:bg-gray-900"
                            onMouseEnter={() => setActiveImage("stoffkartotek")}
                            onMouseLeave={() => setActiveImage("default")}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">
                                Stoffkartotek uten stress
                            </h2>
                            <p className="relative text-gray-700 dark:text-gray-300 text-sm">
                                Vi oppretter og administrerer ditt stoffkartotek, inkludert 
                                datablad, slik at du enkelt kan dokumentere og håndtere kjemikalier 
                                i henhold til gjeldende HMS-regelverk.
                            </p>
                        </div>

                        <div 
                            className="cursor-pointer relative p-3 before:rounded-md space-y-3 before:absolute before:transition-all before:ease-linear hover:before:scale-x-105 before:scale-y-110 before:inset-0 hover:before:bg-gray-100 dark:hover:before:bg-gray-900"
                            onMouseEnter={() => setActiveImage("vernerunder")}
                            onMouseLeave={() => setActiveImage("default")}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">
                                Vernerunder med ekspertise
                            </h2>
                            <p className="relative text-gray-700 dark:text-gray-300 text-sm">
                                Vi gjennomfører vernerunder i henhold til lovpålagte krav og 
                                gir deg praktiske anbefalinger for å styrke sikkerheten på 
                                arbeidsplassen.
                            </p>
                        </div>

                        <div 
                            className="cursor-pointer relative p-3 before:rounded-md space-y-3 before:absolute before:transition-all before:ease-linear hover:before:scale-x-105 before:scale-y-110 before:inset-0 hover:before:bg-gray-100 dark:hover:before:bg-gray-900"
                            onMouseEnter={() => setActiveImage("opplaering")}
                            onMouseLeave={() => setActiveImage("default")}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">
                                Rask oppstart med opplæring
                            </h2>
                            <p className="relative text-gray-700 dark:text-gray-300 text-sm">
                                Vi hjelper deg i gang med InnUt.io gjennom profesjonell 
                                opplæring og skreddersydd oppsett. På den måten kan du og 
                                teamet ditt komme raskt i gang med en løsning som fungerer.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 md:h-auto">
                        <div className="flex-1 relative bg-gradient-to-tr from-emerald-300 to-emerald-800 
                            p-6 rounded-lg aspect-[4/2.4] md:aspect-auto md:h-full overflow-hidden flex items-center justify-center">
                            
                            {/* Default HMS bilde */}
                            <Image 
                                src="/images/HMS.png" 
                                alt="HMS illustration" 
                                width={1800} 
                                height={1200} 
                                className={`w-4/5 h-auto transition-opacity duration-500 absolute
                                    ${activeImage === "default" ? "opacity-100" : "opacity-0"}`}
                            />
                            
                            {/* Håndbok bilde */}
                            <Image 
                                src="/images/HMS.png" 
                                alt="HMS handbook illustration" 
                                width={1800} 
                                height={1200} 
                                className={`w-4/5 h-auto transition-opacity duration-500 absolute
                                    ${activeImage === "handbook" ? "opacity-100" : "opacity-0"}`}
                            />
                            
                            {/* Stoffkartotek bilde */}
                            <Image 
                                src="/images/stoffkartotek.svg" 
                                alt="Stoffkartotek illustration" 
                                width={1800} 
                                height={1200} 
                                className={`w-4/5 h-auto transition-opacity duration-500 absolute
                                    ${activeImage === "stoffkartotek" ? "opacity-100" : "opacity-0"}`}
                            />
                            
                            {/* Vernerunder bilde */}
                            <Image 
                                src="/images/vernerunde.png" 
                                alt="Vernerunder illustration" 
                                width={1800} 
                                height={1200} 
                                className={`w-4/5 h-auto transition-opacity duration-500 absolute
                                    ${activeImage === "vernerunder" ? "opacity-100" : "opacity-0"}`}
                            />
                            
                            {/* Opplæring bilde */}
                            <Image 
                                src="/images/opplering.png" 
                                alt="Opplæring illustration" 
                                width={1800} 
                                height={1200} 
                                className={`w-4/5 h-auto transition-opacity duration-500 absolute
                                    ${activeImage === "opplaering" ? "opacity-100" : "opacity-0"}`}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex-1 md:h-auto">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">
                        Hvorfor velge oss?
                    </h2>
                    <p className="relative text-gray-700 dark:text-gray-300 text-sm">
                        Vi eliminerer tidkrevende oppgaver og usikkerhet, slik at du kan fokusere på å drive virksomheten din. Med vår hjelp trenger du ikke bekymre deg for om du har alt i orden ved en HMS-kontroll – vi sørger for at du har det.
                        Start reisen mot et tryggere og mer effektivt arbeidsmiljø i dag. Med InnUt.io er HMS enkelt, oversiktlig og alltid oppdatert.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default SalgContent;