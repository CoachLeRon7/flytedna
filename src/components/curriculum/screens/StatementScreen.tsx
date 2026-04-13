import { useState, useEffect, useMemo } from "react";
import { StatementScreenData, StatementSlot } from "@/lib/moduleScreenData";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: StatementScreenData;
  onComplete: (data: string) => void;
  savedData?: string;
  /** All screen data collected so far, keyed by screen index */
  allScreenData?: Record<number, unknown>;
}

/** Extract options for a slot from earlier screen data */
function getSlotOptions(slot: StatementSlot, allScreenData: Record<number, unknown>): string[] {
  const options: string[] = [];

  if (slot.sourceScreen !== undefined && slot.sourceKey && allScreenData[slot.sourceScreen]) {
    const srcData = allScreenData[slot.sourceScreen];

    if (slot.sourceKey === "action-values") {
      // Action screen stores { values: string[], definitions: Record<string,string> }
      const actionData = srcData as { values?: string[]; definitions?: Record<string, string> };
      if (actionData?.values) {
        options.push(...actionData.values);
      }
    } else if (slot.sourceKey === "personal-category") {
      // Personal screen stores Record<string, string> keyed by category index
      const personalData = srcData as Record<string, string>;
      const idx = slot.sourceIndex ?? 0;
      const raw = personalData[String(idx)] || "";
      // Word bank selections are joined with "|||"
      const items = raw.split("|||").filter(Boolean);
      if (items.length > 0) options.push(...items);
    } else if (slot.sourceKey === "workbook-prompt") {
      // Workbook screen stores Record<string, string> keyed by prompt index
      const workbookData = srcData as Record<string, string>;
      const idx = slot.sourceIndex ?? 0;
      const raw = workbookData[String(idx)] || "";
      const items = raw.split("|||").filter(Boolean);
      if (items.length > 0) options.push(...items);
    }
  }

  // Add static options as fallback / additional choices
  if (slot.staticOptions) {
    for (const opt of slot.staticOptions) {
      if (!options.includes(opt)) options.push(opt);
    }
  }

  return options;
}

const StatementScreen = ({ data, onComplete, savedData, allScreenData = {} }: Props) => {
  const slots = data.slots || [];

  // Parse saved selections if returning to this screen
  const parseSaved = (): Record<string, string> => {
    if (!savedData) return {};
    try {
      const parsed = JSON.parse(savedData);
      if (typeof parsed === "object" && parsed.selections) return parsed.selections;
    } catch { /* not JSON, old format */ }
    return {};
  };

  const [selections, setSelections] = useState<Record<string, string>>(parseSaved());
  const [closingText, setClosingText] = useState(() => {
    if (!savedData) return "";
    try {
      const parsed = JSON.parse(savedData);
      return parsed.closingText || "";
    } catch { return ""; }
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Build options for each slot
  const slotOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const slot of slots) {
      map[slot.name] = getSlotOptions(slot, allScreenData);
    }
    return map;
  }, [slots, allScreenData]);

  // Check completion: all slots filled + closing text if required
  const allSlotsFilled = slots.every((s) => (selections[s.name] || "").length > 0);
  const closingFilled = !data.closingPrompt || closingText.trim().length > 5;
  const isComplete = slots.length > 0 ? allSlotsFilled && closingFilled : closingText.trim().length > 20;

  useEffect(() => {
    if (isComplete) {
      onComplete(JSON.stringify({ selections, closingText }));
    }
  }, [isComplete, selections, closingText, onComplete]);

  // Build the rendered statement with inline slots
  const templateParts = useMemo(() => {
    const regex = /\{(\w+)\}/g;
    const parts: { type: "text" | "slot"; content: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(data.template)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: data.template.slice(lastIndex, match.index) });
      }
      parts.push({ type: "slot", content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < data.template.length) {
      parts.push({ type: "text", content: data.template.slice(lastIndex) });
    }
    return parts;
  }, [data.template]);

  const selectOption = (slotName: string, option: string) => {
    setSelections((prev) => ({ ...prev, [slotName]: option }));
    setOpenDropdown(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
      </div>

      {/* Fill-in-the-blank statement */}
      <div className="bg-card border rounded-xl p-5 shadow-card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <PenLine className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Your Statement
          </span>
        </div>

        <div className="text-base leading-loose text-foreground">
          {templateParts.map((part, i) => {
            if (part.type === "text") {
              return <span key={i}>{part.content}</span>;
            }

            const slot = slots.find((s) => s.name === part.content);
            if (!slot) return <span key={i}>{`{${part.content}}`}</span>;

            const selected = selections[slot.name];
            const options = slotOptions[slot.name] || [];
            const isOpen = openDropdown === slot.name;

            return (
              <span key={i} className="relative inline-block mx-0.5">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : slot.name)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border-2 border-dashed transition-all text-base font-semibold",
                    selected
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {selected || slot.label}
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && options.length > 0 && (
                  <div className="absolute top-full left-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-[180px]">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => selectOption(slot.name, opt)}
                        className={cn(
                          "block w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                          selected === opt && "bg-primary/10 text-primary font-semibold"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Optional closing free-text */}
      {data.closingPrompt && (
        <div className="bg-card border rounded-xl p-5 shadow-card">
          <label className="block text-sm font-bold text-foreground mb-2">
            ...{data.closingPrompt}
          </label>
          <Textarea
            placeholder={data.closingPlaceholder || "Write your answer here..."}
            value={closingText}
            onChange={(e) => setClosingText(e.target.value)}
            className="min-h-[80px] resize-none text-base"
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2 text-center">{data.helpText}</p>

      {!isComplete && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {slots.length > 0
            ? "Fill in all blanks to continue"
            : "Write at least 20 characters to continue"}
        </p>
      )}
    </div>
  );
};

export default StatementScreen;
