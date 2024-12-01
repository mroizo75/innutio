import Image from "next/image"

const SalgPains = () => {
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5">
                <div className="flex flex-col gap-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-semibold text-green-950 dark:text-gray-200 md:text-4xl xl:text-5xl leading-tight">Er dette deg?</h1>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 text-lg"></p>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">"Vi har ikke tid til dette!"</h2> 
                            <p>
                            Du er opptatt med å levere prosjekter, 
                            styre ansatte, og holde kundene fornøyde. HMS blir ofte dyttet 
                            nedover prioriteringslisten, men du vet at det må gjøres.
                            </p>
                        </div>
                        
                        <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 text-lg"></p>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">"Vi kan ikke alt om regelverket."</h2> 
                            <p>
                            Lovkravene er kompliserte 
                            og stadig i endring. Hva er egentlig riktig antall vernerunder? 
                            Hvordan lager vi en risikovurdering som faktisk fungerer?
                            </p>
                        </div>
                        
                        <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 text-lg"></p>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">"Hva skjer ved en kontroll?"</h2> 
                            <p>
                            Frykten for tilsyn fra Arbeidstilsynet 
                            kan være overveldende. Mangler du dokumentasjon, eller er ikke alt 
                            oppdatert, risikerer du bøter eller stopp i arbeidet.
                            </p>
                        </div>
                        
                        <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 text-lg"></p>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white relative">"Vi har ikke råd til å ansette en HMS-ansvarlig."</h2> 
                            <p>
                            For små og mellomstore bedrifter er det rett og slett ikke 
                            realistisk å ha noen på fulltid til å håndtere HMS.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-5 mt-10">
                    <h2 className="text-gray-700 dark:text-gray-300 text-2xl font-semibold">
                    InnUt.io gjør det enkelt for deg.
                    Vi har laget en løsning som tar hånd om HMS-arbeidet, slik at du kan fokusere på det som virkelig betyr noe – å drive virksomheten din.
                    </h2>
                </div>
            </div>
        </section>
    )
}

export default SalgPains;
