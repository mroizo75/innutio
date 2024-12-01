import { FareSymbol } from "@prisma/client"
import { 
  Flame, 
  Skull, 
  Heart, 
  Leaf, 
  Atom, 
  Bomb, 
  Cylinder,
  AlertTriangle 
} from "lucide-react"

interface FareSymbolIconProps {
  symbol: FareSymbol
  className?: string
}

export function FareSymbolIcon({ symbol, className = "w-5 h-5" }: FareSymbolIconProps) {
  const getIcon = (symbol: FareSymbol) => {
    switch (symbol) {
      case "EKSPLOSJONSFARLIG":
        return <Bomb className={className} />
      case "BRANNFARLIG":
        return <Flame className={className} />
      case "OKSIDERENDE":
        return <Atom className={className} />
      case "GASS_UNDER_TRYKK":
        return <Cylinder className={className} />
      case "ETSENDE":
        return <AlertTriangle className={className} />
      case "GIFTIG":
        return <Skull className={className} />
      case "HELSEFARE":
        return <Heart className={className} />
      case "MILJOFARE":
        return <Leaf className={className} />
      default:
        return null
    }
  }

  const icon = getIcon(symbol)
  if (!icon) return null

  return (
    <div title={symbol.replace('_', ' ').toLowerCase()}>
      {icon}
    </div>
  )
}