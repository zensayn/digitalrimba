"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { CloseCircle } from "@solar-icons/react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"

import { cn } from "@/lib/utils"

const TRANSITION = {
  type: "spring" as const,
  bounce: 0.05,
  duration: 0.3,
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, handler])
}

interface PopoverContextType {
  isOpen: boolean
  openPopover: () => void
  closePopover: () => void
  uniqueId: string
  note: string
  setNote: (note: string) => void
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined)

function usePopover() {
  const context = useContext(PopoverContext)
  if (!context) {
    throw new Error("usePopover must be used within a PopoverProvider")
  }
  return context
}

function usePopoverLogic() {
  const uniqueId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState("")

  const openPopover = () => setIsOpen(true)
  const closePopover = () => {
    setIsOpen(false)
    setNote("")
  }

  return { isOpen, openPopover, closePopover, uniqueId, note, setNote }
}

interface PopoverRootProps {
  children: React.ReactNode
  className?: string
}

export function PopoverRoot({ children, className }: PopoverRootProps) {
  const popoverLogic = usePopoverLogic()

  return (
    <PopoverContext.Provider value={popoverLogic}>
      <MotionConfig transition={TRANSITION}>
        <div
          className={cn(
            "relative flex items-center justify-center",
            className
          )}
        >
          {children}
        </div>
      </MotionConfig>
    </PopoverContext.Provider>
  )
}

interface PopoverTriggerProps {
  children: React.ReactNode
  className?: string
}

export function PopoverTrigger({ children, className }: PopoverTriggerProps) {
  const { openPopover, uniqueId, isOpen } = usePopover()

  return (
    <motion.button
      key="button"
      layoutId={`popover-${uniqueId}`}
      className={cn(
        "relative inline-flex transition-transform duration-150 ease-out active:scale-[0.97] p-0 overflow-hidden rounded-[22px] bg-transparent",
        className
      )}
      onClick={openPopover}
    >
      {/* Outer Border Layer */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.1 }}
        className="absolute inset-0 bg-neutral-200 rounded-[22px]"
      />
      
      {/* Inner Surface Layer */}
      <motion.div 
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.1 }}
        className="absolute inset-[1px] bg-white hover:bg-neutral-50 active:bg-neutral-100 rounded-[21px] overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] brightness-125 contrast-150 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </motion.div>

      {/* Label Content */}
      <motion.span 
        layoutId={`popover-label-${uniqueId}`} 
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.1 }}
        className="relative z-10 flex items-center justify-center gap-2 w-full h-full text-sm px-6 py-2 text-neutral-600 hover:text-black"
      >
        {children}
      </motion.span>
    </motion.button>
  )
}

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
}

export function PopoverContent({ children, className }: PopoverContentProps) {
  const { isOpen, closePopover, uniqueId } = usePopover()
  const formContainerRef = useRef<HTMLDivElement>(null)

  useClickOutside(formContainerRef, closePopover)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopover()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [closePopover])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={formContainerRef}
          layoutId={`popover-${uniqueId}`}
          className={cn(
            "absolute h-auto min-h-[50px] w-[364px] overflow-hidden bg-neutral-200 p-px shadow-2xl z-[9999]",
            className
          )}
          style={{
            borderRadius: 22,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 }
          }}
        >
          <div className="bg-white rounded-[21px] h-full w-full overflow-hidden flex flex-col">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface PopoverFormProps {
  children: React.ReactNode
  onSubmit?: (note: string) => void
  className?: string
}

export function PopoverForm({
  children,
  onSubmit,
  className,
}: PopoverFormProps) {
  const { note, closePopover } = usePopover()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(note)
    closePopover()
  }

  return (
    <form
      className={cn("flex h-full flex-col", className)}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  )
}

interface PopoverLabelProps {
  children: React.ReactNode
  className?: string
}

export function PopoverLabel({ children, className }: PopoverLabelProps) {
  const { uniqueId, note } = usePopover()

  return (
    <motion.span
      layoutId={`popover-label-${uniqueId}`}
      aria-hidden="true"
      style={{
        opacity: note ? 0 : 1,
      }}
      className={cn(
        "absolute left-4 top-3 select-none text-sm text-zinc-500 dark:text-zinc-400",
        className
      )}
    >
      {children}
    </motion.span>
  )
}

interface PopoverTextareaProps {
  className?: string
}

export function PopoverTextarea({ className }: PopoverTextareaProps) {
  const { note, setNote } = usePopover()

  return (
    <textarea
      className={cn(
        "h-full w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm outline-none",
        className
      )}
      autoFocus
      value={note}
      onChange={(e) => setNote(e.target.value)}
    />
  )
}

interface PopoverFooterProps {
  children: React.ReactNode
  className?: string
}

export function PopoverFooter({ children, className }: PopoverFooterProps) {
  return (
    <div
      key="close"
      className={cn("flex justify-between px-4 py-3", className)}
    >
      {children}
    </div>
  )
}

interface PopoverCloseButtonProps {
  className?: string
}

export function PopoverCloseButton({ className }: PopoverCloseButtonProps) {
  const { closePopover } = usePopover()

  return (
    <button
      type="button"
      className={cn("flex items-center", className)}
      onClick={closePopover}
      aria-label="Close popover"
    >
      <CloseCircle size={16} className="text-zinc-900 dark:text-zinc-100" />
    </button>
  )
}

interface PopoverSubmitButtonProps {
  className?: string
}

export function PopoverSubmitButton({ className }: PopoverSubmitButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex transition-transform duration-150 ease-out active:scale-[0.97] p-px overflow-hidden bg-[#1a3a1d] rounded-xl ml-1",
        className
      )}
      type="submit"
      aria-label="Submit note"
    >
      <div className="absolute inset-[1px] bg-gradient-to-b from-[#427d49] to-[#346739] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.25)] rounded-[11px] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] brightness-125 contrast-150 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>
      <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full text-sm px-4 py-1.5 text-white">
        Submit
      </span>
    </button>
  )
}

export function PopoverHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "px-4 py-2 font-semibold text-zinc-900",
        className
      )}
    >
      {children}
    </div>
  )
}

export function PopoverBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("p-4", className)}>{children}</div>
}

// New component: PopoverButton
export function PopoverButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm hover:bg-[#edfce9] hover:text-[#346739] transition-all",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
