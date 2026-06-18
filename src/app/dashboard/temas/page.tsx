"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ThemeRow } from "@/types";

const DEFAULT_COLORS = {
  lightColor: "#EBECD0",
  darkColor: "#739552",
  selectedLightColor: "#B7C98D",
  selectedDarkColor: "#5D7A44",
  legalMoveDotColor: "rgba(0,0,0,0.18)",
  legalMoveCaptureColor: "rgba(0,0,0,0.25)",
  fileRankColor: "#4B4847",
};

const COLOR_LABELS: Record<string, string> = {
  lightColor: "Casillas claras",
  darkColor: "Casillas oscuras",
  selectedLightColor: "Seleccion clara",
  selectedDarkColor: "Seleccion oscura",
  legalMoveDotColor: "Punto movimiento",
  legalMoveCaptureColor: "Captura",
  fileRankColor: "Etiquetas",
};

function colorToHex(c: string): string {
  if (c.startsWith("#")) return c;
  // Convert rgba to hex for input display (approximate)
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    return (
      "#" +
      [m[1], m[2], m[3]]
        .map((n) => parseInt(n).toString(16).padStart(2, "0"))
        .join("")
    );
  }
  return "#000000";
}

function hexToRgba(hex: string, alpha: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface ThemeFormData {
  name: string;
  lightColor: string;
  darkColor: string;
  selectedLightColor: string;
  selectedDarkColor: string;
  legalMoveDotColor: string;
  legalMoveCaptureColor: string;
  fileRankColor: string;
}

const EMPTY_FORM: ThemeFormData = {
  name: "",
  ...DEFAULT_COLORS,
};

// Map form field names back to rgba defaults
const RGBA_FIELDS = new Set(["legalMoveDotColor", "legalMoveCaptureColor"]);

function ThemeEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: ThemeFormData;
  onSave: (data: ThemeFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ThemeFormData>(initial);
  const [saving, setSaving] = useState(false);

  const setColor =
    (field: keyof ThemeFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (RGBA_FIELDS.has(field)) {
        const alpha = field === "legalMoveDotColor" ? "0.18" : "0.25";
        val = hexToRgba(val, alpha);
      }
      setForm((prev) => ({ ...prev, [field]: val }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const hexForm: Record<string, string> = {};
  for (const key of Object.keys(DEFAULT_COLORS)) {
    hexForm[key] = colorToHex(form[key as keyof ThemeFormData]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-white mb-1">
          Nombre del tema
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full px-3 py-2 bg-deep-charcoal text-white rounded-md border border-white/20 text-sm focus:outline-none focus:border-chess-green"
          placeholder="Mi tema oscuro"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.keys(DEFAULT_COLORS).map((key) => (
          <div key={key}>
            <label className="block text-xs text-text-secondary mb-1">
              {COLOR_LABELS[key]}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hexForm[key]}
                onChange={setColor(key as keyof ThemeFormData)}
                className="w-9 h-9 rounded cursor-pointer border border-white/20 bg-transparent"
              />
              <input
                type="text"
                value={form[key as keyof ThemeFormData]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                className="flex-1 px-2 py-1.5 bg-deep-charcoal text-white/80 rounded-md border border-white/20 text-xs font-mono focus:outline-none focus:border-chess-green"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar tema"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-transparent text-text-secondary text-sm font-semibold rounded-md border border-white/20 hover:bg-white/10 hover:text-white transition-all"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function MiniBoardPreview({ form }: { form: ThemeFormData }) {
  const size = 16;
  const pieces = ["r", "n", "b", "q", "k", "b", "n", "r"];

  return (
    <svg
      width={size * 8 + 4}
      height={size * 8 + 4}
      viewBox={`0 0 ${size * 8 + 4} ${size * 8 + 4}`}
      className="rounded border border-white/10"
    >
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const isLight = (row + col) % 2 === 0;
          return (
            <rect
              key={`${row}-${col}`}
              x={col * size + 2}
              y={row * size + 2}
              width={size}
              height={size}
              fill={isLight ? form.lightColor : form.darkColor}
            />
          );
        }),
      )}
      {pieces.map((p, col) => (
        <text
          key={col}
          x={col * size + 2 + size / 2}
          y={size + size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size - 4}
          fill={form.darkColor}
        >
          {p}
        </text>
      ))}
    </svg>
  );
}

export default function TemasPage() {
  const router = useRouter();
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<ThemeFormData>(EMPTY_FORM);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => {
        if (r.status === 401) {
          router.push("/api/auth?redirect=/dashboard/temas");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setThemes(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setUser(d);
      })
      .catch(() => {});
  }, [router]);

  const loadThemes = useCallback(
    (t: (data: ThemeRow[]) => void) => {
      fetch("/api/themes")
        .then((r) => {
          if (r.status === 401) {
            router.push("/api/auth?redirect=/dashboard/temas");
            return Promise.reject();
          }
          return r.json();
        })
        .then((data) => t(data))
        .catch(() => {});
    },
    [router],
  );

  const handleCreate = async (data: ThemeFormData) => {
    const res = await fetch("/api/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowEditor(false);
      setEditingForm(EMPTY_FORM);
      loadThemes(setThemes);
    }
  };

  const handleUpdate = async (data: ThemeFormData) => {
    if (!editingId) return;
    const res = await fetch(`/api/themes?id=${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setEditingId(null);
      setShowEditor(false);
      setEditingForm(EMPTY_FORM);
      loadThemes(setThemes);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este tema?")) return;
    const res = await fetch(`/api/themes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      loadThemes(setThemes);
    }
  };

  const handleSetDefault = async (id: string, isDefault: boolean) => {
    await fetch(`/api/themes?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault }),
    });
    loadThemes(setThemes);
  };

  const startEdit = (theme: ThemeRow) => {
    setEditingId(theme.id);
    setEditingForm({
      name: theme.name,
      lightColor: theme.light_color,
      darkColor: theme.dark_color,
      selectedLightColor: theme.selected_light_color,
      selectedDarkColor: theme.selected_dark_color,
      legalMoveDotColor: theme.legal_move_dot_color,
      legalMoveCaptureColor: theme.legal_move_capture_color,
      fileRankColor: theme.file_rank_color,
    });
    setShowEditor(true);
  };

  const defaultTheme = themes.find((t) => t.is_default);
  const markdownTheme = defaultTheme ? `&theme=${defaultTheme.id}` : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-chess-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-charcoal">
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold text-off-white tracking-tight"
        >
          Readme<span className="text-chess-green">Chess</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-text-secondary font-semibold hover:text-white transition-colors"
          >
            Volver al Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-16">
        <div className="mb-8">
          <h1 className="text-[36px] font-extrabold leading-10 text-white">
            Temas
          </h1>
          <p className="mt-2 text-sm text-text-secondary leading-5">
            Crea y gestiona temas para personalizar la apariencia de tu tablero
            de ajedrez.
          </p>
        </div>

        {/* Theme usage info */}
        {defaultTheme && user && (
          <div className="bg-near-black rounded-lg p-5 shadow-card mb-8">
            <h2 className="text-sm font-extrabold text-white leading-4 mb-2">
              Tema activo:{" "}
              <span className="text-chess-green">{defaultTheme.name}</span>
            </h2>
            <p className="text-xs text-text-tertiary mb-3">
              Tu tablero se mostrara con este tema en tu README. Agrega
              <code className="bg-deep-charcoal text-bright-mint px-1 py-0.5 rounded text-xs font-mono mx-1">
                ?theme=ID
              </code>{" "}
              manualmente si usas una URL personalizada.
            </p>
            <div className="flex gap-3 items-center">
              <MiniBoardPreview
                form={{
                  name: defaultTheme.name,
                  lightColor: defaultTheme.light_color,
                  darkColor: defaultTheme.dark_color,
                  selectedLightColor: defaultTheme.selected_light_color,
                  selectedDarkColor: defaultTheme.selected_dark_color,
                  legalMoveDotColor: defaultTheme.legal_move_dot_color,
                  legalMoveCaptureColor: defaultTheme.legal_move_capture_color,
                  fileRankColor: defaultTheme.file_rank_color,
                }}
              />
              <pre className="bg-deep-charcoal text-bright-mint p-3 rounded-md text-xs overflow-x-auto border border-white/5 font-mono flex-1">
                {`[![ReadmeChess](https://github-readme-chess.vercel.app/api/chessboard?user=${user?.username}${markdownTheme})](https://github-readme-chess.vercel.app/dashboard)`}
              </pre>
            </div>
          </div>
        )}

        {/* Theme list */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white leading-4">
              Tus temas
              <span className="ml-2 text-text-tertiary font-normal">
                ({themes.length})
              </span>
            </h2>
            {!showEditor && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditingForm(EMPTY_FORM);
                  setShowEditor(true);
                }}
                className="px-3 py-1.5 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover transition-colors"
              >
                + Nuevo tema
              </button>
            )}
          </div>

          {themes.length === 0 && !showEditor && (
            <div className="bg-near-black rounded-lg p-8 shadow-card text-center">
              <p className="text-sm text-text-secondary leading-5">
                No tienes temas creados. Crea tu primer tema para personalizar
                tu tablero.
              </p>
            </div>
          )}

          {showEditor && (
            <div className="bg-near-black rounded-lg p-5 shadow-card">
              <h3 className="text-sm font-extrabold text-white leading-4 mb-4">
                {editingId ? "Editar tema" : "Nuevo tema"}
              </h3>
              <ThemeEditor
                initial={editingForm}
                onSave={editingId ? handleUpdate : handleCreate}
                onCancel={() => {
                  setShowEditor(false);
                  setEditingId(null);
                  setEditingForm(EMPTY_FORM);
                }}
              />
            </div>
          )}

          {themes.map((theme) => {
            const isDefault = theme.is_default;
            return (
              <div
                key={theme.id}
                className="bg-near-black rounded-lg p-4 shadow-card flex items-center gap-4"
              >
                <MiniBoardPreview
                  form={{
                    name: theme.name,
                    lightColor: theme.light_color,
                    darkColor: theme.dark_color,
                    selectedLightColor: theme.selected_light_color,
                    selectedDarkColor: theme.selected_dark_color,
                    legalMoveDotColor: theme.legal_move_dot_color,
                    legalMoveCaptureColor: theme.legal_move_capture_color,
                    fileRankColor: theme.file_rank_color,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-4 truncate">
                    {theme.name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-tertiary leading-4">
                    {theme.light_color} / {theme.dark_color}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSetDefault(theme.id, !isDefault)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                      isDefault
                        ? "bg-chess-green/20 text-chess-green border-chess-green/40"
                        : "bg-transparent text-text-secondary border-white/20 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {isDefault ? "Predeterminado" : "Usar"}
                  </button>
                  <button
                    onClick={() => startEdit(theme)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-transparent text-text-secondary border border-white/20 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(theme.id)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-transparent text-error-red border border-white/20 hover:bg-white/10 transition-all"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage info */}
        <div className="bg-near-black rounded-lg p-5 shadow-card">
          <h2 className="text-sm font-extrabold text-white leading-4 mb-2">
            Como usar tus temas
          </h2>
          <p className="text-xs text-text-secondary leading-5">
            El tema predeterminado se aplicara automaticamente a tu tablero en
            el README. Si quieres usar un tema especifico en una URL, agrega
            <code className="bg-deep-charcoal text-bright-mint px-1 py-0.5 rounded text-xs font-mono mx-1">
              &amp;theme=ID_DEL_TEMA
            </code>{" "}
            a la URL del tablero.
          </p>
        </div>
      </main>
    </div>
  );
}
