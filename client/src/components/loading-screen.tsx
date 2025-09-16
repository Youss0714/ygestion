import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/lib/i18n";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);

  useEffect(() => {
    // Simulate loading progress over 10 seconds
    const totalDuration = 10000; // 10 seconds
    const intervalTime = 100; // Update every 100ms
    const totalSteps = totalDuration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const baseProgress = (currentStep / totalSteps) * 100;
      // Add some randomness for more natural feel
      const randomOffset = Math.random() * 3 - 1.5; // Random between -1.5 and 1.5
      const newProgress = Math.min(100, Math.max(0, baseProgress + randomOffset));
      
      setProgress(newProgress);

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
        setProgress(100);
        // Complete after showing 100% for a moment
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(onComplete, 500);
        }, 500);
      }
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50 transition-opacity duration-500 ${isComplete ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        {/* Ultra Professional Loading Animation */}
        <div className="mb-8 relative">
          {/* Central Hub */}
          <div className="w-32 h-32 mx-auto relative flex items-center justify-center">
            {/* Core Orb */}
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full shadow-2xl animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-bounce"></div>
              </div>
            </div>
            
            {/* Orbital Rings */}
            <div className="absolute inset-0 border-2 border-blue-300/40 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
            <div className="absolute inset-2 border border-indigo-400/30 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
            
            {/* Floating Data Points */}
            <div className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-lg animate-bounce" style={{ top: '10%', left: '15%', animationDelay: '0s', animationDuration: '2s' }}></div>
            <div className="absolute w-2 h-2 bg-indigo-500 rounded-full shadow-lg animate-bounce" style={{ top: '80%', right: '20%', animationDelay: '0.5s', animationDuration: '2.2s' }}></div>
            <div className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full shadow-lg animate-bounce" style={{ bottom: '15%', left: '25%', animationDelay: '1s', animationDuration: '1.8s' }}></div>
            <div className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg animate-bounce" style={{ top: '25%', right: '10%', animationDelay: '1.5s', animationDuration: '2.5s' }}></div>
          </div>
          
          {/* Outer Energy Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border border-blue-200/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 border border-indigo-200/15 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          </div>
          
          {/* Connecting Lines Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 relative">
              <div className="absolute top-0 left-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-0 left-1/2 w-0.5 h-8 bg-gradient-to-t from-indigo-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute left-0 top-1/2 h-0.5 w-8 bg-gradient-to-r from-purple-400 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute right-0 top-1/2 h-0.5 w-8 bg-gradient-to-l from-cyan-400 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-fade-in">
          YGestion
        </h1>
        <p className="text-lg text-gray-600 mb-8 animate-fade-in-delay">
          {settings?.language === 'en' ? 'Simplified business management' : 'Gestion d\'entreprise simplifiée'}
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {settings?.language === 'en' ? 'Loading...' : 'Chargement...'} {Math.floor(Math.min(progress, 100))}%
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center mt-6 space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>


    </div>
  );
}