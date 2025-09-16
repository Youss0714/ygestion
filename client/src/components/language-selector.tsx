import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Check } from "lucide-react";
import { languages } from "@/lib/i18n";

interface LanguageSelectorProps {
  onLanguageSelect: (language: "fr" | "en") => void;
}

export default function LanguageSelector({ onLanguageSelect }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<"fr" | "en">("fr");

  const handleConfirm = () => {
    onLanguageSelect(selectedLanguage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="text-white text-2xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              YGestion
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {selectedLanguage === 'fr' 
                ? 'Choisissez votre langue préférée' 
                : 'Choose your preferred language'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                {selectedLanguage === 'fr' ? 'Langue' : 'Language'}
              </label>
              <Select value={selectedLanguage} onValueChange={(value: "fr" | "en") => setSelectedLanguage(value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.value === 'fr' ? '🇫🇷' : '🇺🇸'}</span>
                        <span>{language.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {selectedLanguage === 'fr' 
                  ? 'Cette langue sera utilisée pour toute l\'interface de l\'application. Vous pourrez la modifier plus tard dans les paramètres.'
                  : 'This language will be used for the entire application interface. You can change it later in the settings.'
                }
              </p>
            </div>

            <Button 
              onClick={handleConfirm}
              className="w-full h-12 text-lg font-medium"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              {selectedLanguage === 'fr' ? 'Continuer' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}