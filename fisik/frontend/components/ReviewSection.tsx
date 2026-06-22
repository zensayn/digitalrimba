"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const REVIEW_COUNT = 9;

export default function ReviewSection() {
  const t = useTranslations("Reviews");

  // Build the testimonial list from the i18n catalog (r1…r9). Keeping the keys
  // numbered lets translators edit copy without touching this component.
  const testimonials: Testimonial[] = Array.from(
    { length: REVIEW_COUNT },
    (_, i) => {
      const n = i + 1;
      return {
        quote: t(`r${n}Content`),
        name: t(`r${n}Author`),
        role: t(`r${n}Role`),
      };
    }
  );

  // Duplicate items so each column has enough height for a seamless loop restart.
  const firstColumn = [...testimonials.slice(0, 3), ...testimonials.slice(0, 3)];
  const secondColumn = [...testimonials.slice(3, 6), ...testimonials.slice(3, 6)];
  const thirdColumn = [...testimonials.slice(6, 9), ...testimonials.slice(6, 9)];

  return (
    <section className="relative py-24 bg-white">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4">
          <div className="flex justify-center">
          </div>

          <h2 className="font-poppins font-medium text-3xl tracking-tight text-[#212121] lg:text-4xl text-center">
            {t("title")}
          </h2>
          <p className="text-center text-muted-foreground text-sm font-poppins">
            {t("subtitle")}
          </p>
        </div>

        <div
          className={cn(
            "mt-10 max-h-[640px] overflow-hidden relative",
            "mask-[linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full w-full">
            <InfiniteSlider
              direction="vertical"
              speed={30}
              speedOnHover={15}
              gap={24}
              className="h-full w-full flex justify-center"
            >
              {firstColumn.map((testimonial, idx) => (
                <TestimonialsCard
                  key={`${testimonial.name}-${idx}`}
                  testimonial={testimonial}
                  className="w-full max-w-[360px]"
                />
              ))}
            </InfiniteSlider>
            <InfiniteSlider
              className="hidden md:flex h-full w-full justify-center"
              direction="vertical"
              speed={50}
              speedOnHover={25}
              gap={24}
            >
              {secondColumn.map((testimonial, idx) => (
                <TestimonialsCard
                  key={`${testimonial.name}-${idx}`}
                  testimonial={testimonial}
                  className="w-full max-w-[360px]"
                />
              ))}
            </InfiniteSlider>
            <InfiniteSlider
              className="hidden lg:flex h-full w-full justify-center"
              direction="vertical"
              speed={35}
              speedOnHover={17}
              gap={24}
            >
              {thirdColumn.map((testimonial, idx) => (
                <TestimonialsCard
                  key={`${testimonial.name}-${idx}`}
                  testimonial={testimonial}
                  className="w-full max-w-[360px]"
                />
              ))}
            </InfiniteSlider>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  testimonial: Testimonial;
}) {
  const { quote, name, role } = testimonial;
  return (
    <figure
      className={cn(
        "w-full rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#346739]/30",
        className
      )}
      {...props}
    >
      <blockquote className="font-poppins text-[15px] leading-relaxed text-[#212121]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-2">
        <Avatar className="size-8 rounded-full border border-[#e5e7eb]">
          <AvatarFallback className="font-poppins text-xs font-medium bg-[#eeece7] text-[#212121]">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <cite className="font-medium not-italic leading-none text-[#212121] font-poppins text-[14px]">
            {name}
          </cite>
          <span className="text-[#93939f] font-poppins text-[12px] mt-1.5 leading-none">
            {role}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
