import React, { useEffect, useState } from 'react';

type Facility = { id: number; name: string; description?: string | null };

interface Props {
  /** called whenever selected facility ids change */
  onChange?: (selectedIds: number[]) => void;
  /** called when user clicks Apply (if autoApply is false) */
  onApply?: (selectedIds: number[]) => void;
  /** if true, call onApply automatically when selection changes */
  autoApply?: boolean;
  className?: string;
}

export default function HotelSearchFilter({ onChange, onApply, autoApply = false, className }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/facilities.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.facilities ?? [];
        setFacilities(list);
        const initial: Record<number, boolean> = {};
        list.forEach((f: Facility) => (initial[f.id] = false));
        setSelected(initial);
      })
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map((k) => Number(k));
    onChange?.(ids);
    if (autoApply) onApply?.(ids);
  }, [selected]);

  function toggle(id: number) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function apply() {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map((k) => Number(k));
    onApply?.(ids);
  }

  if (loading) return <div className={className}>Loading facilities…</div>;
  if (!facilities.length) return <div className={className}>No facilities available.</div>;

  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <div className="text-sm font-medium">Filter by facilities</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {facilities.map((f) => (
          <label key={f.id} className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!selected[f.id]}
              onChange={() => toggle(f.id)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="truncate">
              <div className="font-medium">{f.name}</div>
              {f.description ? <div className="text-xs text-muted-foreground truncate">{f.description}</div> : null}
            </div>
          </label>
        ))}
      </div>

      {!autoApply ? (
        <div>
          <button
            type="button"
            onClick={apply}
            className="mt-2 inline-flex items-center px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700"
          >
            Apply
          </button>
        </div>
      ) : null}
    </div>
  );
}
