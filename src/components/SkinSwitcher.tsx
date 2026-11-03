import { useState } from "react";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applySkin, getSavedSkin, skins, type SkinId } from "@/lib/skins";

const SkinSwitcher = () => {
  const [skin, setSkin] = useState<SkinId>(getSavedSkin);

  const choose = (id: string) => {
    applySkin(id as SkinId);
    setSkin(id as SkinId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        title="Switch skin"
      >
        <Palette className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Skin</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={skin} onValueChange={choose}>
          {skins.map((s) => (
            <DropdownMenuRadioItem key={s.id} value={s.id}>
              {s.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SkinSwitcher;
