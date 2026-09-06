import { useCallback, useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
  SplitView,
  Sidebar,
  SidebarList,
  SidebarListItem,
  ScrollArea,
  Toolbar,
  ToolbarContent,
  ToolbarTitle,
  ToolbarActions,
  TabsRoot,
  Tabs,
  TabsTrigger,
  TabsContent,
  Button,
  Text,
  EmptyState,
} from "../ui";
import { Plus, Clock, CalendarDays } from "lucide-react";
import { CITY_DATABASE, MAX_CITIES, formatTime, getTzAbbreviation } from "../lib/cities";
import { useCitySelection } from "../lib/city-store";
import { useSettings } from "../lib/settings-store";
import { useNow } from "../lib/use-now";
import { ClockCard } from "../components/clock-card";
import { AddCityDialog } from "../components/add-city-dialog";
import { MeetingPlanner } from "../components/meeting-planner";

export function HomeView() {
  const { selectedIds, addCity, removeCity, reorderCity, setCities, canAdd } = useCitySelection();
  const { settings } = useSettings();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("world-clock");
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Tick every second for world clock, every 30s for meeting planner is fine
  const now = useNow(activeTab === "world-clock" ? 1000 : 30000);

  const selectedCities = useMemo(
    () =>
      selectedIds
        .map((id) => CITY_DATABASE.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => c !== undefined),
    [selectedIds],
  );

  // Filter sidebar cities by search
  const filteredSidebarCities = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    if (!q) return selectedCities;
    return selectedCities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.tz.toLowerCase().includes(q),
    );
  }, [selectedCities, sidebarSearch]);

  // Drag-and-drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((_e: DragEvent, id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback(
    (e: DragEvent, id: string) => {
      e.preventDefault();
      if (id !== draggedId) {
        setDragOverId(id);
      }
    },
    [draggedId],
  );

  const handleDragLeave = useCallback((_e: DragEvent, _id: string) => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent, targetId: string) => {
      e.preventDefault();
      const sourceId = draggedId;
      if (!sourceId || sourceId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      const newIds = [...selectedIds];
      const sourceIdx = newIds.indexOf(sourceId);
      const targetIdx = newIds.indexOf(targetId);
      if (sourceIdx === -1 || targetIdx === -1) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      // Remove source and insert at target position
      newIds.splice(sourceIdx, 1);
      newIds.splice(targetIdx, 0, sourceId);
      setCities(newIds);
      setDraggedId(null);
      setDragOverId(null);
    },
    [draggedId, selectedIds, setCities],
  );

  const handleDragEnd = useCallback((_e: DragEvent, _id: string) => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  return (
    <>
      <SplitView
        storageKey="world-time-main"
        sidebar={
          <Sidebar
            searchable
            searchPlaceholder="Search cities"
            searchValue={sidebarSearch}
            onSearchChange={setSidebarSearch}
            actions={
              <Button iconOnly onClick={() => setAddDialogOpen(true)} disabled={!canAdd}>
                <Plus className="size-4" />
              </Button>
            }
          >
            <SidebarList>
              <div className="px-3 pt-3 pb-1">
                <Text variant="small" color="tertiary">
                  {selectedCities.length} of {MAX_CITIES} cities
                </Text>
              </div>
              {filteredSidebarCities.map((city) => (
                <SidebarListItem
                  key={city.id}
                  icon={<span className="text-base">{city.flag}</span>}
                  title={city.name}
                  subtitle={getTzAbbreviation(city.tz, now)}
                  accessory={formatTime(now, city.tz, settings.militaryTime)}
                />
              ))}
              {filteredSidebarCities.length === 0 && sidebarSearch.trim() && (
                <div className="px-3 py-4">
                  <Text variant="small" color="tertiary">
                    No matching cities
                  </Text>
                </div>
              )}
              {selectedCities.length === 0 && (
                <div className="px-3 py-4">
                  <Text variant="small" color="tertiary">
                    No cities yet. Tap + to add.
                  </Text>
                </div>
              )}
            </SidebarList>
          </Sidebar>
        }
      >
        <ScrollArea
          toolbar={
            <Toolbar>
              <ToolbarContent>
                <ToolbarTitle>World Time</ToolbarTitle>
              </ToolbarContent>
              <ToolbarActions>
                <TabsRoot value={activeTab} onValueChange={setActiveTab}>
                  <Tabs variant="glass" size="large">
                    <TabsTrigger value="world-clock">
                      <Clock className="size-4" />
                      Clock
                    </TabsTrigger>
                    <TabsTrigger value="meeting-planner">
                      <CalendarDays className="size-4" />
                      Planner
                    </TabsTrigger>
                  </Tabs>
                </TabsRoot>
                <Button iconOnly onClick={() => setAddDialogOpen(true)} disabled={!canAdd}>
                  <Plus className="size-4" />
                </Button>
              </ToolbarActions>
            </Toolbar>
          }
        >
          <TabsRoot value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="world-clock" className="h-full">
              {selectedCities.length === 0 ? (
                <EmptyState
                  placement="viewport"
                  title="No cities selected"
                  description="Add up to 8 cities to see their current time at a glance."
                  actions={
                    <Button variant="accent" onClick={() => setAddDialogOpen(true)}>
                      <Plus className="size-4" />
                      Add City
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  {selectedCities.map((city, idx) => (
                    <ClockCard
                      key={city.id}
                      city={city}
                      now={now}
                      onRemove={removeCity}
                      onMoveUp={(id) => reorderCity(id, -1)}
                      onMoveDown={(id) => reorderCity(id, 1)}
                      isFirst={idx === 0}
                      isLast={idx === selectedCities.length - 1}
                      militaryTime={settings.militaryTime}
                      isDragging={draggedId === city.id}
                      isDragOver={dragOverId === city.id && draggedId !== city.id}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                  {canAdd && (
                    <button
                      onClick={() => setAddDialogOpen(true)}
                      className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-separator p-5 transition-colors hover:border-accent/40 hover:bg-control-subtle/30"
                    >
                      <Plus className="size-6 text-tertiary" />
                      <Text variant="small" color="tertiary">
                        Add city
                      </Text>
                    </button>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="meeting-planner" className="h-full">
              <MeetingPlanner
                cities={selectedCities}
                now={now}
                militaryTime={settings.militaryTime}
              />
            </TabsContent>
          </TabsRoot>
        </ScrollArea>
      </SplitView>

      <AddCityDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        selectedIds={selectedIds}
        onAdd={addCity}
        canAdd={canAdd}
      />
    </>
  );
}
