import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getVisaOrdinal } from '@/utils/visa-helpers';

import { useVisaContext } from '../hooks/use-visa-context';

import { OrdinalBadge } from './ordinal-badge';

// trigger inner layout: [textBlock (vertical, gap=2px)] [chevron 16×16]
// outer: horizontal, alignItems=center, gap=12px, padding=[12,18], cornerRadius=10
function TriggerContent({
  visaType,
  open,
  placeholder,
}: {
  visaType?: Parameters<typeof getVisaOrdinal>[0];
  open: boolean;
  placeholder?: string;
}) {
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <>
      {/* textBlock: vertical, gap=2px, text-left overrides button's default text-align:center */}
      <div className="flex flex-col text-left" style={{ gap: 2 }}>
        {/* "Current Visa" label: 11px, weight=500, muted-foreground */}
        <span
          className="text-muted-foreground"
          style={{ fontSize: 11, fontWeight: 500, lineHeight: '13px' }}
        >
          Current Visa
        </span>
        {/* visaNameRow: horizontal, gap=6px, alignItems=center */}
        <div className="flex items-center" style={{ gap: 6 }}>
          {visaType ? (
            <>
              <OrdinalBadge visaType={visaType} />
              {/* visa name: 15px, weight=700, foreground, lineHeight=20px (= badge height) */}
              <span
                className="text-foreground"
                style={{ fontSize: 15, fontWeight: 700, lineHeight: '20px' }}
              >
                WHV 417
              </span>
            </>
          ) : (
            <span
              className="text-foreground"
              style={{ fontSize: 15, fontWeight: 700, lineHeight: '20px' }}
            >
              {placeholder}
            </span>
          )}
        </div>
      </div>
      {/* chevron: 16×16, muted-foreground */}
      <Chevron
        className="shrink-0 text-muted-foreground"
        style={{ width: 16, height: 16 }}
      />
    </>
  );
}

export function VisaSelector() {
  const [open, setOpen] = useState(false);
  const {
    visas,
    currentVisa,
    setCurrentVisa,
    isLoading: loading,
  } = useVisaContext();

  // shared trigger styles: horizontal, alignItems=center, gap=12px, padding=[12,18], cornerRadius=10
  // border=1px #d1d4db (border-border), fill=#ffffff (bg-card), shadow outer blur=1.75 y=1
  const triggerClass =
    'flex items-center bg-card border border-border rounded-[10px] shadow-sm transition-colors';
  const triggerStyle = { gap: 12, padding: '12px 18px' } as React.CSSProperties;

  if (loading) {
    return (
      <div
        className={`${triggerClass} opacity-50 cursor-not-allowed`}
        style={triggerStyle}
      >
        <div className="flex flex-col text-left" style={{ gap: 2 }}>
          <span
            className="text-muted-foreground"
            style={{ fontSize: 11, fontWeight: 500, lineHeight: '13px' }}
          >
            Current Visa
          </span>
          <div className="flex items-center" style={{ gap: 6 }}>
            <div
              className="bg-muted animate-pulse rounded shrink-0"
              style={{ width: 28, height: 20 }}
            />
            <span
              className="text-foreground"
              style={{ fontSize: 15, fontWeight: 700, lineHeight: '20px' }}
            >
              WHV 417
            </span>
          </div>
        </div>
        <ChevronDown
          className="shrink-0 text-muted-foreground"
          style={{ width: 16, height: 16 }}
        />
      </div>
    );
  }

  if (visas.length === 0) {
    return (
      <div
        className={`${triggerClass} opacity-50 cursor-not-allowed`}
        style={triggerStyle}
      >
        <TriggerContent open={false} placeholder="No visas" />
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`${triggerClass} hover:bg-muted/50 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          style={triggerStyle}
        >
          <TriggerContent
            visaType={currentVisa?.visaType}
            open={open}
            placeholder="Select visa..."
          />
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown panel: fill=#fafafa (bg-popover), cornerRadius=10, padding=4, border, shadow */}
      <DropdownMenuContent
        align="end"
        className="rounded-[10px] border border-border bg-popover shadow-lg p-1"
        style={{ minWidth: 'var(--radix-dropdown-menu-trigger-width)', gap: 2 }}
      >
        {visas.map((visa) => {
          const isSelected = currentVisa?.id === visa.id;
          return (
            <DropdownMenuItem
              key={visa.id}
              onClick={() => setCurrentVisa(visa)}
              // item: cornerRadius=6, padding=[8,12], gap=10, selected=bg-accent
              className={`flex items-center rounded-[6px] cursor-pointer focus:bg-accent ${
                isSelected ? 'bg-accent' : ''
              }`}
              style={{ gap: 10, padding: '8px 12px' }}
            >
              <OrdinalBadge visaType={visa.visaType} />
              {/* item text: 14px, weight=600 if selected else normal */}
              <span
                className="flex-1 text-foreground"
                style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400 }}
              >
                WHV 417
              </span>
              {/* check: 16×16, text-primary if selected else invisible */}
              {isSelected ? (
                <Check
                  className="shrink-0 text-primary"
                  style={{ width: 16, height: 16 }}
                />
              ) : (
                <span className="shrink-0" style={{ width: 16, height: 16 }} />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
