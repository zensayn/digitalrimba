"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AltArrowLeft, AltArrowRight, ClockCircle, CalendarAdd, CheckCircle } from "@solar-icons/react";
import { cn } from "@/lib/utils";
import { TextureButton } from "@/components/ui/texture-button";

const TIME_SLOTS = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];
const BOOKED_DATES = [12, 13, 14, 22, 28]; // Mock booked dates for May

export default function AvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const transition = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const };

  return (
    <section className="relative w-full bg-white py-12 text-black overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Header & Info */}
          <div className="space-y-8">
            <div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="font-poppins font-bold uppercase tracking-[0.1em] text-[10px] mb-4 block text-[#346739]"
              >
                Schedule Consultation
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-5xl font-poppins font-bold tracking-tight leading-tight mb-6"
              >
                Book your session with <br />our wedding experts.
              </motion.h2>
              <p className="font-poppins text-neutral-500 text-[15px] leading-relaxed max-w-md">
                Choose a time that works best for you. Our experts will help you navigate your timeline and ensure every detail is accounted for.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase text-[#346739]">
                <div className="size-2 bg-[#346739] rounded-full" />
                <span>Available Slot</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase text-neutral-300">
                <div className="size-2 bg-neutral-100 rounded-full" />
                <span>Fully Booked</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="bg-white ring-1 ring-foreground/5 p-8 rounded-[22px] shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-poppins font-bold tracking-tight text-black">May 2026</h3>
              <div className="flex gap-2">
                <button className="size-10 ring-1 ring-foreground/5 rounded-[8px] flex items-center justify-center hover:bg-neutral-50 transition-all active:scale-95">
                  <AltArrowLeft size={18} className="text-neutral-500" />
                </button>
                <button className="size-10 ring-1 ring-foreground/5 rounded-[8px] flex items-center justify-center hover:bg-neutral-50 transition-all active:scale-95">
                  <AltArrowRight size={18} className="text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 mb-10">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
                <div key={day} className="text-center text-[10px] font-bold uppercase text-neutral-400 pb-4">
                  {day}
                </div>
              ))}
              {days.map(day => {
                const isBooked = BOOKED_DATES.includes(day);
                const isSelected = selectedDate === day;

                return (
                  <button
                    key={day}
                    disabled={isBooked}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "h-14 flex flex-col items-center justify-center transition-all relative rounded-[8px] border-none group",
                      isBooked
                        ? "bg-neutral-50/50 text-neutral-300 cursor-not-allowed"
                        : isSelected
                          ? "bg-[#346739] text-white font-bold shadow-md"
                          : "bg-white ring-1 ring-foreground/5 text-neutral-600 hover:ring-[#346739]/30 hover:bg-neutral-50"
                    )}
                  >
                    <span className="text-sm font-poppins">{day}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="activeDate"
                        className="absolute inset-0 ring-2 ring-[#346739] rounded-[8px]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Time Slot Selection */}
            <AnimatePresence mode="wait">
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={transition}
                  className="space-y-8 pt-6 border-t border-neutral-100"
                >
                  <div className="flex items-center gap-2 text-neutral-400">
                    <ClockCircle size={16} />
                    <span className="text-[10px] font-bold uppercase font-poppins">Select Available Time</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TIME_SLOTS.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-3 px-4 transition-all rounded-[8px] font-poppins text-xs font-semibold",
                          selectedTime === time
                            ? "bg-[#346739] text-white"
                            : "bg-white ring-1 ring-foreground/5 text-neutral-500 hover:bg-neutral-50"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={transition}
                      className="pt-4"
                    >
                      <TextureButton
                        variant="primary"
                        className="w-full h-14 rounded-[32px] font-bold text-xs gap-3"
                      >
                        <CalendarAdd size={18} />
                        Confirm Schedule
                      </TextureButton>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
