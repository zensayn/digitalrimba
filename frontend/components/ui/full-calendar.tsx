"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from "@fullcalendar/core";
import { EventResizeDoneArg } from "@fullcalendar/interaction";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { AltArrowDown, AltArrowLeft, AltArrowRight, Calendar as CalendarIcon, List as ListIcon, ClockCircle, CloseCircle, TrashBinMinimalistic } from "@solar-icons/react";
import { TextureButton } from "./texture-button";
import {
  PopoverBody,
  PopoverButton,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTrigger,
} from "./popover";

interface CalendarEvent extends EventInput {
  id?: string;
  extendedProps: {
    calendar: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("09:00 AM");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("10:00 AM");
  const [isAllDay, setIsAllDay] = useState(false);
  const [eventLocation, setEventLocation] = useState("");
  const [eventLevel, setEventLevel] = useState("Primary");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState("");
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Blue: "#0ea5e9",
    Yellow: "#facc15",
    Purple: "#a855f7",
    Red: "#f43f5e",
    Teal: "#14b8a6",
    Orange: "#f97316",
  };

  useEffect(() => {
    setEvents([
      {
        id: "1",
        title: "Catering Tasting",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { calendar: "Red", description: "Weekly team sync", location: "Conference Room A", startTime: "09:00 AM", endTime: "10:00 AM", allDay: false },
      },
      {
        id: "2",
        title: "Photographer Meet",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { calendar: "Teal", description: "Project kick-off", location: "Studio B", startTime: "11:00 AM", endTime: "12:00 PM", allDay: false },
      },
    ]);
    
    setTimeout(() => {
      setCalendarTitle(calendarRef.current?.getApi().view.title || "");
    }, 100);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventDescription(event.extendedProps.description || "");
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventStartTime(event.extendedProps.startTime || "09:00 AM");
    setEventEndDate(event.end?.toISOString().split("T")[0] || event.start?.toISOString().split("T")[0] || "");
    setEventEndTime(event.extendedProps.endTime || "10:00 AM");
    setIsAllDay(event.allDay);
    setEventLocation(event.extendedProps.location || "");
    setEventLevel(event.extendedProps.calendar || "Blue");
    openModal();
  };

  const handleEventChange = (changeInfo: EventDropArg | EventResizeDoneArg) => {
    const { event } = changeInfo;
    setEvents((prevEvents) =>
      prevEvents.map((prevEvent) =>
        prevEvent.id === event.id
          ? {
              ...prevEvent,
              start: event.startStr,
              end: event.endStr || event.startStr,
            }
          : prevEvent
      )
    );
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                allDay: isAllDay,
                extendedProps: { 
                  calendar: eventLevel,
                  description: eventDescription,
                  location: eventLocation,
                  startTime: eventStartTime,
                  endTime: eventEndTime,
                  allDay: isAllDay
                },
              }
            : event
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: isAllDay,
        extendedProps: { 
          calendar: eventLevel,
          description: eventDescription,
          location: eventLocation,
          startTime: eventStartTime,
          endTime: eventEndTime,
          allDay: isAllDay
        },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== selectedEvent.id));
      closeModal();
      resetModalFields();
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventDescription("");
    setEventStartDate("");
    setEventStartTime("09:00 AM");
    setEventEndDate("");
    setEventEndTime("10:00 AM");
    setIsAllDay(false);
    setEventLocation("");
    setEventLevel("Blue");
    setSelectedEvent(null);
  };

  const changeView = (viewType: string) => {
    setCurrentView(viewType);
    calendarRef.current?.getApi().changeView(viewType);
    setCalendarTitle(calendarRef.current?.getApi().view.title || "");
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
    setCalendarTitle(calendarRef.current?.getApi().view.title || "");
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
    setCalendarTitle(calendarRef.current?.getApi().view.title || "");
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
    setCalendarTitle(calendarRef.current?.getApi().view.title || "");
  };

  const viewLabels: Record<string, string> = {
    dayGridMonth: "Month",
    timeGridWeek: "Week",
    timeGridDay: "Day",
    listMonth: "Agenda"
  };

  return (
    <div className="flex flex-col gap-6 font-poppins h-full">
      <style jsx global>{`
        .custom-calendar .fc {
          --fc-border-color: #f8f8f8;
          font-family: inherit;
          border: none !important;
        }

        .custom-calendar .fc-col-header-cell-cushion {
          font-size: 11px !important;
          font-weight: 500 !important;
          color: #a3a3a3 !important;
          padding: 16px 0 !important;
        }

        .custom-calendar .fc-daygrid-day-number {
          font-size: 14px !important;
          font-weight: 400 !important;
          color: #737373 !important;
          padding: 12px 16px !important;
          text-decoration: none !important;
        }

        /* Today Highlight (Black Circle) */
        .custom-calendar .fc-day-today { background: transparent !important; }
        .custom-calendar .fc-day-today .fc-daygrid-day-number {
          color: white !important;
          font-weight: 700 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          margin: 8px 12px !important;
          background: #171717;
          border-radius: 50%;
        }

        /* Event Styling & Grid Stability */
        .custom-calendar .fc-daygrid-event {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          margin: 1px 8px !important;
          height: 28px !important;
        }

        .custom-calendar .fc-daygrid-more-link {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #a3a3a3 !important;
          padding-left: 12px !important;
          margin-top: 1px !important;
          display: block !important;
          cursor: pointer;
        }

        /* STRICT GRID STABILITY: Force cell height */
        .custom-calendar .fc-daygrid-day-frame {
          min-height: 125px !important; 
          height: 125px !important;
        }

        @media (max-width: 768px) {
          .custom-calendar .fc-daygrid-day-frame {
            min-height: 80px !important; 
            height: 80px !important;
          }
          .custom-calendar .fc-daygrid-day-number {
            padding: 8px 10px !important;
            font-size: 12px !important;
          }
          .custom-calendar .fc-col-header-cell-cushion {
            padding: 10px 0 !important;
          }
        }

        /* ── TIMEGRID (WEEK/DAY) STYLING ── */
        .custom-calendar .fc-timegrid-slot {
          height: 60px !important;
          border-bottom: 1px solid #f5f5f5 !important;
        }
        .custom-calendar .fc-timegrid-axis-cushion {
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase;
          color: #a3a3a3 !important;
          padding: 0 16px !important;
        }
        .custom-calendar .fc-timegrid-slot-label-cushion {
          font-size: 11px !important;
          font-weight: 500 !important;
          color: #a3a3a3 !important;
          text-transform: uppercase;
        }
        .custom-calendar .fc-col-header-cell {
          border: none !important;
          padding: 12px 0 !important;
          background: white !important;
        }
        .custom-calendar .fc-col-header-cell-cushion {
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #737373 !important;
          text-decoration: none !important;
        }
        .custom-calendar .fc-day-today .fc-col-header-cell-cushion {
          color: #000 !important;
          font-weight: 700 !important;
        }

        /* Now Indicator */
        .custom-calendar .fc-timegrid-now-indicator-line {
          border-color: #000 !important;
          border-width: 1.5px !important;
        }
        .custom-calendar .fc-timegrid-now-indicator-arrow {
          border: none !important;
          width: 8px !important;
          height: 8px !important;
          background: #000 !important;
          border-radius: 50% !important;
          margin-top: -4px !important;
          margin-left: -4px !important;
        }

        /* ── LIST/AGENDA STYLING ── */
        .custom-calendar .fc-list {
          border: none !important;
          background: transparent !important;
        }
        .custom-calendar .fc-list-day-section {
          background: transparent !important;
        }
        .custom-calendar .fc-list-day-cushion {
          background: transparent !important;
          padding: 32px 24px 12px 24px !important;
        }
        .custom-calendar .fc-list-day-text {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #a3a3a3 !important;
        }
        .custom-calendar .fc-list-day-side-text { display: none !important; }
        
        .custom-calendar .fc-list-event {
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
        }
        .custom-calendar .fc-list-event:hover td {
          background: transparent !important;
        }
        .custom-calendar .fc-list-event td {
          border: none !important;
          padding: 0 24px !important;
        }
        .custom-calendar .fc-list-event-time { display: none !important; }
        .custom-calendar .fc-list-event-graphic { display: none !important; }
        .custom-calendar .fc-list-event-title { padding: 0 !important; }

        /* All-day row in timeGrid */
        .custom-calendar .fc-timegrid-allday {
          background: #fafafa !important;
          height: 60px !important;
        }
        .custom-calendar .fc-timegrid-allday-cushion {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #a3a3a3 !important;
          text-transform: uppercase;
          padding: 0 16px !important;
          height: 60px !important;
          display: flex !important;
          items-center !important;
        }
        .custom-calendar .fc-timegrid-allday-top {
          border-bottom: 1px solid #f5f5f5 !important;
        }
        .custom-calendar .fc-timegrid-axis-frame-allday {
          height: 60px !important;
          display: flex !important;
          align-items: center !important;
        }

        .custom-calendar .fc-daygrid-day-events {
          padding-top: 0 !important;
          margin-top: -4px !important; /* Push events up */
        }

        .custom-calendar .fc-scrollgrid { border: none !important; }
        .custom-calendar .fc-scrollgrid-sync-table { height: auto !important; }
      `}</style>

      {/* ── CUSTOM TOOLBAR ── */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-8 rounded-[22px] ring-1 ring-foreground/5 bg-white shadow-sm z-10 gap-6 md:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={handleToday} className="h-9 px-4 rounded-lg bg-white border border-neutral-100 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
              Today
            </button>
            <div className="flex items-center gap-0.5 ml-2">
              <button onClick={handlePrev} className="p-2 text-neutral-400 hover:text-black transition-colors"><AltArrowLeft size={18} /></button>
              <button onClick={handleNext} className="p-2 text-neutral-400 hover:text-black transition-colors"><AltArrowRight size={18} /></button>
            </div>
          </div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-black min-w-0 sm:min-w-[180px] text-center sm:text-left">{calendarTitle}</h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
          <PopoverRoot>
            <PopoverTrigger className="h-10">
              {viewLabels[currentView]}
              <AltArrowDown size={14} className="text-neutral-400" />
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2 shadow-2xl ring-1 ring-black/5 bg-white rounded-[18px] z-[9999] border-none mt-2">
              <PopoverHeader className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-none">Switch View</PopoverHeader>
              <PopoverBody className="p-0 flex flex-col gap-1">
                {Object.entries(viewLabels).map(([val, label]) => (
                  <button 
                    key={val} 
                    onClick={() => {
                      changeView(val);
                    }} 
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-all", 
                      currentView === val 
                        ? "bg-[#edfce9] text-[#346739] font-semibold" 
                        : "text-neutral-500 hover:bg-[#edfce9]/40 hover:text-[#346739]"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </PopoverBody>
            </PopoverContent>
          </PopoverRoot>
          <TextureButton variant="primary" onClick={openModal} className="h-10 flex-grow md:flex-grow-0">
            <span className="flex items-center gap-2 justify-center"><span className="text-lg font-light leading-none">+</span> New event</span>
          </TextureButton>
        </div>
      </div>

      <div className="custom-calendar rounded-[22px] ring-1 ring-foreground/5 bg-white overflow-hidden shadow-sm flex-grow">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={currentView}
          height="auto"
          headerToolbar={false}
          events={events}
          selectable={true}
          editable={true}
          dayMaxEvents={2}
          nowIndicator={true}
          scrollTime="08:00:00"
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: true,
            meridiem: 'short'
          }}
          dayHeaderFormat={{
            weekday: 'short',
            day: 'numeric',
            omitCommas: true
          }}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventChange}
          eventResize={handleEventChange}
          eventContent={renderEventContent}
        />
      </div>

      {/* ── REDESIGNED MODAL ── */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[460px] p-0 overflow-hidden rounded-[24px] border-none ring-1 ring-foreground/10 shadow-2xl bg-white"
      >
        <div className="flex flex-col font-poppins relative">
          <div className="p-7 pb-4">
            <h5 className="text-[20px] font-bold tracking-tight text-black">
              {selectedEvent ? "Edit Event" : "Create Event"}
            </h5>
          </div>
          
          <div className="px-5 md:px-7 py-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-neutral-800">Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event name"
                className="h-10 w-full rounded-xl border border-neutral-100 bg-white px-4 text-[14px] text-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-neutral-800">Description</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Add a description..."
                className="h-24 w-full rounded-xl border border-neutral-100 bg-white p-4 text-[14px] text-black focus:ring-1 focus:ring-black outline-none transition-all resize-none placeholder:text-neutral-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-neutral-800">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-neutral-100 bg-white px-4 text-[14px] text-black focus:ring-1 focus:ring-black outline-none transition-all appearance-none"
                  />
                  <CalendarIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-neutral-800">Start Time</label>
                <div className="relative">
                  <select 
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="h-10 w-full rounded-xl border border-neutral-100 bg-white px-4 text-[14px] text-black focus:ring-1 focus:ring-black outline-none transition-all appearance-none pr-10"
                  >
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                  </select>
                  <AltArrowDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-neutral-800">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-neutral-100 bg-white px-4 text-[14px] text-black focus:ring-1 focus:ring-black outline-none transition-all appearance-none"
                  />
                  <CalendarIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-neutral-800">End Time</label>
                <div className="relative">
                  <select 
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="h-10 w-full rounded-xl border border-neutral-100 bg-white px-4 text-[14px] text-black focus:ring-1 focus:ring-black outline-none transition-all appearance-none pr-10"
                  >
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>12:00 PM</option>
                  </select>
                  <AltArrowDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer group py-1">
              <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="size-4 rounded border-neutral-200 text-black focus:ring-black transition-all" />
              <span className="text-[13px] text-neutral-600 font-medium group-hover:text-black transition-colors">All day</span>
            </label>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-neutral-800">Location</label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Add location"
                className="h-10 w-full rounded-xl border border-neutral-100 bg-white px-4 text-[14px] text-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <div className="space-y-2.5 pb-2">
              <label className="text-[13px] font-semibold text-neutral-800">Etiquette</label>
              <div className="flex flex-wrap items-center gap-3">
                {Object.entries(calendarsEvents).map(([key, hex]) => (
                  <button
                    key={key}
                    onClick={() => setEventLevel(key)}
                    className={cn(
                      "size-8 rounded-full transition-all relative flex items-center justify-center border-[3px] border-transparent",
                      eventLevel === key ? "border-black/5 scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: hex }}
                  >
                    {eventLevel === key && <div className="size-1.5 rounded-full bg-black shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7 pt-4 flex items-center justify-between bg-neutral-50/50 border-t border-neutral-50">
            <div>
              {selectedEvent && (
                <button 
                  onClick={handleDeleteEvent} 
                  className="size-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all active:scale-95"
                >
                  <TrashBinMinimalistic size={18} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TextureButton 
                variant="outline"
                onClick={closeModal} 
                className="h-10 px-4 md:px-5 rounded-xl text-[14px] font-semibold text-neutral-600 active:scale-95 transition-all"
              >
                Cancel
              </TextureButton>
              <TextureButton 
                variant="primary"
                onClick={handleAddOrUpdateEvent} 
                className="h-10 px-6 md:px-7 rounded-xl text-[14px] font-bold shadow-sm active:scale-95 transition-all"
              >
                Save
              </TextureButton>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorMap: Record<string, string> = {
    red: "bg-red-50 text-red-500",
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  
  const calendarType = eventInfo.event.extendedProps.calendar?.toLowerCase() || "blue";
  const colorClass = colorMap[calendarType] || colorMap.blue;

  if (eventInfo.view.type === 'listMonth') {
    return (
      <div className={cn("w-full mb-4 rounded-[12px] p-6 border-none transition-all hover:scale-[1.005] active:scale-[0.995]", colorClass)}>
        <div className="flex flex-col gap-1.5">
          <h4 className="text-[15px] font-bold tracking-tight">{eventInfo.event.title}</h4>
          <div className="flex items-center gap-2 text-[12px] font-medium opacity-70">
            <span>{eventInfo.timeText || 'All day'}</span>
            {eventInfo.event.extendedProps.location && (
              <>
                <span className="size-1 rounded-full bg-current opacity-30" />
                <span>{eventInfo.event.extendedProps.location}</span>
              </>
            )}
          </div>
          {eventInfo.event.extendedProps.description && (
            <p className="text-[13px] font-medium mt-1 opacity-80">{eventInfo.event.extendedProps.description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal font-poppins w-full overflow-hidden transition-all hover:brightness-95 cursor-pointer border-none shadow-none", colorClass)}>
      <span className="truncate">{eventInfo.event.title}</span>
    </div>
  );
};

export default Calendar;
