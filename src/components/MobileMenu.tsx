import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, History, MoreHorizontal, Palette, RefreshCw, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSearchModal } from "@/components/MobileSearchModal";
import { applySkin, getSavedSkin, skins, type SkinId } from "@/lib/skins";

const iconButton = "p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors";

// Phone header actions: search plus a "more" menu for everything the bottom bar doesn't hold.
const MobileMenu = ({ onPull }: { onPull: () => void }) => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [skin, setSkin] = useState<SkinId>(getSavedSkin);

  const chooseSkin = (id: string) => {
    applySkin(id as SkinId);
    setSkin(id as SkinId);
  };

  return (
    <>
      <button onClick={() => setSearchOpen(true)} className={iconButton} aria-label="Search">
        <Search className="w-4 h-4" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className={iconButton} aria-label="More">
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => navigate("/assets")}>
            <FolderOpen className="w-4 h-4 mr-2" /> Assets
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/history")}>
            <History className="w-4 h-4 mr-2" /> History
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onPull}>
            <RefreshCw className="w-4 h-4 mr-2" /> Pull signals
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="w-4 h-4 mr-2" /> Skin
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={skin} onValueChange={chooseSkin}>
                {skins.map((s) => (
                  <DropdownMenuRadioItem key={s.id} value={s.id}>
                    {s.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <MobileSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default MobileMenu;
