export interface City {
  id: string;
  name: string;
  country: string;
  tz: string; // IANA timezone identifier
  flag: string; // emoji flag
}

// A curated list of major cities worldwide with their IANA timezone identifiers.
export const CITY_DATABASE: City[] = [
  { id: "new-york", name: "New York", country: "United States", tz: "America/New_York", flag: "🇺🇸" },
  { id: "los-angeles", name: "Los Angeles", country: "United States", tz: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "chicago", name: "Chicago", country: "United States", tz: "America/Chicago", flag: "🇺🇸" },
  { id: "denver", name: "Denver", country: "United States", tz: "America/Denver", flag: "🇺🇸" },
  { id: "toronto", name: "Toronto", country: "Canada", tz: "America/Toronto", flag: "🇨🇦" },
  { id: "vancouver", name: "Vancouver", country: "Canada", tz: "America/Vancouver", flag: "🇨🇦" },
  { id: "mexico-city", name: "Mexico City", country: "Mexico", tz: "America/Mexico_City", flag: "🇲🇽" },
  { id: "sao-paulo", name: "São Paulo", country: "Brazil", tz: "America/Sao_Paulo", flag: "🇧🇷" },
  { id: "buenos-aires", name: "Buenos Aires", country: "Argentina", tz: "America/Argentina/Buenos_Aires", flag: "🇦🇷" },
  { id: "bogota", name: "Bogotá", country: "Colombia", tz: "America/Bogota", flag: "🇨🇴" },
  { id: "lima", name: "Lima", country: "Peru", tz: "America/Lima", flag: "🇵🇪" },
  { id: "santiago", name: "Santiago", country: "Chile", tz: "America/Santiago", flag: "🇨🇱" },
  { id: "london", name: "London", country: "United Kingdom", tz: "Europe/London", flag: "🇬🇧" },
  { id: "dublin", name: "Dublin", country: "Ireland", tz: "Europe/Dublin", flag: "🇮🇪" },
  { id: "paris", name: "Paris", country: "France", tz: "Europe/Paris", flag: "🇫🇷" },
  { id: "berlin", name: "Berlin", country: "Germany", tz: "Europe/Berlin", flag: "🇩🇪" },
  { id: "madrid", name: "Madrid", country: "Spain", tz: "Europe/Madrid", flag: "🇪🇸" },
  { id: "rome", name: "Rome", country: "Italy", tz: "Europe/Rome", flag: "🇮🇹" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", tz: "Europe/Amsterdam", flag: "🇳🇱" },
  { id: "brussels", name: "Brussels", country: "Belgium", tz: "Europe/Brussels", flag: "🇧🇪" },
  { id: "zurich", name: "Zürich", country: "Switzerland", tz: "Europe/Zurich", flag: "🇨🇭" },
  { id: "vienna", name: "Vienna", country: "Austria", tz: "Europe/Vienna", flag: "🇦🇹" },
  { id: "stockholm", name: "Stockholm", country: "Sweden", tz: "Europe/Stockholm", flag: "🇸🇪" },
  { id: "oslo", name: "Oslo", country: "Norway", tz: "Europe/Oslo", flag: "🇳🇴" },
  { id: "copenhagen", name: "Copenhagen", country: "Denmark", tz: "Europe/Copenhagen", flag: "🇩🇰" },
  { id: "helsinki", name: "Helsinki", country: "Finland", tz: "Europe/Helsinki", flag: "🇫🇮" },
  { id: "warsaw", name: "Warsaw", country: "Poland", tz: "Europe/Warsaw", flag: "🇵🇱" },
  { id: "prague", name: "Prague", country: "Czechia", tz: "Europe/Prague", flag: "🇨🇪" },
  { id: "athens", name: "Athens", country: "Greece", tz: "Europe/Athens", flag: "🇬🇷" },
  { id: "lisbon", name: "Lisbon", country: "Portugal", tz: "Europe/Lisbon", flag: "🇵🇹" },
  { id: "istanbul", name: "Istanbul", country: "Türkiye", tz: "Europe/Istanbul", flag: "🇹🇷" },
  { id: "moscow", name: "Moscow", country: "Russia", tz: "Europe/Moscow", flag: "🇷🇺" },
  { id: "kyiv", name: "Kyiv", country: "Ukraine", tz: "Europe/Kyiv", flag: "🇺🇦" },
  { id: "dubai", name: "Dubai", country: "UAE", tz: "Asia/Dubai", flag: "🇦🇪" },
  { id: "riyadh", name: "Riyadh", country: "Saudi Arabia", tz: "Asia/Riyadh", flag: "🇸🇦" },
  { id: "doha", name: "Doha", country: "Qatar", tz: "Asia/Qatar", flag: "🇶🇦" },
  { id: "tehran", name: "Tehran", country: "Iran", tz: "Asia/Tehran", flag: "🇮🇷" },
  { id: "kolkata", name: "Kolkata", country: "India", tz: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "mumbai", name: "Mumbai", country: "India", tz: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "delhi", name: "New Delhi", country: "India", tz: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "karachi", name: "Karachi", country: "Pakistan", tz: "Asia/Karachi", flag: "🇵🇰" },
  { id: "dhaka", name: "Dhaka", country: "Bangladesh", tz: "Asia/Dhaka", flag: "🇧🇩" },
  { id: "bangkok", name: "Bangkok", country: "Thailand", tz: "Asia/Bangkok", flag: "🇹🇭" },
  { id: "jakarta", name: "Jakarta", country: "Indonesia", tz: "Asia/Jakarta", flag: "🇮🇩" },
  { id: "singapore", name: "Singapore", country: "Singapore", tz: "Asia/Singapore", flag: "🇸🇬" },
  { id: "kuala-lumpur", name: "Kuala Lumpur", country: "Malaysia", tz: "Asia/Kuala_Lumpur", flag: "🇲🇾" },
  { id: "manila", name: "Manila", country: "Philippines", tz: "Asia/Manila", flag: "🇵🇭" },
  { id: "hong-kong", name: "Hong Kong", country: "Hong Kong", tz: "Asia/Hong_Kong", flag: "🇭🇰" },
  { id: "taipei", name: "Taipei", country: "Taiwan", tz: "Asia/Taipei", flag: "🇹🇼" },
  { id: "shanghai", name: "Shanghai", country: "China", tz: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "beijing", name: "Beijing", country: "China", tz: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "seoul", name: "Seoul", country: "South Korea", tz: "Asia/Seoul", flag: "🇰🇷" },
  { id: "tokyo", name: "Tokyo", country: "Japan", tz: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "osaka", name: "Osaka", country: "Japan", tz: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "sydney", name: "Sydney", country: "Australia", tz: "Australia/Sydney", flag: "🇦🇺" },
  { id: "melbourne", name: "Melbourne", country: "Australia", tz: "Australia/Melbourne", flag: "🇦🇺" },
  { id: "perth", name: "Perth", country: "Australia", tz: "Australia/Perth", flag: "🇦🇺" },
  { id: "brisbane", name: "Brisbane", country: "Australia", tz: "Australia/Brisbane", flag: "🇦🇺" },
  { id: "auckland", name: "Auckland", country: "New Zealand", tz: "Pacific/Auckland", flag: "🇳🇿" },
  { id: "wellington", name: "Wellington", country: "New Zealand", tz: "Pacific/Auckland", flag: "🇳🇿" },
  { id: "honolulu", name: "Honolulu", country: "United States", tz: "Pacific/Honolulu", flag: "🇺🇸" },
  { id: "anchorage", name: "Anchorage", country: "United States", tz: "America/Anchorage", flag: "🇺🇸" },
  { id: "cairo", name: "Cairo", country: "Egypt", tz: "Africa/Cairo", flag: "🇪🇬" },
  { id: "lagos", name: "Lagos", country: "Nigeria", tz: "Africa/Lagos", flag: "🇳🇬" },
  { id: "nairobi", name: "Nairobi", country: "Kenya", tz: "Africa/Nairobi", flag: "🇰🇪" },
  { id: "johannesburg", name: "Johannesburg", country: "South Africa", tz: "Africa/Johannesburg", flag: "🇿🇦" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", tz: "Africa/Johannesburg", flag: "🇿🇦" },
  { id: "casablanca", name: "Casablanca", country: "Morocco", tz: "Africa/Casablanca", flag: "🇲🇦" },
  { id: "accra", name: "Accra", country: "Ghana", tz: "Africa/Accra", flag: "🇬🇭" },
  { id: "tel-aviv", name: "Tel Aviv", country: "Israel", tz: "Asia/Jerusalem", flag: "🇮🇱" },
  { id: "ho-chi-minh", name: "Ho Chi Minh City", country: "Vietnam", tz: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  { id: "hanoi", name: "Hanoi", country: "Vietnam", tz: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
];

export const MAX_CITIES = 8;

export function formatTime(date: Date, tz: string, military: boolean = false): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: military ? "2-digit" : "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: !military,
    timeZone: tz,
  }).format(date);
}

export function formatHour(date: Date, tz: string, military: boolean = false): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: military ? "2-digit" : "numeric",
    hour12: !military,
    timeZone: tz,
  }).format(date);
}

/** Format an arbitrary hour+minute pair (0-23, 0-59) as a time label. */
export function formatHourMinute(hour: number, minute: number, military: boolean = false): string {
  if (military) {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatDate(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: tz,
  }).format(date);
}

export function formatDateShort(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: tz,
  }).format(date);
}

export function getTzOffset(tz: string, date: Date = new Date()): number {
  // Returns offset in minutes (positive = ahead of UTC)
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const asUTC = Date.UTC(
    parseInt(map.year, 10),
    parseInt(map.month, 10) - 1,
    parseInt(map.day, 10),
    parseInt(map.hour, 10) === 24 ? 0 : parseInt(map.hour, 10),
    parseInt(map.minute, 10),
    parseInt(map.second, 10),
  );
  return Math.round((asUTC - date.getTime()) / 60000);
}

export function formatTzOffset(tz: string, date: Date = new Date()): string {
  const offset = getTzOffset(tz, date);
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m > 0 ? `:${String(m).padStart(2, "0")}` : ""}`;
}

export function getTzAbbreviation(tz: string, date: Date = new Date()): string {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
    timeZone: tz,
  });
  const parts = dtf.formatToParts(date);
  const tzPart = parts.find((p) => p.type === "timeZoneName");
  return tzPart?.value ?? tz;
}

export function getHourInTz(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    timeZone: tz,
  });
  const parts = dtf.formatToParts(date);
  const hourPart = parts.find((p) => p.type === "hour");
  const h = parseInt(hourPart?.value ?? "0", 10);
  return h === 24 ? 0 : h;
}

export function getMinutesInTz(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const h = parseInt(map.hour ?? "0", 10);
  const m = parseInt(map.minute ?? "0", 10);
  return (h === 24 ? 0 : h) * 60 + m;
}

export function getDayOfWeek(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: tz,
  });
  const dayName = dtf.format(date);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.indexOf(dayName);
}

export function isSameDayInTz(date: Date, tz: string, refDate: Date): boolean {
  const fmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: tz,
  });
  return fmt.format(date) === fmt.format(refDate);
}

export function getTimeLabel(hour: number): string {
  if (hour < 5) return "Late night";
  if (hour < 9) return "Early morning";
  if (hour < 12) return "Morning";
  if (hour < 13) return "Noon";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Night";
}

/** Work hours: 9:00 AM – 5:00 PM (540–1020 minutes) in the city's local timezone. */
export function isBusinessHours(date: Date, tz: string): boolean {
  const minutes = getMinutesInTz(date, tz);
  return minutes >= 540 && minutes < 1020;
}

/** Returns a concise status string like "Morning · Work hours" or "Night · Outside work hours". */
export function getStatusLabel(date: Date, tz: string): string {
  const hour = getHourInTz(date, tz);
  const business = isBusinessHours(date, tz);
  const partOfDay = getTimeLabel(hour);
  const workStatus = business ? "Work hours" : "Outside work hours";
  return `${partOfDay} · ${workStatus}`;
}
