"use client";

import { motion } from "motion/react";
import { IconChartBar, IconRefresh, IconUserShield } from "@tabler/icons-react";

const BENEFITS = [
  {
    title: "Yield Optimization",
    description: "Our proprietary algorithms scan the ecosystem for the highest risk-adjusted returns in real-time.",
    icon: IconChartBar
  },
  {
    title: "Instant Liquidity",
    description: "Exit positions instantly without waiting for epoch transitions or cooling-off periods.",
    icon: IconRefresh
  },
  {
    title: "Governance Guard",
    description: "Your assets are protected by a decentralized multi-sig architecture with institutional oversight.",
    icon: IconUserShield
  }
];

export default function BenefitSection() {
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="relative w-full bg-background py-32 px-6 md:px-10 border-t border-black/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: index * 0.1, ease }}
              className="flex flex-col gap-6"
            >
              <div className="w-12 h-12 bg-brand-primary text-white flex items-center justify-center rounded-none shadow-lg">
                <benefit.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-normal tracking-tighter mb-4 text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-foreground/50 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
