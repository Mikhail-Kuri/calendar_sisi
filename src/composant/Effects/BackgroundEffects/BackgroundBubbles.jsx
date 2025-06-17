import React, { useMemo } from "react";

export function BackgroundBubbles() {
    const bubbleStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1,
    };

    const bubbles = useMemo(() => {
        const bubbleCount = 10;
        return Array.from({ length: bubbleCount }).map((_, i) => {
            const size = Math.random() * 100 + 40;
            const left = Math.random() * 100;
            const duration = Math.random() * 20 + 20;
            const delay = Math.random() * 10;

            return (
                <div key={i} style={{
                    position: 'absolute',
                    bottom: '-150px',
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: "rgba(184, 92, 158, 0.3)",
                    borderRadius: '50%',
                    animation: `rise ${duration}s ease-in infinite`,
                    animationDelay: `${delay}s`,
                    zIndex: -1,
                    pointerEvents: 'none'
                }} />
            );
        });
    }, []); // vide = exécuté une seule fois

    return (
        <div style={bubbleStyle}>
            {bubbles}
            <style>{`
                @keyframes rise {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-110vh) scale(1.2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
