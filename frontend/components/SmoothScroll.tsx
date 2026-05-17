"use client";
import ReactLenis from 'lenis/react'
import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { usePathname } from 'next/navigation';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAboutPage = pathname === '/about';

    useEffect(() => {
        if (isAboutPage) return;

        let ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                snap: {
                    // 1. snapTo: [0, 1] ensures it snaps to the start or very end
                    snapTo: [0, 1],
                    // 2. Increased delay: This makes the snap feel "further away." 
                    // The user scrolls more before the snap activates.
                    delay: 0.5,
                    // 3. Duration: A slightly longer duration makes the transition feel more substantial
                    duration: { min: 1, max: 2 },
                    ease: "expo.inOut" // A more dramatic "liftoff" style curve
                }
            });
        });
        return () => ctx.revert();
    }, [isAboutPage]);

    if (isAboutPage) {
        return <>{children}</>;
    }

    return (
        <ReactLenis root options={{
            lerp: 0.06, // Slightly lower lerp for a heavier, more premium feel
            duration: 1.5,
            smoothWheel: true
        }}>
            {children}
        </ReactLenis>
    )
}