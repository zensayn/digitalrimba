"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { IconArrowLeft, IconDownload } from "@tabler/icons-react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

// Importing local JSON files
import filesAnimation from "@/public/files.json";
import downloadAnimation from "@/public/download.json";

export default function AboutPage() {
    const [hasMounted, setHasMounted] = useState(false);
    const filesLottieRef = useRef<LottieRefCurrentProps>(null);
    const downloadLottieRef = useRef<LottieRefCurrentProps>(null);
    const loadingLottieRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const playOnce = (ref: React.RefObject<LottieRefCurrentProps | null>) => {
        if (ref.current) {
            ref.current.goToAndPlay(0);
        }
    };

    const PDF_URL = "https://assets.qramu.com/borNEO%20HackWknd%20Hackathon%20Submission%20(1).pdf";

    return (
        <div className="relative min-h-screen bg-white text-[#101828] font-sans flex flex-col pt-24 pb-12">
            <Navbar />

            <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col h-full mt-8">
                {/* Header & Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 w-full">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4 group"
                        >
                            <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>

                        <div
                            className="flex items-center gap-3 cursor-default"
                            onMouseEnter={() => playOnce(filesLottieRef)}
                        >
                            <div className="w-12 h-12">
                                <Lottie
                                    lottieRef={filesLottieRef}
                                    animationData={filesAnimation}
                                    loop={false}
                                    autoplay={true}
                                />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900">
                                About Culbi
                            </h1>
                        </div>

                        <p className="text-gray-500 mt-2 text-lg">
                            Read the manifesto and architecture details about our gamified travel ecosystem.
                        </p>
                    </div>

                    <a
                        href={PDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        download="Culbi-Manifesto.pdf"
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm"
                    >
                        <IconDownload className="w-4 h-4 text-gray-500" />
                        Download PDF
                    </a>
                </div>

                {/* PDF Reader Container */}
                <div className="w-full flex-1 min-h-[75vh] bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden relative fade-up flex flex-col mb-12">

                    {!hasMounted ? (
                        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 mb-4">
                                <Lottie
                                    lottieRef={loadingLottieRef}
                                    animationData={filesAnimation}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                            <p className="text-gray-500 font-medium">Preparing reader...</p>
                        </div>
                    ) : (
                        <iframe
                            src={`${PDF_URL}#toolbar=1`}
                            className="w-full h-full z-10 flex-1 min-h-[75vh] border-none"
                            title="Culbi Manifesto PDF"
                        >
                            Your browser does not support iframes. Please download the PDF to view it.
                        </iframe>
                    )}
                </div>

                {/* Video Presentation Container */}
                <div className="w-full flex flex-col pb-12">
                    <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-900 mb-6 flex items-center gap-3">
                        Project Presentation Video
                    </h2>
                    <div className="w-full aspect-video bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden relative fade-up flex flex-col">
                        {!hasMounted ? (
                            <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center">
                                <p className="text-gray-500 font-medium">Loading video...</p>
                            </div>
                        ) : (
                            <iframe
                                src="https://drive.google.com/file/d/1r6q6-PUKH6X31_BPxbcYmFNNnyVAmsvQ/preview"
                                className="w-full h-full border-none"
                                allow="autoplay; fullscreen"
                                title="Culbi Presentation Video"
                            ></iframe>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}