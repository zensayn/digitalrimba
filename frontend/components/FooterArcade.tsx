"use client";

import { useState, useEffect, useRef } from "react";

export default function FooterArcade() {
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [dotPos, setDotPos] = useState({ top: "50%", left: "50%" });
    const [timeLeft, setTimeLeft] = useState(15);

    // 1. The Timer Effect: Starts once when gameActive is true
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (gameActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [gameActive]); // Only re-run if game starts/stops

    // 2. The Game Over Effect: Watches the clock
    useEffect(() => {
        if (timeLeft === 0 && gameActive) {
            setGameActive(false);
            if (score > highScore) setHighScore(score);
        }
    }, [timeLeft, gameActive, score, highScore]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(15);
        setGameActive(true);
        moveDot();
    };

    const moveDot = () => {
        const top = Math.floor(Math.random() * 60 + 20) + "%";
        const left = Math.floor(Math.random() * 60 + 20) + "%";
        setDotPos({ top, left });
    };

    const handleDotClick = () => {
        if (!gameActive) return;
        setScore((prev) => prev + 1);
        moveDot();
    };

    return (
        <div className="flex flex-col items-center w-full mt-4 flex-grow max-w-[400px] select-none">
            {/* Stats Header */}
            <div className="flex justify-between w-full mb-2 px-1 font-mono text-[10px] uppercase  text-gray-400">
                <span>Time: {timeLeft}s</span>
                <span>High: {highScore}</span>
            </div>

            {/* Arcade Screen */}
            <div className="relative w-full aspect-square bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden shadow-inner">
                {!gameActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-30">
                        <h3 className="text-xl font-black mb-4 tracking-tighter text-gray-900">CULBI POP</h3>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-black text-white rounded-full font-bold text-xs active:scale-95 transition-transform"
                        >
                            {timeLeft === 0 ? "PLAY AGAIN" : "START ARCADE"}
                        </button>
                        {timeLeft === 0 && (
                            <div className="text-center mt-4">
                                <p className="font-mono text-xs text-gray-900">SCORE: {score}</p>
                                {score >= highScore && score > 0 && (
                                    <p className="text-[10px] font-bold text-orange-500 mt-1">NEW HIGH SCORE!</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="absolute top-4 left-6 font-black text-5xl opacity-5 pointer-events-none text-gray-900">
                        {score}
                    </div>
                )}

                {/* Target Dot */}
                <button
                    onClick={handleDotClick}
                    disabled={!gameActive}
                    className={`absolute w-14 h-14 rounded-full transition-all duration-75 active:scale-125 shadow-xl
                        ${gameActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
                    style={{
                        top: dotPos.top,
                        left: dotPos.left,
                        transform: "translate(-50%, -50%)",
                        background: "radial-gradient(circle at 30% 30%, #444, #000)",
                    }}
                />
            </div>
        </div>
    );
}