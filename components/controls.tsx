import { SoundToggle } from "@/components/sound-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

// The site's two icon buttons, kept together so every page places them as
// one unit.
export function Controls() {
  return (
    <div className="flex items-center gap-3">
      <SoundToggle />
      <ThemeToggle />
    </div>
  );
}
