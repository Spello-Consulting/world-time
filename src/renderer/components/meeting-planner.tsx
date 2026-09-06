import { useMemo, useState, useCallback } from "react";
import { Text, SegmentedControl, SegmentedControlItem, TimeField } from "../ui";
import {
  type City,
  getTzOffset,
  getTzAbbreviation,
  getHourInTz,
  formatTzOffset,
  getTimeLabel,
  formatHourMinute,
} from "../lib/cities";
import { cn } from "../lib/cn";
import { Sun, Moon, Coffee } from "lucide-react";

interface MeetingPlannerProps {
  cities: City[];
  now: Date;
  militaryTime: boolean;
}

const DURATIONS = [
  { value: "15", label: "15m" },
  { value: "30", label: "30m" },
  { value: "60", label: "1h" },
  { value: "120", label: "2h" },
];

// Hours to show in the timeline: 0-23
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Reference timezone: use the first selected city, or UTC if none
function getReferenceTz(cities: City[]): string {
  return cities[0]?.tz ?? "UTC";
}

export function MeetingPlanner({ cities, now, militaryTime }: MeetingPlannerProps) {
  const [durationMin, setDurationMin] = useState("60");
  const [meetingHour, setMeetingHour] = useState("14");
  const [meetingMinute, setMeetingMinute] = useState("00");

  // Default to next round hour in reference tz
  const refTz = getReferenceTz(cities);

  // Parse meeting time in reference tz
  const meetingHourNum = parseInt(meetingHour, 10) || 0;
  const meetingMinuteNum = parseInt(meetingMinute, 10) || 0;

  // Build the timeline data for each city
  const timelineData = useMemo(() => {
    const refOffset = getTzOffset(refTz, now); // minutes

    return cities.map((city) => {
      const cityOffset = getTzOffset(city.tz, now);
      const offsetDiff = cityOffset - refOffset; // minutes difference from ref

      // For each hour 0-23 in reference tz, compute the hour in this city's tz
      const hours = HOURS.map((refHour) => {
        const refTotalMin = refHour * 60;
        const cityTotalMin = refTotalMin + offsetDiff;
        // Normalize to 0-1439 range (wrapping)
        const normalized = ((cityTotalMin % 1440) + 1440) % 1440;
        const cityHour = Math.floor(normalized / 60);
        const cityMinute = normalized % 60;
        return { hour: cityHour, minute: cityMinute };
      });

      return {
        city,
        hours,
        abbr: getTzAbbreviation(city.tz, now),
        offset: formatTzOffset(city.tz, now),
      };
    });
  }, [cities, refTz, now]);

  // Meeting time in reference tz converted to each city's local time
  const meetingTimes = useMemo(() => {
    const refOffset = getTzOffset(refTz, now);

    return cities.map((city) => {
      const cityOffset = getTzOffset(city.tz, now);
      const offsetDiff = cityOffset - refOffset;

      const meetingTotalMin = meetingHourNum * 60 + meetingMinuteNum;
      const cityTotalMin = meetingTotalMin + offsetDiff;
      const normalized = ((cityTotalMin % 1440) + 1440) % 1440;
      const cityHour = Math.floor(normalized / 60);
      const cityMinute = normalized % 60;

      const isBusiness = normalized >= 540 && normalized < 1020; // 9-17
      const isDaytime = cityHour >= 6 && cityHour < 18;

      return {
        city,
        hour: cityHour,
        minute: cityMinute,
        isBusiness,
        isDaytime,
        timeLabel: getTimeLabel(cityHour),
      };
    });
  }, [cities, refTz, now, meetingHourNum, meetingMinuteNum, durationMin]);

  // Current hour in reference tz (for highlighting "now" column)
  const currentRefHour = getHourInTz(now, refTz);

  // Click on a timeline cell to set meeting time
  const handleCellClick = useCallback((hourIndex: number) => {
    setMeetingHour(String(hourIndex).padStart(2, "0"));
    setMeetingMinute("00");
  }, []);

  if (cities.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20">
        <Text variant="large" color="tertiary">
          Add cities to plan a meeting
        </Text>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Meeting controls */}
      <div className="flex flex-wrap items-end gap-4 border-b border-separator px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <Text variant="small" color="tertiary">
            Meeting time in {cities[0]?.name ?? "reference"}
          </Text>
          <TimeField
            value={`${meetingHour}:${meetingMinute}`}
            onValueChange={(v) => {
              if (v === "") return;
              const [h, m] = v.split(":");
              setMeetingHour(h);
              setMeetingMinute(m);
            }}
            aria-label="Meeting time"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Text variant="small" color="tertiary">
            Duration
          </Text>
          <SegmentedControl
            value={durationMin}
            onValueChange={setDurationMin}
            aria-label="Meeting duration"
          >
            {DURATIONS.map((d) => (
              <SegmentedControlItem key={d.value} value={d.value}>
                {d.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
        <div className="ml-auto flex flex-col gap-1.5">
          <Text variant="mini" color="quaternary">
            Click a time slot to set meeting
          </Text>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="inline-flex h-full min-w-full flex-col">
          {/* Hour header row */}
          <div className="flex shrink-0 border-b border-separator">
            <div className="w-32 shrink-0 border-r border-separator px-3 py-2">
              <Text variant="small" color="tertiary">
                {HOURS.length}h
              </Text>
            </div>
            <div className="flex flex-1">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className={cn(
                    "min-w-[40px] flex-1 cursor-pointer border-r border-separator/50 py-2 text-center transition-colors hover:bg-list-hover/50",
                    h === currentRefHour && "bg-accent/10",
                  )}
                  onClick={() => handleCellClick(h)}
                >
                  <Text
                    variant="mini"
                    color={h === currentRefHour ? "accent" : "quaternary"}
                    className="tabular-nums"
                  >
                    {h === 0 ? "" : militaryTime ? `${h}` : `${h}`}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* City rows */}
          {timelineData.map(({ city, hours, abbr, offset }) => (
            <div key={city.id} className="flex border-b border-separator/50 hover:bg-list-hover/30">
              {/* City label */}
              <div className="flex w-32 shrink-0 flex-col gap-0.5 border-r border-separator px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="shrink-0 text-base">{city.flag}</span>
                  <Text variant="small-strong" truncate>
                    {city.name}
                  </Text>
                </div>
                <div className="flex items-center gap-1">
                  <Text variant="mini" color="quaternary">
                    {abbr}
                  </Text>
                  <Text variant="mini" color="quaternary">
                    {offset}
                  </Text>
                </div>
              </div>
              {/* Hour cells */}
              <div className="flex flex-1">
                {hours.map((cell, i) => {
                  const isBusiness = cell.hour >= 9 && cell.hour < 17 && cell.minute === 0;
                  const isDaytime = cell.hour >= 6 && cell.hour < 18;
                  const isNighttime = !isDaytime;
                  const isNow = i === currentRefHour;
                  const isMeeting = i === meetingHourNum;

                  return (
                    <div
                      key={i}
                      onClick={() => handleCellClick(i)}
                      className={cn(
                        "relative flex h-12 min-w-[40px] flex-1 cursor-pointer items-center justify-center border-r border-separator/30 transition-colors",
                        isNighttime && "bg-control/60",
                        isDaytime && !isBusiness && "bg-transparent",
                        isBusiness && "bg-support-green/5",
                        isNow && "bg-accent/10",
                        "hover:bg-list-hover/40",
                      )}
                    >
                      {isMeeting && (
                        <div
                          className="pointer-events-none absolute inset-y-0 border-x-2 border-accent bg-accent/25"
                          style={{
                            left: `${(meetingMinuteNum / 60) * 100}%`,
                            right: `${Math.max(0, 100 - ((meetingMinuteNum + parseInt(durationMin, 10)) / 60) * 100)}%`,
                          }}
                        />
                      )}
                      {cell.minute === 0 ? (
                        <Text
                          variant="mini"
                          color={isNow ? "accent" : isNighttime ? "quaternary" : "tertiary"}
                          className="relative z-10 pointer-events-none tabular-nums"
                        >
                          {militaryTime
                            ? `${String(cell.hour).padStart(2, "0")}`
                            : cell.hour === 0
                              ? "12a"
                              : cell.hour < 12
                                ? `${cell.hour}a`
                                : cell.hour === 12
                                  ? "12p"
                                  : `${cell.hour - 12}p`}
                        </Text>
                      ) : null}
                      {/* Business hours indicator */}
                      {isBusiness && (
                        <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-support-green/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting summary */}
      <div className="border-t border-separator px-6 py-4">
        <Text variant="small" color="tertiary" className="mb-2">
          Meeting at {formatHourMinute(meetingHourNum, meetingMinuteNum, militaryTime)} in{" "}
          {cities[0]?.name} ({getTzAbbreviation(refTz, now)})
        </Text>
        <div className="flex flex-wrap gap-2">
          {meetingTimes.map(({ city, hour, minute, isBusiness, isDaytime, timeLabel }) => (
            <div
              key={city.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-1.5",
                isBusiness
                  ? "border-support-green/30 bg-support-green/10"
                  : isDaytime
                    ? "border-support-yellow/30 bg-support-yellow/10"
                    : "border-support-blue/30 bg-support-blue/10",
              )}
            >
              <span className="text-sm">{city.flag}</span>
              <Text variant="small-strong" className="tabular-nums">
                {formatHourMinute(hour, minute, militaryTime)}
              </Text>
              {isBusiness ? (
                <Coffee className="size-3 text-support-green" />
              ) : isDaytime ? (
                <Sun className="size-3 text-support-yellow" />
              ) : (
                <Moon className="size-3 text-support-blue" />
              )}
              <Text variant="mini" color="tertiary">
                {timeLabel}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
