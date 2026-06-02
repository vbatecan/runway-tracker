import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencySelector } from "@/components/CurrencySelector";
import { DataExport } from "@/components/DataExport";
import type { AppData, SupportedCurrency } from "@/types";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsViewProps {
  data: AppData;
  onCurrencyChange: (currency: SupportedCurrency) => void;
  onThemeChange: (theme: "light" | "dark") => void;
  onImportData: (data: AppData) => void;
}

export default function SettingsView({
  data,
  onCurrencyChange,
  onThemeChange,
  onImportData,
}: SettingsViewProps) {
  const isDark = data.settings?.theme === "dark";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onThemeChange(isDark ? "light" : "dark")}
              className="gap-2"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? "Light" : "Dark"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencySelector
            value={data.settings?.currency || "PHP"}
            onChange={onCurrencyChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data</CardTitle>
        </CardHeader>
        <CardContent>
          <DataExport data={data} onImport={onImportData} />
        </CardContent>
      </Card>
    </div>
  );
}