import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Dual input: native color picker + direct hex text entry.
// UI-only redesign — no functional/API changes.
export default function ColorPickerInput({ label, value, onChange }) {
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value);

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </Label>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-[#F4F7F7] p-1.5 shadow-sm ring-1 ring-slate-200/70">
        {/* Visual color picker */}
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <input
            type="color"
            value={isValidHex ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} color picker`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />

          <div
            className="pointer-events-none h-full w-full"
            style={{
              backgroundColor: isValidHex ? value : "#000000",
            }}
          />

          <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10" />
        </div>

        {/* Hex input */}
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-9 border-0 bg-transparent px-2 font-mono text-xs text-[#1A2B48] shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}