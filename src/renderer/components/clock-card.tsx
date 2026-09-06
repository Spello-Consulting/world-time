import type { DragEvent } from "react";
import {
  Badge,
  Text,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui";
import { MoreHorizontal, GripVertical } from "lucide-react";
import {
  type City,
  formatTime,
  formatDate,
  formatTzOffset,
  getTzAbbreviation,
  getHourInTz,
  getTimeLabel,
  isBusinessHours,
} from "../lib/cities";
import { cn } from "../lib/cn";

interface ClockCardProps {
  city: City;
  now: Date;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  militaryTime: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: DragEvent, id: string) => void;
  onDragOver: (e: DragEvent, id: string) => void;
  onDragLeave: (e: DragEvent, id: string) => void;
  onDrop: (e: DragEvent, id: string) => void;
  onDragEnd: (e: DragEvent, id: string) => void;
}

export function ClockCard({
  city,
  now,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  militaryTime,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: ClockCardProps) {
  const time = formatTime(now, city.tz, militaryTime);
  const date = formatDate(now, city.tz);
  const offset = formatTzOffset(city.tz, now);
  const abbr = getTzAbbreviation(city.tz, now);
  const hour = getHourInTz(now, city.tz);
  const timeLabel = getTimeLabel(hour);
  const isBusiness = isBusinessHours(now, city.tz);

  // Day/night indicator color
  const isDaytime = hour >= 6 && hour < 18;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, city.id)}
      onDragOver={(e) => onDragOver(e, city.id)}
      onDragLeave={(e) => onDragLeave(e, city.id)}
      onDrop={(e) => onDrop(e, city.id)}
      onDragEnd={(e) => onDragEnd(e, city.id)}
      className={cn(
        "relative flex min-w-0 flex-col gap-3 rounded-card border bg-control-subtle/40 p-5 transition-all",
        isDragging && "opacity-40",
        isDragOver && "-translate-y-0.5 border-2 border-accent",
        !isDragging && !isDragOver && "border-separator",
      )}
    >
      {/* Drag handle */}
      <div className="absolute top-3 right-3 flex items-center gap-0.5">
        <GripVertical className="size-4 cursor-grab text-quaternary active:cursor-grabbing" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button iconOnly variant="transparent" size="small" className="shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem icon="arrow_up" disabled={isFirst} onSelect={() => onMoveUp(city.id)}>
              Move Up
            </DropdownMenuItem>
            <DropdownMenuItem
              icon="arrow_down"
              disabled={isLast}
              onSelect={() => onMoveDown(city.id)}
            >
              Move Down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon="trash" color="red" onSelect={() => onRemove(city.id)}>
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header row: city name */}
      <div className="flex min-w-0 flex-col gap-0.5 pr-12">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 text-lg">{city.flag}</span>
          <Text variant="large-strong" truncate>
            {city.name}
          </Text>
        </div>
        <Text variant="small" color="tertiary" truncate>
          {city.country}
        </Text>
      </div>

      {/* Time display */}
      <div className="flex items-baseline gap-2">
        <Text variant="heading1" className="tracking-tight tabular-nums">
          {time}
        </Text>
      </div>

      {/* Date + timezone info */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Text variant="small" color="secondary">
          {date}
        </Text>
        <span className="text-small text-quaternary">·</span>
        <Badge color={isDaytime ? "yellow" : "blue"} size="small">
          {abbr}
        </Badge>
        <Badge color="secondary" size="small">
          {offset}
        </Badge>
      </div>

      {/* Status indicator */}
      <div className="mt-auto flex items-center gap-1.5">
        <div
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            isBusiness ? "bg-support-green" : isDaytime ? "bg-support-yellow" : "bg-support-blue",
          )}
        />
        <Text variant="small" color="tertiary">
          {timeLabel}
          {!isBusiness && isDaytime ? " · Outside work hours" : ""}
          {isBusiness ? " · Work hours" : ""}
          {!isDaytime ? " · Nighttime" : ""}
        </Text>
      </div>
    </div>
  );
}
