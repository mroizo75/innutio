import Image from "next/image"
 
const ContentSection = () => {
return (
    <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5 flex flex-col md:flex-row gap-16">
            <div className="flex md:flex-1">
                <Image src="/images/working-on-housing-project.jpg" alt="working on housing" width={1300} height={900} className="w-full md:h-full object-cover rounded-lg" />
            </div>
            <div className="md:w-1/2 lg:w-[54%] space-y-12 text-gray-700 dark:text-gray-300">
                <h1 className="text-gray-900 dark:text-white font-semibold text-2xl sm:text-3xl md:text-4xl">
                Effektiv HMS- og Prosjektstyring
                </h1>
                    <p>
                    InnUt.io er din partner for helhetlig HMS- og prosjektstyring. 
                    Vi tilbyr et brukervennlig system som dekker alle behov for helse, 
                    miljø og sikkerhet, inkludert risikovurderinger, Sikker Jobb Analyse 
                    (SJA), endringsskjema og rapportering. Med vår omfattende løsning får du 
                    verktøy for å håndtere timeregistrering, prosjektoppfølging og rapportering 
                    på en enkel og effektiv måte.
                    <br className="mb-4" />
                    Vi er mer enn bare en programvare – vårt team består av erfarne 
                    konsulenter som leder vernerunder, utfører risikovurderinger for 
                    komplekse kjemiske prosesser som diisocyanater, og bistår med 
                    utforming av komplette HMS-håndbøker tilpasset din bedrift. 
                    Vi kan også ta rollen som din HMS-rådgiver, slik at du kan 
                    fokusere på det du gjør best.

                    I tillegg tilbyr vi et dedikert stoffkartotek-system som hjelper 
                    deg å administrere og dokumentere kjemikalier på en trygg og 
                    effektiv måte, og sørger for at du alltid er i samsvar med 
                    gjeldende regelverk.
                    </p>
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-6 p-4 rounded-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
                        <span className="rounded-full bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 w-max p-3 flex">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              strokeWidth="1.5" 
                              stroke="currentColor" 
                              className="w-6 h-6"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" 
                              />
                            </svg>
                        </span>
                        <h2 className="font-semibold text-xl text-gray-900 dark:text-white">Vår missjon</h2>
                        <p>
                        Vår misjon er å skape tryggere, mer effektive og produktive arbeidsplasser 
                        ved å tilby helhetlige løsninger for HMS, prosjektstyring og risikovurdering. Vi jobber for å forenkle komplekse prosesser, sikre etterlevelse av regelverk, og styrke virksomheters evne til å håndtere helse, miljø og sikkerhet på en profesjonell og brukervennlig måte.
                        </p>
                    </div>
                    <div className="space-y-6 p-4 rounded-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
                        <span className="rounded-full bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 w-max p-3 flex">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              strokeWidth="1.5" 
                              stroke="currentColor" 
                              className="w-6 h-6"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" 
                              />
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                              />
                            </svg>
                        </span>
                        <h2 className="font-semibold text-xl text-gray-900 dark:text-white">Vår visjon</h2>
                        <p>
                        Vår visjon er å være den ledende plattformen for HMS og 
                        prosjektstyring, kjent for å levere innovative og tilpassede 
                        løsninger som hjelper virksomheter å vokse trygt og bærekraftig. Vi ønsker å sette en ny standard for hvordan HMS blir håndtert og styrt, med fokus på digitalisering, ekspertise og kvalitet.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
)
}
 
export default ContentSection