import { Button } from "@/components/ui/button";
import { Moon, Sun, RotateCcw, Bell } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Actief
          </Badge>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Vernieuwen
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground relative"
          >
            <Bell className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></div>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-muted-foreground"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}