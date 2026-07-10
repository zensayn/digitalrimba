"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  CutoutCard,
  CutoutCardContent,
  CutoutCardImage,
  CutoutCardInsetLabel,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCorner,
  cutoutCardSurfaceClassName,
  useCutoutContentStaggerVariants,
} from "@/components/ui/cutout-card"
import { cn } from "@/lib/utils"
import { TextureButton } from "@/components/ui/texture-button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Magnifer, Widget4, List } from "@solar-icons/react"

export type Template = {
  id: string
  name: string
  description: string
  image: string
  category: string
  theme: string
  demoUrl: string
}

// Real themes from the invitation/ workspace, deployed as Cloudflare Workers.
export const templates: Template[] = [
  {
    id: "warm-narrative",
    name: "Warm Narrative",
    description: "Warm parchment aesthetic with layered sakura parallax and serif storytelling. Kenangan series.",
    image: "/templates/warm-narrative.jpg",
    category: "Adat",
    theme: "Kenangan",
    // Local dev: point at a `wrangler dev` serve of the theme (e.g. http://localhost:8787).
    demoUrl: process.env.NEXT_PUBLIC_WARM_NARRATIVE_URL ?? "https://warm-narrative.rimba.io",
  },
  {
    id: "soft-bloom",
    name: "Soft Bloom",
    description: "Soft wildflower botanicals on textured paper with a gated opening. Kenangan series.",
    image: "/templates/soft-bloom.jpg",
    category: "Floral",
    theme: "Kenangan",
    demoUrl: process.env.NEXT_PUBLIC_SOFT_BLOOM_URL ?? "https://soft-bloom.rimba.io",
  },
]

type TemplateSelectorProps = {
  onSelect: (template: Template) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const stagger = useCutoutContentStaggerVariants()
  const shouldReduceMotion = useReducedMotion()

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const transition = {
    duration: 0.5,
    ease: [0.32, 0.72, 0, 1] as const // ease-drawer
  }

  const viewVariants = {
    initial: { opacity: 0, y: 20, filter: "blur(10px)", scale: 0.96 },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
    exit: { opacity: 0, y: -20, filter: "blur(10px)", scale: 0.96 }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-poppins text-3xl font-bold tracking-tight text-black">Choose your template</h2>
            {searchQuery && (
              <span className="px-2 py-1 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-500 uppercase">
                {filteredTemplates.length} Results
              </span>
            )}
          </div>
          <p className="font-poppins text-neutral-500">Select a design starting point for your wedding invitation.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Magnifer className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 size-4" />
            <Input
              placeholder="Search templates..."
              className="pl-9 h-11 rounded-[24px] bg-white ring-1 ring-foreground/5 border-none focus-visible:ring-foreground/10 transition-all font-poppins text-[13px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex bg-neutral-100 p-1 rounded-[16px] ring-1 ring-foreground/5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-[8px] transition-all",
                viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <Widget4 size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-2 rounded-[8px] transition-all",
                viewMode === "table" ? "bg-white shadow-sm text-black" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CutoutCard className={cn(cutoutCardSurfaceClassName, "h-full flex flex-col border-none ring-1 ring-foreground/10 transition-all duration-300 rounded-[22px] bg-white")}>
                  <CutoutCardMedia className="h-64 shrink-0">
                    <CutoutCardImage
                      alt={template.name}
                      src={template.image}
                    />
                    <CutoutCardOverlay />
                    <CutoutCardInsetLabel className="bottom-0 left-0 rounded-tr-[22px] bg-white px-5 py-3">
                      <span className="font-poppins font-semibold text-[10px] text-neutral-400 uppercase ">
                        {template.category}
                      </span>
                      <CutoutCorner className="absolute -right-[31px] -bottom-px rotate-90 text-white" />
                      <CutoutCorner className="absolute -top-[31px] -left-px rotate-90 text-white" />
                    </CutoutCardInsetLabel>
                  </CutoutCardMedia>
                  <CutoutCardContent className="flex flex-col flex-1">
                    <motion.div
                      animate="show"
                      className="flex-1"
                      initial="hidden"
                      variants={stagger.container}
                    >
                      <motion.h3
                        className="font-poppins mb-2 font-bold text-black text-xl tracking-tight"
                        variants={stagger.item}
                      >
                        {template.name}
                      </motion.h3>
                      <motion.p
                        className="font-poppins text-neutral-500 text-sm leading-relaxed mb-6"
                        variants={stagger.item}
                      >
                        {template.description}
                      </motion.p>
                    </motion.div>

                    <motion.div variants={stagger.item} className="pt-2 mt-auto">
                      <div className="grid grid-cols-2 gap-3">
                        <TextureButton
                          variant="secondary"
                          className="w-full h-11 rounded-[32px] text-[11px] font-semibold"
                          onClick={() => window.open(template.demoUrl, "_blank", "noopener")}
                        >
                          Preview
                        </TextureButton>
                        <TextureButton
                          variant="primary"
                          className="w-full h-11 rounded-[32px] text-[11px] font-semibold"
                          onClick={() => onSelect(template)}
                        >
                          Use Design
                        </TextureButton>
                      </div>
                    </motion.div>
                  </CutoutCardContent>
                </CutoutCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="bg-white rounded-[22px] ring-1 ring-foreground/5 p-4 overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[100px] text-[11px] uppercase font-bold text-neutral-400">Preview</TableHead>
                  <TableHead className="text-[11px] uppercase font-bold text-neutral-400">Name</TableHead>
                  <TableHead className="text-[11px] uppercase font-bold text-neutral-400">Category</TableHead>
                  <TableHead className="text-[11px] uppercase font-bold text-neutral-400">Theme</TableHead>
                  <TableHead className="text-right text-[11px] uppercase font-bold text-neutral-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template, i) => (
                  <motion.tr
                    key={template.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors group h-16"
                  >
                    <TableCell>
                      <div className="size-12 rounded-[8px] overflow-hidden ring-1 ring-foreground/5">
                        <img src={template.image} alt={template.name} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins font-semibold text-sm">{template.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-[8px] bg-neutral-100 text-[10px] font-bold uppercase text-neutral-500">{template.category}</span>
                    </TableCell>
                    <TableCell className="text-neutral-500 text-[13px] font-poppins">{template.theme}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TextureButton
                          variant="secondary"
                          size="sm"
                          className="h-9 rounded-[8px] text-[10px] font-bold"
                          onClick={() => window.open(template.demoUrl, "_blank", "noopener")}
                        >
                          Preview
                        </TextureButton>
                        <TextureButton
                          variant="primary"
                          size="sm"
                          className="h-9 rounded-[8px] text-[10px] font-bold"
                          onClick={() => onSelect(template)}
                        >
                          Select
                        </TextureButton>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            {filteredTemplates.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-poppins text-neutral-400">No templates found matching "{searchQuery}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
