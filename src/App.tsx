import { useState } from "react";
import {
  Apple,
  BarChart2,
  Clock,
  Flame,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type View = "log" | "dashboard" | "history";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
  serving: string;
}

interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal: MealType;
  food: FoodItem;
  quantity: number;
}

// ─── Food database ─────────────────────────────────────────────────────────────

const FOOD_DB: FoodItem[] = [
  { id:"f1",  name:"Oatmeal",           calories:150, protein:5,  carbs:27, fat:3,  serving:"1 cup cooked" },
  { id:"f2",  name:"Scrambled Eggs",    calories:200, protein:14, carbs:2,  fat:15, serving:"2 eggs" },
  { id:"f3",  name:"Banana",            calories:105, protein:1,  carbs:27, fat:0,  serving:"1 medium" },
  { id:"f4",  name:"Greek Yogurt",      calories:100, protein:17, carbs:6,  fat:1,  serving:"170g" },
  { id:"f5",  name:"Whole Wheat Toast", calories:80,  protein:4,  carbs:15, fat:1,  serving:"1 slice" },
  { id:"f6",  name:"Chicken Breast",    calories:165, protein:31, carbs:0,  fat:4,  serving:"100g" },
  { id:"f7",  name:"Brown Rice",        calories:215, protein:5,  carbs:45, fat:2,  serving:"1 cup cooked" },
  { id:"f8",  name:"Broccoli",          calories:55,  protein:4,  carbs:11, fat:1,  serving:"1 cup" },
  { id:"f9",  name:"Salmon",            calories:208, protein:28, carbs:0,  fat:10, serving:"100g" },
  { id:"f10", name:"Avocado",           calories:234, protein:3,  carbs:12, fat:21, serving:"1 whole" },
  { id:"f11", name:"Lentil Soup",       calories:230, protein:18, carbs:40, fat:1,  serving:"1 bowl" },
  { id:"f12", name:"Caesar Salad",      calories:180, protein:6,  carbs:12, fat:13, serving:"1 bowl" },
  { id:"f13", name:"Apple",             calories:95,  protein:0,  carbs:25, fat:0,  serving:"1 medium" },
  { id:"f14", name:"Almonds",           calories:164, protein:6,  carbs:6,  fat:14, serving:"28g" },
  { id:"f15", name:"Protein Bar",       calories:200, protein:20, carbs:22, fat:7,  serving:"1 bar" },
  { id:"f16", name:"Pasta",             calories:220, protein:8,  carbs:43, fat:1,  serving:"1 cup cooked" },
  { id:"f17", name:"Orange Juice",      calories:110, protein:2,  carbs:26, fat:0,  serving:"240ml" },
  { id:"f18", name:"Coffee (black)",    calories:2,   protein:0,  carbs:0,  fat:0,  serving:"240ml" },
  { id:"f19", name:"Whole Milk",        calories:149, protein:8,  carbs:12, fat:8,  serving:"240ml" },
  { id:"f20", name:"Sweet Potato",      calories:103, protein:2,  carbs:24, fat:0,  serving:"1 medium" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().slice(0,10); }
function daysAgoStr(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0,10);
}
function formatDate(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" });
}
function sumMacro(entries: LogEntry[], key: "calories"|"protein"|"carbs"|"fat") {
  return entries.reduce((a, e) => a + e.food[key] * e.quantity, 0);
}
function pct(v: number, goal: number) { return Math.min(100, Math.round((v/goal)*100)); }

const DAILY_GOAL = { calories:2000, protein:150, carbs:250, fat:65 };
const MEAL_ORDER: MealType[] = ["breakfast","lunch","dinner","snack"];
const MEAL_LABELS: Record<MealType,string> = { breakfast:"Breakfast", lunch:"Lunch", dinner:"Dinner", snack:"Snack" };
const MEAL_COLORS: Record<MealType,string> = {
  breakfast:"bg-amber-100 text-amber-700 border-amber-200",
  lunch:    "bg-green-100  text-green-700  border-green-200",
  dinner:   "bg-blue-100   text-blue-700   border-blue-200",
  snack:    "bg-purple-100 text-purple-700 border-purple-200",
};

// ─── Seed entries ──────────────────────────────────────────────────────────────

const SEED: LogEntry[] = [
  { id:"e1",  date:todayStr(),      meal:"breakfast", food:FOOD_DB[0],  quantity:1 },
  { id:"e2",  date:todayStr(),      meal:"breakfast", food:FOOD_DB[1],  quantity:1 },
  { id:"e3",  date:todayStr(),      meal:"lunch",     food:FOOD_DB[5],  quantity:1 },
  { id:"e4",  date:todayStr(),      meal:"lunch",     food:FOOD_DB[6],  quantity:1 },
  { id:"e5",  date:todayStr(),      meal:"snack",     food:FOOD_DB[12], quantity:1 },
  { id:"e6",  date:daysAgoStr(1),   meal:"breakfast", food:FOOD_DB[3],  quantity:1 },
  { id:"e7",  date:daysAgoStr(1),   meal:"lunch",     food:FOOD_DB[10], quantity:1 },
  { id:"e8",  date:daysAgoStr(1),   meal:"dinner",    food:FOOD_DB[8],  quantity:1 },
  { id:"e9",  date:daysAgoStr(1),   meal:"dinner",    food:FOOD_DB[7],  quantity:1 },
  { id:"e10", date:daysAgoStr(1),   meal:"snack",     food:FOOD_DB[13], quantity:1 },
  { id:"e11", date:daysAgoStr(2),   meal:"breakfast", food:FOOD_DB[4],  quantity:2 },
  { id:"e12", date:daysAgoStr(2),   meal:"lunch",     food:FOOD_DB[11], quantity:1 },
  { id:"e13", date:daysAgoStr(2),   meal:"dinner",    food:FOOD_DB[15], quantity:1 },
  { id:"e14", date:daysAgoStr(3),   meal:"breakfast", food:FOOD_DB[0],  quantity:1 },
  { id:"e15", date:daysAgoStr(3),   meal:"lunch",     food:FOOD_DB[6],  quantity:1 },
  { id:"e16", date:daysAgoStr(3),   meal:"dinner",    food:FOOD_DB[9],  quantity:1 },
];

// ─── MacroBar ──────────────────────────────────────────────────────────────────

function MacroBar({ label, value, goal, unit, color }: {
  label: string; value: number; goal: number; unit: string; color: string;
}) {
  const over = value > goal;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className={cn("font-semibold", over ? "text-destructive" : "text-muted-foreground")}>
          {value}{unit} / {goal}{unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", over ? "bg-destructive" : color)}
          style={{ width: `${pct(value, goal)}%` }}
        />
      </div>
    </div>
  );
}

// ─── CalorieRing ───────────────────────────────────────────────────────────────

function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const over = consumed > goal;
  const dash = Math.min(1, consumed / goal) * circ;
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor"
          strokeWidth="10" className="text-secondary" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
          stroke={over ? "var(--color-destructive)" : "var(--color-fuego-500)"}
          strokeDasharray={`${dash} ${circ}`} />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className={cn("text-xl font-bold", over && "text-destructive")}>{consumed}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">/ {goal} kcal</span>
      </div>
    </div>
  );
}

// ─── AddFoodDialog ─────────────────────────────────────────────────────────────

function AddFoodDialog({ open, defaultMeal, onClose, onAdd }: {
  open: boolean;
  defaultMeal: MealType;
  onClose: () => void;
  onAdd: (e: Omit<LogEntry, "id">) => void;
}) {
  const [query, setQuery]         = useState("");
  const [meal, setMeal]           = useState<MealType>(defaultMeal);
  const [selected, setSelected]   = useState<FoodItem | null>(null);
  const [qty, setQty]             = useState(1);

  function handleOpenChange(v: boolean) {
    if (v) { setMeal(defaultMeal); setSelected(null); setQty(1); setQuery(""); }
    else onClose();
  }

  const results = query.trim()
    ? FOOD_DB.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : FOOD_DB;

  function submit() {
    if (!selected) return;
    onAdd({ date: todayStr(), meal, food: selected, quantity: qty });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden max-h-[90dvh]">
        <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Apple className="size-4" /> Add Food
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1.5 px-5 pb-3 shrink-0 flex-wrap">
          {MEAL_ORDER.map(m => (
            <button key={m} onClick={() => setMeal(m)}
              className={cn("rounded-full border px-3 py-0.5 text-xs font-medium transition-colors",
                meal === m ? MEAL_COLORS[m] : "border-border text-muted-foreground hover:bg-secondary")}>
              {MEAL_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="relative mx-5 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            className="w-full rounded-md border border-input bg-transparent py-1.5 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            placeholder="Search foods…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 min-h-0 mt-2">
          {results.map(food => (
            <button key={food.id} onClick={() => setSelected(food)}
              className={cn("w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors mb-1 border",
                selected?.id === food.id
                  ? "bg-fuego-500/10 border-fuego-300"
                  : "border-transparent hover:bg-secondary")}>
              <div className="flex justify-between items-center">
                <span className="font-medium">{food.name}</span>
                <span className="text-xs font-semibold text-fuego-600">{food.calories} kcal</span>
              </div>
              <div className="flex gap-3 mt-0.5 text-[11px] text-muted-foreground">
                <span>P {food.protein}g</span>
                <span>C {food.carbs}g</span>
                <span>F {food.fat}g</span>
                <span className="ml-auto">{food.serving}</span>
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No foods found</p>
          )}
        </div>

        {selected && (
          <div className="shrink-0 border-t border-border bg-secondary/30 px-5 py-3 flex items-center gap-3">
            <span className="flex-1 text-sm font-medium truncate">{selected.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(q => Math.max(0.5, +(q - 0.5).toFixed(1)))}
                className="size-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary text-sm">−</button>
              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty(q => +(q + 0.5).toFixed(1))}
                className="size-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary text-sm">+</button>
            </div>
            <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
              {Math.round(selected.calories * qty)} kcal
            </span>
          </div>
        )}

        <DialogFooter className="px-5 py-3 shrink-0 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!selected} onClick={submit}
            className="gap-1.5 bg-fuego-500 text-white hover:bg-fuego-600">
            <Plus className="size-3.5" /> Add to Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── LogView ───────────────────────────────────────────────────────────────────

function LogView({ entries, onAdd, onDelete }: {
  entries: LogEntry[];
  onAdd: (m: MealType) => void;
  onDelete: (id: string) => void;
}) {
  const today = entries.filter(e => e.date === todayStr());
  const cal  = sumMacro(today, "calories");
  const prot = sumMacro(today, "protein");
  const carb = sumMacro(today, "carbs");
  const fat  = sumMacro(today, "fat");
  const rem  = DAILY_GOAL.calories - cal;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-5">
      <div className="rounded-xl border border-border bg-card p-4 flex gap-4 flex-wrap items-center">
        <CalorieRing consumed={cal} goal={DAILY_GOAL.calories} />
        <div className="flex-1 space-y-2.5 min-w-0">
          <MacroBar label="Protein" value={prot} goal={DAILY_GOAL.protein} unit="g" color="bg-blue-500" />
          <MacroBar label="Carbs"   value={carb} goal={DAILY_GOAL.carbs}   unit="g" color="bg-amber-500" />
          <MacroBar label="Fat"     value={fat}  goal={DAILY_GOAL.fat}     unit="g" color="bg-green-500" />
        </div>
      </div>

      <p className={cn("text-xs text-center -mt-2", rem < 0 ? "text-destructive" : "text-muted-foreground")}>
        {rem >= 0 ? `${rem} kcal remaining today` : `${Math.abs(rem)} kcal over goal`}
      </p>

      {MEAL_ORDER.map(meal => {
        const mealEntries = today.filter(e => e.meal === meal);
        const mealCal = sumMacro(mealEntries, "calories");
        return (
          <div key={meal}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", MEAL_COLORS[meal])}>
                  {MEAL_LABELS[meal]}
                </span>
                {mealCal > 0 && <span className="text-xs text-muted-foreground">{mealCal} kcal</span>}
              </div>
              <Button variant="ghost" size="xs" onClick={() => onAdd(meal)}
                className="gap-1 text-fuego-600 hover:text-fuego-700 hover:bg-fuego-50">
                <Plus className="size-3" /> Add
              </Button>
            </div>

            {mealEntries.length === 0 ? (
              <button onClick={() => onAdd(meal)}
                className="w-full rounded-lg border border-dashed border-border py-4 text-xs text-muted-foreground hover:bg-secondary/50 transition-colors">
                + Log {MEAL_LABELS[meal].toLowerCase()}
              </button>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                {mealEntries.map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.food.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.food.serving}{entry.quantity !== 1 && ` ×${entry.quantity}`}
                        {" · "}P {Math.round(entry.food.protein * entry.quantity)}g
                        {" "}C {Math.round(entry.food.carbs * entry.quantity)}g
                        {" "}F {Math.round(entry.food.fat * entry.quantity)}g
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-fuego-600 shrink-0">
                      {Math.round(entry.food.calories * entry.quantity)} kcal
                    </span>
                    <button onClick={() => onDelete(entry.id)}
                      className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── DashboardView ─────────────────────────────────────────────────────────────

function DashboardView({ entries }: { entries: LogEntry[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const dateStr = daysAgoStr(6 - i);
    const label = i === 6 ? "Today"
      : new Date(dateStr + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" });
    return { dateStr, label, cal: sumMacro(entries.filter(e => e.date === dateStr), "calories") };
  });
  const maxCal = Math.max(...days.map(d => d.cal), DAILY_GOAL.calories);

  const todayE = entries.filter(e => e.date === todayStr());
  const tCal  = sumMacro(todayE, "calories");
  const tProt = sumMacro(todayE, "protein");
  const tCarb = sumMacro(todayE, "carbs");
  const tFat  = sumMacro(todayE, "fat");

  const mealBreakdown = MEAL_ORDER
    .map(meal => ({ meal, cal: sumMacro(todayE.filter(e => e.meal === meal), "calories") }))
    .filter(m => m.cal > 0);

  const stats = [
    { label: "Calories", val: `${tCal}`,   sub: `/ ${DAILY_GOAL.calories}`, color: "text-fuego-600" },
    { label: "Protein",  val: `${tProt}g`, sub: `/ ${DAILY_GOAL.protein}g`, color: "text-blue-600" },
    { label: "Carbs",    val: `${tCarb}g`, sub: `/ ${DAILY_GOAL.carbs}g`,   color: "text-amber-600" },
    { label: "Fat",      val: `${tFat}g`,  sub: `/ ${DAILY_GOAL.fat}g`,     color: "text-green-600" },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="gap-0 py-4">
            <CardContent className="px-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-xl font-bold leading-snug mt-0.5", s.color)}>{s.val}</p>
              <p className="text-[11px] text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="py-4 gap-2">
        <CardHeader className="px-4 pb-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart2 className="size-4 text-fuego-500" /> 7-Day Calories
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex items-end gap-1.5" style={{ height: 112 }}>
            {days.map(d => {
              const barH = maxCal > 0 ? (d.cal / maxCal) * 88 : 0;
              const isToday = d.dateStr === todayStr();
              const over = d.cal > DAILY_GOAL.calories;
              return (
                <div key={d.dateStr} className="flex flex-col items-center gap-1 flex-1">
                  {d.cal > 0 && (
                    <span className="text-[9px] text-muted-foreground leading-none">{d.cal}</span>
                  )}
                  <div className="w-full flex items-end" style={{ height: 88 }}>
                    <div
                      className={cn("w-full rounded-t-sm transition-all",
                        over ? "bg-destructive/70" : isToday ? "bg-fuego-500" : "bg-fuego-200")}
                      style={{ height: d.cal > 0 ? `${Math.max(barH, 4)}px` : "2px" }} />
                  </div>
                  <span className={cn("text-[10px]",
                    isToday ? "font-bold text-fuego-600" : "text-muted-foreground")}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 text-right">Goal: {DAILY_GOAL.calories} kcal</p>
        </CardContent>
      </Card>

      {mealBreakdown.length > 0 && (
        <Card className="py-4 gap-2">
          <CardHeader className="px-4 pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="size-4 text-fuego-500" /> Today's Meal Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 space-y-2.5">
            {mealBreakdown.map(({ meal, cal }) => (
              <div key={meal} className="flex items-center gap-3">
                <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium w-20 text-center shrink-0", MEAL_COLORS[meal])}>
                  {MEAL_LABELS[meal]}
                </span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-fuego-400 rounded-full"
                    style={{ width: `${pct(cal, tCal || 1)}%` }} />
                </div>
                <span className="text-xs font-medium w-16 text-right text-muted-foreground">{cal} kcal</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── HistoryView ───────────────────────────────────────────────────────────────

function HistoryView({ entries, onDelete }: {
  entries: LogEntry[];
  onDelete: (id: string) => void;
}) {
  const byDate = entries.reduce<Record<string, LogEntry[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort((a, b) => (a < b ? 1 : -1));

  if (dates.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <UtensilsCrossed className="size-10 opacity-30" />
        <p className="text-sm">No food logged yet. Start tracking!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-6">
      {dates.map(date => {
        const dayE = byDate[date];
        const cal  = sumMacro(dayE, "calories");
        const prot = sumMacro(dayE, "protein");
        const carb = sumMacro(dayE, "carbs");
        const fat  = sumMacro(dayE, "fat");
        const isToday = date === todayStr();
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{isToday ? "Today" : formatDate(date)}</span>
                {isToday && (
                  <Badge variant="outline" className="text-fuego-600 border-fuego-300 bg-fuego-50 text-[10px]">
                    Today
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {cal} kcal · P{prot}g C{carb}g F{fat}g
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
              {MEAL_ORDER.map(meal => {
                const mealE = dayE.filter(e => e.meal === meal);
                if (!mealE.length) return null;
                return (
                  <div key={meal}>
                    <div className="px-4 py-1.5 bg-secondary/30 flex items-center gap-2">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", MEAL_COLORS[meal])}>
                        {MEAL_LABELS[meal]}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {sumMacro(mealE, "calories")} kcal
                      </span>
                    </div>
                    {mealE.map(entry => (
                      <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{entry.food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.food.serving}{entry.quantity !== 1 && ` ×${entry.quantity}`}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-fuego-600 shrink-0">
                          {Math.round(entry.food.calories * entry.quantity)} kcal
                        </span>
                        <button onClick={() => onDelete(entry.id)}
                          className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [entries, setEntries]       = useState<LogEntry[]>(SEED);
  const [view, setView]             = useState<View>("log");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>("snack");

  function openAdd(meal: MealType) {
    setActiveMeal(meal);
    setDialogOpen(true);
  }

  function handleAdd(entry: Omit<LogEntry, "id">) {
    setEntries(prev => [...prev, { ...entry, id: `e-${Date.now()}` }]);
  }

  function handleDelete(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  const todayCal = sumMacro(entries.filter(e => e.date === todayStr()), "calories");

  const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "log",       label: "Log",       icon: <UtensilsCrossed className="size-4" /> },
    { id: "dashboard", label: "Dashboard", icon: <BarChart2 className="size-4" /> },
    { id: "history",   label: "History",   icon: <Clock className="size-4" /> },
  ];

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="shrink-0 border-b border-border/60 px-4 py-3 sm:px-6 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-thermal shrink-0">
          <Flame className="size-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-none">Food Tracker</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {todayCal} / {DAILY_GOAL.calories} kcal today
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => openAdd("snack")}
          className="ml-auto gap-1.5 bg-fuego-500 text-white hover:bg-fuego-600"
        >
          <Plus className="size-3.5" /> Add Food
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {view === "log"       && <LogView entries={entries} onAdd={openAdd} onDelete={handleDelete} />}
        {view === "dashboard" && <DashboardView entries={entries} />}
        {view === "history"   && <HistoryView entries={entries} onDelete={handleDelete} />}
      </div>

      {/* Bottom navigation */}
      <nav className="shrink-0 border-t border-border/60 bg-background flex">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              view === n.id ? "text-fuego-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {n.icon}
            {n.label}
          </button>
        ))}
      </nav>

      {/* Add Food Dialog */}
      <AddFoodDialog
        open={dialogOpen}
        defaultMeal={activeMeal}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
