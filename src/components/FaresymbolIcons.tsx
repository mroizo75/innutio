import { 
    Flame, 
    Skull, 
    AlertTriangle, 
    Droplets, 
    Leaf, 
    Atom, 
    Bomb,
    Cylinder 
  } from "lucide-react";
  
  const symbolMap = {
    BRANNFARLIG: Flame,
    ETSENDE: Droplets,
    GIFTIG: Skull,
    HELSEFARE: AlertTriangle,
    MILJOFARE: Leaf,
    OKSIDERENDE: Atom,
    EKSPLOSJONSFARLIG: Bomb,
    GASS_UNDER_TRYKK: Cylinder,
  };
  
  interface FaresymbolIconsProps {
    symbols: string[] | undefined;
  }
  
  export function FaresymbolIcons({ symbols }: FaresymbolIconsProps) {
    if (!symbols || symbols.length === 0) {
      return null;
    }
    
    return (
      <div className="flex gap-2">
        {symbols.map((symbol) => {
          const Icon = symbolMap[symbol as keyof typeof symbolMap];
          return Icon ? (
            <div
              key={symbol}
              className="tooltip"
              data-tip={symbol.toLowerCase()}
            >
              <Icon className="w-5 h-5" />
            </div>
          ) : null;
        })}
      </div>
    );
  }
