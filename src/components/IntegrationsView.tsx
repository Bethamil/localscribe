import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Code2 } from "lucide-react";
import { Button } from "./ui/button";
import { SettingsPanel, SettingsPanelRow } from "./ui/SettingsSection";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import ApiKeysSection from "./ApiKeysSection";

export default function IntegrationsView() {
  const { t } = useTranslation();
  const [apiKeysDialogOpen, setApiKeysDialogOpen] = useState(false);

  return (
    <div className="max-w-lg mx-auto w-full px-6 py-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("integrations.title")}</h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Local API access runs entirely on this device and does not require an account.
        </p>
      </div>

      <SettingsPanel>
        <SettingsPanelRow>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/5 dark:bg-primary/10 flex items-center justify-center shrink-0">
              <Code2 className="h-4 w-4 text-primary/80" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{t("integrations.api.title")}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">
                {t("integrations.api.description")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setApiKeysDialogOpen(true)}>
              {t("integrations.api.manage")}
            </Button>
          </div>
        </SettingsPanelRow>
      </SettingsPanel>

      <Dialog open={apiKeysDialogOpen} onOpenChange={setApiKeysDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("integrations.api.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("apiKeysSection.description")}</DialogDescription>
          </DialogHeader>
          <ApiKeysSection />
        </DialogContent>
      </Dialog>
    </div>
  );
}
