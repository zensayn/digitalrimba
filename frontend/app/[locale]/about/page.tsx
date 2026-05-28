"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/routing";
import { IconArrowLeft, IconDownload } from "@tabler/icons-react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useTranslations } from "next-intl";

// Importing local JSON files
import filesAnimation from "@/public/files.json";

export default function AboutPage() {
    const [hasMounted, setHasMounted] = useState(false);
    const filesLottieRef = useRef<LottieRefCurrentProps>(null);
    const loadingLottieRef = useRef<LottieRefCurrentProps>(null);
    const t = useTranslations("About");

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
        <div className="relative min-h-screen bg-[#fbfbfb] text-[#212121] font-poppins flex flex-col pt-24 pb-12">
            <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col h-full mt-8">
                {/* Header & Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 w-full">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#616161] hover:text-[#212121] transition-colors mb-4 group"
                        >
                            <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            {t("backHome")}
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
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#212121] font-poppins">
                                {t("title")}
                            </h1>
                        </div>

                        <p className="text-[#616161] font-poppins mt-2 text-base md:text-lg font-light leading-relaxed max-w-[700px]">
                            {t("description")}
                        </p>
                    </div>

                    <a
                        href={PDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        download="Rimba-Digital-Manifesto.pdf"
                        className="flex items-center gap-2 bg-[#ffffff] hover:bg-[#eeece7] text-[#212121] border border-[#d9d9dd] px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm duration-200"
                    >
                        <IconDownload className="w-4 h-4 text-[#616161]" />
                        {t("downloadPdf")}
                    </a>
                </div>

                {/* PDF Reader Container */}
                <div className="w-full flex-1 min-h-[75vh] bg-[#ffffff] rounded-[22px] border border-[#d9d9dd] shadow-sm overflow-hidden relative fade-up flex flex-col mb-12">
                    {!hasMounted ? (
                        <div className="absolute inset-0 bg-[#fbfbfb] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 mb-4">
                                <Lottie
                                    lottieRef={loadingLottieRef}
                                    animationData={filesAnimation}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                            <p className="text-[#616161] font-poppins font-medium">{t("preparingReader")}</p>
                        </div>
                    ) : (
                        <iframe
                            src={`${PDF_URL}#toolbar=1`}
                            className="w-full h-full z-10 flex-1 min-h-[75vh] border-none"
                            title={t("pdfTitle")}
                        >
                            {t("iframeSupport")}
                        </iframe>
                    )}
                </div>

                {/* Video Presentation Container */}
                <div className="w-full flex flex-col pb-12">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#212121] font-poppins mb-6 flex items-center gap-3">
                        {t("videoTitle")}
                    </h2>
                    <div className="w-full aspect-video bg-[#ffffff] rounded-[22px] border border-[#d9d9dd] shadow-sm overflow-hidden relative fade-up flex flex-col">
                        {!hasMounted ? (
                            <div className="absolute inset-0 bg-[#fbfbfb] flex flex-col items-center justify-center">
                                <p className="text-[#616161] font-poppins font-medium">{t("loadingVideo")}</p>
                            </div>
                        ) : (
                            <iframe
                                src="https://drive.google.com/file/d/1r6q6-PUKH6X31_BPxbcYmFNNnyVAmsvQ/preview"
                                className="w-full h-full border-none"
                                allow="autoplay; fullscreen"
                                title={t("videoTitle")}
                            ></iframe>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}