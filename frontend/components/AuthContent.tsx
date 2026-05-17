"use client";
import Image from "next/image";
import Link from "next/link";

export default function AuthContent() {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[100vh] px-6 text-center pt-24">
            <div className="fade-up flex flex-col items-center gap-6 mb-8">
                <div className="flex items-center justify-center gap-4">
                    <Image
                        src="/icon_2.png"
                        alt="Culbi Logo"
                        width={69}
                        height={69}
                        priority
                    />
                    <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900">
                        Culbi
                    </h1>
                </div>
            </div>

            <div className="fade-up delay-1 space-y-6 max-w-2xl">
                <h2 className="text-4xl md:text-5xl lg:text-[56px] font-normal tracking-tight text-gray-900 leading-[1.1] mb-6">
                    Email verified. <br /> Mission ready 😼
                </h2>

                <p className="text-base md:text-lg text-gray-500 leading-relaxed font-normal">
                    You could go back to the app.{" "}
                </p>
            </div>
        </div>
    );
}