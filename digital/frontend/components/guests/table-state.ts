import type { ColumnFiltersState } from "@tanstack/react-table";
import type { Guest } from "./types";

export const EMPTY_GUESTS: Guest[] = [];
export const EMPTY_COLUMN_FILTERS: ColumnFiltersState = [];

export function resolveGuestTableData(guests: Guest[] | undefined): Guest[] {
  return guests ?? EMPTY_GUESTS;
}

export function getGuestColumnFilters(tagFilter: string): ColumnFiltersState {
  if (tagFilter === "all") {
    return EMPTY_COLUMN_FILTERS;
  }

  return [{ id: "tag", value: tagFilter }];
}
