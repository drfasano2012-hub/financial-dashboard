import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  /** When true, uses integer formatting (no decimals). Default true for $; false for %. */
  integer?: boolean;
}

const formatNumber = (n: number, integer: boolean) =>
  integer
    ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : n.toLocaleString("en-US", { maximumFractionDigits: 2 });

/**
 * A number input that displays values with thousand separators (e.g. "1,200")
 * but reports a clean number to the parent. Strips non-digits on input.
 */
export function CurrencyInput({
  value,
  onChange,
  prefix = "$",
  suffix,
  placeholder = "0",
  className,
  integer = true,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState<string>(value > 0 ? formatNumber(value, integer) : "");

  // Sync external value changes (e.g. "Try sample data") into the display.
  useEffect(() => {
    setDisplay(value > 0 ? formatNumber(value, integer) : "");
  }, [value, integer]);

  const handleChange = (raw: string) => {
    // Allow digits, one dot (if not integer), and strip everything else.
    const cleaned = integer
      ? raw.replace(/[^\d]/g, "")
      : raw.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

    if (cleaned === "" || cleaned === ".") {
      setDisplay(cleaned);
      onChange(0);
      return;
    }

    const num = Number(cleaned);
    if (Number.isNaN(num)) return;

    // Preserve a trailing "." or trailing zeros while typing decimals.
    const endsWithDotOrZero = !integer && /\.\d*0*$/.test(cleaned);
    setDisplay(endsWithDotOrZero ? cleaned : formatNumber(num, integer));
    onChange(num);
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
          {prefix}
        </span>
      )}
      <Input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-12 text-base", prefix && "pl-8", suffix && "pr-10", className)}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
