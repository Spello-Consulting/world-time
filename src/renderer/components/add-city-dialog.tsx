import { useMemo, useState } from "react";
import { Dialog, DialogBody, Input, Badge, Text } from "../ui";
import { Search, Check } from "lucide-react";
import { CITY_DATABASE, MAX_CITIES, formatTzOffset, getTzAbbreviation } from "../lib/cities";
import { cn } from "../lib/cn";

interface AddCityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onAdd: (id: string) => void;
  canAdd: boolean;
}

export function AddCityDialog({
  open,
  onOpenChange,
  selectedIds,
  onAdd,
  canAdd,
}: AddCityDialogProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CITY_DATABASE;
    return CITY_DATABASE.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.tz.toLowerCase().includes(q),
    );
  }, [search]);

  const handleAdd = (id: string) => {
    onAdd(id);
    if (!canAdd) {
      onOpenChange(false);
      setSearch("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add City"
      description={`${selectedIds.length} of ${MAX_CITIES} cities selected`}
      size="large"
      showCloseButton
      confirmLabel="Done"
      onConfirm={handleClose}
    >
      <DialogBody maxHeight="50vh">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tertiary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities, countries, or time zones…"
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-0.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <Text variant="small" color="tertiary">
                  No cities found
                </Text>
              </div>
            ) : (
              filtered.map((city) => {
                const isSelected = selectedIds.includes(city.id);
                const disabled = isSelected || (!canAdd && !isSelected);
                return (
                  <button
                    key={city.id}
                    onClick={() => !disabled && handleAdd(city.id)}
                    disabled={disabled}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      "hover:bg-list-hover",
                      disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                      isSelected && "bg-list-selection hover:bg-list-selection",
                    )}
                  >
                    <span className="shrink-0 text-xl">{city.flag}</span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <Text variant="regular" truncate>
                        {city.name}
                      </Text>
                      <Text variant="small" color="tertiary" truncate>
                        {city.country}
                      </Text>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge color="secondary" size="small">
                        {getTzAbbreviation(city.tz)}
                      </Badge>
                      <Badge color="secondary" size="small">
                        {formatTzOffset(city.tz)}
                      </Badge>
                      {isSelected && <Check className="size-4 shrink-0 text-accent" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}
