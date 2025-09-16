import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  trialStartTime: number;
  onActivateLicense: () => void;
}

export default function TrialBanner({ trialStartTime, onActivateLicense }: TrialBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(60);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - trialStartTime) / 1000);
      const remaining = 60 - elapsed;
      setTimeRemaining(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [trialStartTime]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800" data-testid="trial-banner">
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Période d'essai active</strong> - Temps restant: {minutes}:{seconds.toString().padStart(2, '0')}
          <br />
          <span className="text-sm">Activez votre licence pour continuer à utiliser l'application.</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onActivateLicense}
          className="ml-4 border-amber-400 text-amber-800 hover:bg-amber-100"
          data-testid="button-activate-early"
        >
          <Key className="w-4 h-4 mr-2" />
          Activer maintenant
        </Button>
      </AlertDescription>
    </Alert>
  );
}