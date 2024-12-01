'use client'
import RisikoVurdering from "@/components/RisikoVurdering"
import AvviksSkjema from "@/components/AvviksSkjema"
import EndringsSkjema from "@/components/EndringsSkjema"
import SjaSkjema from "@/components/sjaSkjema"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import React, { useState, useEffect } from 'react'
import { uploadHMSHandbok, uploadDocument, getHMSDocuments, deleteDocument, deleteHMSHandbok } from "@/actions/hms"
import { Trash2, Menu, X, FileText, AlertTriangle, PenLine, Shield, BookOpen, Upload } from 'lucide-react'
import { User } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Oppdater interface for dokumenttypen
interface HMSDocument {
    id: string;
    name: string;
    url: string;
    version: number;
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}


const NavItem = ({ icon, label, onClick, active }: NavItemProps) => (
  <Button
    variant={active ? "secondary" : "ghost"}
    className={cn(
      "w-full justify-start gap-2",
      active && "bg-muted"
    )}
    onClick={onClick}
  >
    {icon}
    {label}
  </Button>
)

const HMSContent = ({ currentUser }: { currentUser: User }) => {
    const [activeForm, setActiveForm] = useState<string | null>(null)
    const [_showPdf, setShowPdf] = useState<boolean>(false)
    const [menuOpen, setMenuOpen] = useState<boolean>(false)
    const [uploadedDocs, setUploadedDocs] = useState<HMSDocument[]>([])
    const [_selectedPdf, _setSelectedPdf] = useState<string | null>(null)
    const [_hmsHandbookUploaded, setHmsHandbookUploaded] = useState<{ url: string; version: number } | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
    useEffect(() => {
        async function fetchDocuments() {
            try {
                const documents = await getHMSDocuments()
                console.log('Mottatte dokumenter:', documents) // For debugging
                if (documents.length > 0) {
                    const hmsHandbok = documents[0]
                    setUploadedDocs([{
                        id: hmsHandbok.id,
                        name: "HMS Håndbok",
                        url: hmsHandbok.url,
                        version: hmsHandbok.version
                    }])
                }
            } catch (error) {
                console.error('Feil ved henting av dokumenter:', error)
            }
        }
        fetchDocuments()
    }, [])

    const _handleNavClick = (formName: string) => {
      setActiveForm(formName)
      setShowPdf(false)
      setMenuOpen(false)
    }
  
    const _handlePdfClick = () => {
      setActiveForm(null)
      setShowPdf(true)
      setMenuOpen(false)
    }
  
    const _toggleMenu = () => {
      setMenuOpen(!menuOpen)
    }
  
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const formData = new FormData()
            formData.append("file", file)
            const isHmsHandbook = event.target.id === "hmsHandbookUpload"
            try {
                if (isHmsHandbook) {
                    const response = await uploadHMSHandbok(formData)
                    // Oppdater dokumentlisten etter opplasting
                    const updatedDocs = await getHMSDocuments()
                    setUploadedDocs(updatedDocs)
                } else {
                    const fileName = prompt("Gi dokumentet et navn:", file.name)
                    if (fileName) {
                        formData.append("name", fileName)
                        const { id, url } = await uploadDocument(formData)
                        setUploadedDocs(prev => [...prev, { id, name: fileName, url, version: 1 }])
                    }
                }
            } catch (error) {
                console.error("Feil ved opplasting:", error)
                alert("Det oppstod en feil ved opplasting av filen")
            }
        }
    }
  
    const handleDownloadHMSHandbok = () => {
        const hmsHandbok = uploadedDocs.find(doc => doc.name === "HMS Håndbok");
        if (hmsHandbok?.url) {
            window.open(hmsHandbok.url, '_blank', 'noopener,noreferrer');
        }
    }

    const handleDeleteDocument = async (documentId: string, documentName: string) => {
      if (confirm(`Er du sikker på at du vil slette dokumentet "${documentName}"?`)) {
        setIsDeleting(documentId)
        try {
          if (documentName === "HMS Håndbok") {
            try {
              await deleteHMSHandbok()
              setHmsHandbookUploaded(null) // Endret fra false til null for å matche state-typen
              setUploadedDocs(prev => prev.filter(doc => doc.name !== "HMS Håndbok"))
            } catch (error) {
              // Mer spesifikk feilhåndtering
              if (error.message === "HMS Håndbok ikke funnet") {
                // Hvis dokumentet allerede er slettet, oppdaterer vi bare UI
                setHmsHandbookUploaded(null)
                setUploadedDocs(prev => prev.filter(doc => doc.name !== "HMS Håndbok"))
              } else {
                throw error // Kast andre feil videre
              }
            }
          } else {
            await deleteDocument(documentId)
            setUploadedDocs(prev => prev.filter(doc => doc.id !== documentId))
          }
        } catch (error) {
          console.error("Feil ved sletting av dokument:", error)
          alert("Det oppstod en feil ved sletting av dokumentet. Vennligst prøv igjen.")
        } finally {
          setIsDeleting(null)
        }
      }
    }
  
    const _toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }
  
    const navigationItems = [
      {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: "Avviksskjema",
        id: "AvviksSkjema"
      },
      {
        icon: <Shield className="h-4 w-4" />,
        label: "SJA skjema",
        id: "SJA skjema"
      },
      {
        icon: <PenLine className="h-4 w-4" />,
        label: "Endringsskjema",
        id: "EndringsSkjema"
      },
      {
        icon: <FileText className="h-4 w-4" />,
        label: "Risikoskjema",
        id: "Risikoskjema"
      }
    ]

    // Definer hvilke roller som kan redigere/slette
    const canEdit = currentUser.role === "ADMIN" || currentUser.role === "LEDER"
  
    // Definer hvilke roller som kan se skjemaer
    const canViewForms = currentUser.role === "ADMIN" || 
                        currentUser.role === "LEDER" || 
                        currentUser.role === "USER" ||
                        currentUser.role === "PROSJEKTLEDER"

    const NavigationContent = () => (
      <div className="space-y-4 py-4">
        {canViewForms && (
          <>
            <div className="px-3 py-2">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setActiveForm(item.id)}
                    active={activeForm === item.id}
                  />
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            HMS Dokumentasjon
          </h2>
          <div className="space-y-1">
            {uploadedDocs.map(doc => (
              doc.name === "HMS Håndbok" && (
                <div key={doc.id} className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleDownloadHMSHandbok}
                  >
                    <BookOpen className="h-4 w-4" />
                    HMS Håndbok (v{doc.version})
                  </Button>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      disabled={isDeleting === doc.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            ))}
            {canEdit && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => document.getElementById('hmsHandbookUpload')?.click()}
              >
                <Upload className="h-4 w-4" />
                Last opp HMS Håndbok
              </Button>
            )}
          </div>
        </div>
      </div>
    )

    const fileInputs = (
      <>
        <input
          type="file"
          id="hmsHandbookUpload"
          className="hidden"
          accept=".pdf"
          onChange={handleFileUpload}
        />
      </>
    )

    return (
      <div className="flex h-[calc(100vh-64px)]">
        {fileInputs}
        <aside className="hidden md:flex w-64 flex-col border-r bg-background">
          <ScrollArea className="flex-1">
            <NavigationContent />
          </ScrollArea>
        </aside>

        {/* Mobile/Tablet Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed left-4 top-20 z-40"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>HMS Navigasjon</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <NavigationContent />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeForm ? (
            <>
              {activeForm === 'AvviksSkjema' && <AvviksSkjema />}
              {activeForm === 'EndringsSkjema' && <EndringsSkjema />}
              {activeForm === 'SJA skjema' && <SjaSkjema />}
              {activeForm === 'Risikoskjema' && canEdit && <RisikoVurdering />}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold">HMS Dokumentasjon</h2>
                <p className="text-muted-foreground">
                  Her finner du bedriftens HMS-håndbok og HMS-skjemaer.
                </p>
                {uploadedDocs.length > 0 ? (
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="mx-auto"
                      onClick={handleDownloadHMSHandbok}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Åpne HMS Håndbok
                    </Button>
                    {canViewForms && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Velg et skjema fra menyen til venstre for å komme i gang
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Ingen HMS-dokumenter er tilgjengelige for øyeblikket.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    )
}

export default HMSContent
