import React, { useEffect, useState } from 'react';

type Facility = { id: number; name: string; description?: string | null; created_at?: string };

export default function AdminFacilityEditor() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  function fetchFacilities() {
    setLoading(true);
    fetch('/api/facilities.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setFacilities(Array.isArray(data) ? data : data?.facilities ?? []))
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false));
  }

  function startCreate() {
    setEditingId(null);
    setFormName('');
    setFormDesc('');
  }

  function startEdit(f: Facility) {
    setEditingId(f.id);
    setFormName(f.name ?? '');
    setFormDesc(f.description ?? '');
  }

  async function save() {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingId == null) {
        // create
        await fetch('/api/facilities.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() }),
        });
      } else {
        // update
        await fetch(`/api/facilities.php?id=${editingId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() }),
        });
      }
      await fetchFacilities();
      setEditingId(null);
      setFormName('');
      setFormDesc('');
      try {
        window.dispatchEvent(new CustomEvent('data-updated'));
      } catch (e) {
        // ignore in non-browser environments
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this facility?')) return;
    setSaving(true);
    try {
      await fetch(`/api/facilities.php?id=${id}`, { method: 'DELETE', credentials: 'include' });
      await fetchFacilities();
      try {
        window.dispatchEvent(new CustomEvent('data-updated'));
      } catch (e) {
        // ignore in non-browser environments
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Facilities (Admin)</h3>
        <div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700"
          >
            New Facility
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {loading ? (
            <div>Loading…</div>
          ) : facilities.length ? (
            facilities.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3 p-3 border rounded-md">
                <div>
                  <div className="font-medium">{f.name}</div>
                  {f.description ? <div className="text-xs text-muted-foreground">{f.description}</div> : null}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(f)}
                    className="px-2 py-1 text-sm rounded bg-yellow-100 text-yellow-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(f.id)}
                    className="px-2 py-1 text-sm rounded bg-red-100 text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No facilities yet.</div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t">
        <h4 className="font-medium">{editingId == null ? 'Create facility' : `Edit facility #${editingId}`}</h4>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Name"
            className="px-3 py-2 border rounded-md"
          />
          <input
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="Short description (optional)"
            className="px-3 py-2 border rounded-md"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving || !formName.trim()}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormName('');
              setFormDesc('');
            }}
            className="px-3 py-1.5 rounded-md bg-gray-100 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
