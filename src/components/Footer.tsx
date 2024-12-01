import Link from "next/link"
import { KontaktDialog } from "./KontaktDialog"
 
const FooterItem = ({ text, link }: { text: string, link: string }) => {
return (
    <li>
        <Link href={link}>
            { text }
        </Link>
    </li>
)
}
 
const footerItems = [
{
    id: 1,
    text: "Term of services",
    link: "#"
},
{
    id: 2,
    text: "Om oss",
    link: "#om"
},
{
    id: 3,
    text: "Kontakt oss",
    link: "#"
},
]
 
 
const FooterBlock = () => {
return (
    <footer className="pt-2">
        <div className="px-2 sm:px-0">
            <div className="mx-auto w-full max-w-6xl bg-gray-900 dark:bg-blue-950 p-5 sm:p-10 py-10 sm:py-14 md:py-16 rounded-3xl relative overflow-hidden">
                <div className="relative flex flex-col items-center text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl text-white font-bold max-w-4xl"> La oss ta oss av HMS for deg. </h1>
                    <p className="text-base text-gray-300 max-w-xl mt-10"> Din partner for helhetlig HMS, prosjektstyring og risikovurdering. Trygghet og effektivitet i hvert steg. </p>
                    <div className="flex justify-center mt-10">
                        <KontaktDialog variant="default" className="bg-gray-200 text-black dark:bg-gray-900 size-lg hover:bg-green-800 transition-colors duration-300 hover:text-white font-semibold">
                            Kontakt oss
                        </KontaktDialog>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-900 pt-60 -mt-48 px-4 sm:px-10 md:px-12 lg:px-8">
            <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-y-5 py-3 border-t border-t-gray-300 dark:border-t-gray-700">
                <p className="text-gray-700 dark:text-gray-300">
                    ©  2024 InnUt.io - Alle rettigheter reservert
                </p>
                <nav>
                    <ul className="flex items-center gap-x-5 text-gray-800 dark:text-gray-200">
                        {
                            footerItems.map(footerItem=>(
                                <FooterItem key={footerItem.id} {...footerItem}/>
                            ))
                        }
                    </ul>
                </nav>
            </div>
        </div>
    </footer>
)
}
 
export default FooterBlock