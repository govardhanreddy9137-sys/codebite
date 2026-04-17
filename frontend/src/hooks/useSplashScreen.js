import { useState, useEffect } from 'react';

export const useSplashScreen = (onFinish) => {
    const [isVisible, setIsVisible] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState('init');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                const newProgress = prev + Math.random() * 15;
                if (newProgress >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => {
                        setIsReady(true);
                        // Automatically call finish when ready
                        setTimeout(() => {
                            setIsVisible(false);
                            setTimeout(onFinish, 800);
                        }, 500);
                    }, 500);
                    return 100;
                }
                
                if (newProgress < 25) setCurrentStage('init');
                else if (newProgress < 50) setCurrentStage('loading');
                else if (newProgress < 75) setCurrentStage('preparing');
                else setCurrentStage('ready');
                
                return Math.min(newProgress, 100);
            });
        }, 150);

        return () => clearInterval(progressInterval);
    }, [onFinish]);

    const handleFinish = () => {
        setIsVisible(false);
        setTimeout(onFinish, 800);
    };

    return {
        isVisible,
        loadingProgress,
        currentStage,
        isReady,
        handleFinish
    };
};
