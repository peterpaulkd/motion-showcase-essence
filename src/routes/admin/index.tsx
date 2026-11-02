import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminStats,
  useAnnouncements,
  useCommittee,
  useCreateAnnouncement,
  useCreateEvent,
  useCreateMember,
  useDeleteAnnouncement,
  useDeleteEvent,
  useDeleteGalleryImage,
  useDeleteMember,
  useEvents,
  useGallery,
  useUpdateAnnouncement,
  useUpdateEvent,
  useUpdateGalleryImage,
  useUpdateMember,
  useUploadAnnouncementCover,
  useUploadEventCover,
  useUploadGallery,
  useUploadMemberPhoto,
  type AnnouncementOut,
  type CommitteeMemberOut,
  type EventOut,
  type GalleryImageOut,
} from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Tab = "overview" | "events" | "gallery" | "cabinet" | "announcements";

/* ─────────────────────── Shared small components ─────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string | undefined;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <Icon size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold font-display">
            {value ?? "—"}
          </p>
          <p className="text-xs text-foreground/50 uppercase font-semibold">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Preview Modal ─────────────────────── */

interface PreviewProps {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
}

function PreviewModal({
  title,
  onClose,
  onConfirm,
  confirmLabel = "Confirm & save",
  loading = false,
  children,
}: PreviewProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-full max-w-2xl flex-col max-h-[90vh] rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase text-terracotta">
              Preview
            </p>
            <h2 className="font-display text-xl font-bold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Back to edit
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? "Saving…" : confirmLabel}
            <Check size={14} className="ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Confirm Delete Dialog ─────────────────────── */

function ConfirmDelete({
  label,
  onCancel,
  onConfirm,
  loading,
}: {
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <Trash2 size={18} className="text-destructive" />
        </div>
        <h2 className="font-display text-lg font-bold">Delete {label}?</h2>
        <p className="mt-1 text-sm text-foreground/55">
          This action cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Events Tab ─────────────────────── */

function EventsTab() {
  const { data, isLoading } = useEvents(1, 50);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const uploadCover = useUploadEventCover();

  type EventForm = {
    title: string;
    venue: string;
    start_date: string;
    end_date: string;
    status: EventOut["status"];
    description: string;
    is_featured: boolean;
    registration_link: string;
  };

  const emptyForm: EventForm = {
    title: "",
    venue: "",
    start_date: "",
    end_date: "",
    status: "upcoming",
    description: "",
    is_featured: false,
    registration_link: "",
  };

  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventOut | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");

  function openAdd() {
    setForm(emptyForm);
    setEditId(null);
    setCoverFile(null);
    setCoverPreview(null);
    setApiError("");
    setFormOpen(true);
  }

  function openEdit(ev: EventOut) {
    setForm({
      title: ev.title,
      venue: ev.venue ?? "",
      start_date: ev.start_date.split("T")[0],
      end_date: ev.end_date ? ev.end_date.split("T")[0] : "",
      status: ev.status,
      description: ev.description ?? "",
      is_featured: ev.is_featured,
      registration_link: ev.registration_link ?? "",
    });
    setEditId(ev.id);
    setCoverFile(null);
    setCoverPreview(ev.cover_image_url);
    setApiError("");
    setFormOpen(true);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleConfirm() {
    setApiError("");
    try {
      let eventId = editId;

      if (editId) {
        await updateEvent.mutateAsync({ id: editId, data: form });
      } else {
        const created = await createEvent.mutateAsync(form);
        eventId = created.id;
      }

      if (coverFile && eventId) {
        await uploadCover.mutateAsync({ id: eventId, file: coverFile });
      }

      setPreviewOpen(false);
      setFormOpen(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An error occurred");
      setPreviewOpen(false);
    }
  }

  const isPending =
    createEvent.isPending || updateEvent.isPending || uploadCover.isPending;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Events</h2>
        <Button size="sm" onClick={openAdd}>
          <Plus size={14} className="mr-1.5" /> Add event
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle size={14} className="shrink-0" />
          {apiError}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-secondary/50"
            />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/20 py-14 text-center">
          <Calendar
            size={32}
            className="mx-auto mb-3 text-foreground/25"
          />
          <p className="text-sm text-foreground/40">No events yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {data.items.map((ev) => (
            <div
              key={ev.id}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
            >
              {/* Cover thumbnail */}
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                {ev.cover_image_url ? (
                  <img
                    src={ev.cover_image_url}
                    alt={ev.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Calendar size={16} className="text-foreground/25" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-snug truncate">
                  {ev.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-foreground/50">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(ev.start_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {ev.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {ev.venue}
                    </span>
                  )}
                  <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">
                    {ev.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(ev)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget(ev)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex w-full max-w-lg flex-col max-h-[90vh] rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase text-terracotta">
                  Admin · Events
                </p>
                <h2 className="font-display text-xl font-bold">
                  {editId ? "Edit event" : "Add new event"}
                </h2>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 grid gap-3">
              <input
                className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="Event title *"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      status: e.target.value as EventOut["status"],
                    }))
                  }
                >
                  {["upcoming", "ongoing", "completed", "cancelled"].map(
                    (s) => (
                      <option key={s} value={s} className="capitalize">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    )
                  )}
                </select>
                <input
                  className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  placeholder="Venue / Location"
                  value={form.venue}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, venue: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] uppercase text-foreground/45 font-semibold">
                    Start date *
                  </label>
                  <input
                    type="date"
                    className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, start_date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase text-foreground/45 font-semibold">
                    End date
                  </label>
                  <input
                    type="date"
                    className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, end_date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <input
                className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="Registration link (optional)"
                value={form.registration_link}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    registration_link: e.target.value,
                  }))
                }
              />
              <textarea
                className="min-h-24 rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
                placeholder="Event description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
              {/* Cover image */}
              <label className="group flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-primary/30 bg-secondary/30 px-4 py-3 text-sm transition-colors hover:border-primary/50">
                <Upload size={15} className="shrink-0 text-foreground/50" />
                <span className="text-foreground/60">
                  {coverFile
                    ? coverFile.name
                    : coverPreview
                    ? "Replace cover image"
                    : "Upload cover image (optional)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleCoverChange}
                />
              </label>
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-32 w-full rounded-md object-cover"
                />
              )}
              {/* Featured toggle */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      is_featured: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-primary rounded"
                />
                <span className="text-sm text-foreground/70">
                  Mark as featured event
                </span>
              </label>
            </div>
            <div className="flex gap-3 border-t border-border px-6 py-4 shrink-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (!form.title || !form.start_date) return;
                  setPreviewOpen(true);
                }}
                disabled={!form.title || !form.start_date}
              >
                Preview <Eye size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewOpen && (
        <PreviewModal
          title={editId ? "Edit event preview" : "New event preview"}
          onClose={() => setPreviewOpen(false)}
          onConfirm={handleConfirm}
          loading={isPending}
        >
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt={form.title}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="aspect-[16/9] w-full bg-secondary/60 grid place-items-center">
                <span className="text-[10px] uppercase text-foreground/30 font-semibold tracking-widest">
                  Event
                </span>
              </div>
            )}
            <div className="p-5">
              <span className="text-[10px] font-bold uppercase text-terracotta">
                {form.status}
              </span>
              <h3 className="mt-1 font-display text-xl font-bold">
                {form.title || "Untitled event"}
              </h3>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground/55">
                {form.start_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(form.start_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                {form.venue && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {form.venue}
                  </span>
                )}
              </div>
              {form.description && (
                <p className="mt-3 text-sm leading-6 text-foreground/65">
                  {form.description}
                </p>
              )}
            </div>
          </div>
        </PreviewModal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDelete
          label={`"${deleteTarget.title}"`}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteEvent.isPending}
          onConfirm={async () => {
            await deleteEvent.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────── Gallery Tab ─────────────────────── */

function GalleryTab() {
  const { data, isLoading } = useGallery(1, 60);
  const uploadGallery = useUploadGallery();
  const updateImage = useUpdateGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState("fieldwork");
  const [editTarget, setEditTarget] = useState<GalleryImageOut | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<GalleryImageOut | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [apiError, setApiError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  async function handleUploadConfirm() {
    setApiError("");
    try {
      await uploadGallery.mutateAsync({ files, category });
      setUploadOpen(false);
      setFiles([]);
      setPreviews([]);
      setCategory("fieldwork");
      setPreviewOpen(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Upload failed");
      setPreviewOpen(false);
    }
  }

  async function handleCaptionSave() {
    if (!editTarget) return;
    setApiError("");
    try {
      await updateImage.mutateAsync({
        id: editTarget.id,
        caption: editCaption,
        category: editCategory,
      });
      setEditTarget(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Gallery</h2>
        <Button
          size="sm"
          onClick={() => {
            setFiles([]);
            setPreviews([]);
            setCategory("fieldwork");
            setApiError("");
            setUploadOpen(true);
          }}
        >
          <Upload size={14} className="mr-1.5" /> Upload photos
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle size={14} className="shrink-0" />
          {apiError}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-secondary/50"
            />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/20 py-14 text-center">
          <ImageIcon
            size={32}
            className="mx-auto mb-3 text-foreground/25"
          />
          <p className="text-sm text-foreground/40">No photos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-secondary"
            >
              <img
                src={photo.image_url}
                alt={photo.caption ?? "Gallery photo"}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              {/* Caption overlay */}
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/70 p-2 text-xs text-white transition-transform duration-200 group-hover:translate-y-0">
                <p className="truncate font-medium">
                  {photo.caption || "No caption"}
                </p>
                <p className="text-white/60">{photo.category}</p>
              </div>
              {/* Action buttons */}
              <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditTarget(photo);
                    setEditCaption(photo.caption ?? "");
                    setEditCategory(photo.category);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-background/90 text-foreground/70 backdrop-blur hover:text-primary transition-colors"
                  title="Edit caption"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => setDeleteTarget(photo)}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-background/90 text-foreground/70 backdrop-blur hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex w-full max-w-md flex-col max-h-[90vh] rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase text-terracotta">
                  Media vault
                </p>
                <h2 className="font-display text-xl font-bold">
                  Upload photos
                </h2>
              </div>
              <button
                onClick={() => setUploadOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 grid gap-4">
              <label className="grid min-h-36 cursor-pointer place-items-center rounded-md border border-dashed border-primary/30 bg-secondary/30 p-6 text-center transition-colors hover:border-primary/50">
                {previews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {previews.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt=""
                        className="aspect-square w-full rounded object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <span>
                    <Camera className="mx-auto mb-2 text-foreground/40" />
                    <strong className="block text-sm">
                      Choose photos or drop here
                    </strong>
                    <span className="mt-1 block text-xs text-foreground/50">
                      JPG, PNG · up to 8 MB each · multiple allowed
                    </span>
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-foreground/50">
                  Category
                </label>
                <input
                  className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  placeholder="e.g. fieldwork, symposium, workshop"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 border-t border-border px-6 py-4 shrink-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!files.length}
                onClick={() => {
                  if (files.length) setPreviewOpen(true);
                }}
              >
                Preview <Eye size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload preview */}
      {previewOpen && files.length > 0 && (
        <PreviewModal
          title={`Upload ${files.length} photo${files.length > 1 ? "s" : ""}`}
          onClose={() => setPreviewOpen(false)}
          onConfirm={handleUploadConfirm}
          loading={uploadGallery.isPending}
        >
          <div className="space-y-3">
            <p className="text-sm text-foreground/60">
              Category: <strong>{category}</strong>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt={`Preview ${i + 1}`}
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))}
            </div>
          </div>
        </PreviewModal>
      )}

      {/* Edit caption modal */}
      {editTarget && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">Edit photo</h2>
              <button
                onClick={() => setEditTarget(null)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <img
              src={editTarget.image_url}
              alt=""
              className="mb-4 aspect-video w-full rounded-md object-cover"
            />
            <div className="grid gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-foreground/50">
                  Caption
                </label>
                <input
                  className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  placeholder="Describe this photo…"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-foreground/50">
                  Category
                </label>
                <input
                  className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  placeholder="e.g. fieldwork"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCaptionSave}
                disabled={updateImage.isPending}
              >
                {updateImage.isPending ? "Saving…" : "Save caption"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDelete
          label="this photo"
          onCancel={() => setDeleteTarget(null)}
          loading={deleteImage.isPending}
          onConfirm={async () => {
            await deleteImage.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────── Cabinet Tab ─────────────────────── */

function CabinetTab() {
  const { data: members, isLoading } = useCommittee();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const uploadPhoto = useUploadMemberPhoto();

  const emptyForm = {
    full_name: "",
    position: "",
    bio: "",
    email: "",
    order_index: 0,
    is_active: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<CommitteeMemberOut | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");

  function openAdd() {
    setForm({ ...emptyForm, order_index: (members?.length ?? 0) + 1 });
    setEditId(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setApiError("");
    setFormOpen(true);
  }

  function openEdit(m: CommitteeMemberOut) {
    setForm({
      full_name: m.full_name,
      position: m.position,
      bio: m.bio ?? "",
      email: m.email ?? "",
      order_index: m.order_index,
      is_active: m.is_active,
    });
    setEditId(m.id);
    setPhotoFile(null);
    setPhotoPreview(m.photo_url);
    setApiError("");
    setFormOpen(true);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleConfirm() {
    setApiError("");
    try {
      let memberId = editId;
      const { is_active, ...createData } = form;

      if (editId) {
        await updateMember.mutateAsync({ id: editId, data: form });
      } else {
        const created = await createMember.mutateAsync(createData);
        memberId = created.id;
      }

      if (photoFile && memberId) {
        await uploadPhoto.mutateAsync({ id: memberId, file: photoFile });
      }

      setPreviewOpen(false);
      setFormOpen(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An error occurred");
      setPreviewOpen(false);
    }
  }

  const isPending =
    createMember.isPending ||
    updateMember.isPending ||
    uploadPhoto.isPending;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Cabinet Members</h2>
        <Button size="sm" onClick={openAdd}>
          <Plus size={14} className="mr-1.5" /> Add member
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle size={14} className="shrink-0" />
          {apiError}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-secondary/50"
            />
          ))}
        </div>
      ) : !members?.length ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/20 py-14 text-center">
          <Users size={32} className="mx-auto mb-3 text-foreground/25" />
          <p className="text-sm text-foreground/40">No cabinet members yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {members.map((m, i) => (
            <div
              key={m.id}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
            >
              {/* Photo */}
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-secondary ring-2 ring-border">
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-foreground/25">
                    {m.full_name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{m.full_name}</p>
                  {i < 3 && (
                    <span className="shrink-0 rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] font-bold uppercase text-terracotta">
                      Top 3
                    </span>
                  )}
                  {!m.is_active && (
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-foreground/40">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-terracotta">{m.position}</p>
                {m.email && (
                  <p className="mt-0.5 text-xs text-foreground/45 flex items-center gap-1">
                    <Mail size={9} />
                    {m.email}
                  </p>
                )}
              </div>

              {/* Order */}
              <span className="text-sm font-mono text-foreground/30">
                #{m.order_index}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(m)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget(m)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex w-full max-w-md flex-col max-h-[90vh] rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase text-terracotta">
                  Admin · Cabinet
                </p>
                <h2 className="font-display text-xl font-bold">
                  {editId ? "Edit member" : "Add member"}
                </h2>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 grid gap-3">
              {/* Photo upload */}
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-md border border-dashed border-primary/30 bg-secondary/30 p-5 transition-colors hover:border-primary/50">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-secondary ring-2 ring-border">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Photo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Camera size={24} className="text-foreground/25" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-foreground/55">
                  {photoFile ? photoFile.name : "Click to upload photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </label>

              <input
                className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="Full name *"
                value={form.full_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, full_name: e.target.value }))
                }
              />
              <input
                className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="Position / Role *"
                value={form.position}
                onChange={(e) =>
                  setForm((p) => ({ ...p, position: e.target.value }))
                }
              />
              <input
                type="email"
                className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="Email address (optional)"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-foreground/50">
                  Display order (lower = first)
                </label>
                <input
                  type="number"
                  min={1}
                  className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  value={form.order_index}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      order_index: Number(e.target.value),
                    }))
                  }
                />
                <p className="mt-1 text-[11px] text-foreground/40">
                  Members 1–3 are shown prominently; the rest appear in the
                  dropdown.
                </p>
              </div>
              <textarea
                className="min-h-20 rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
                placeholder="Short bio (optional)"
                value={form.bio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bio: e.target.value }))
                }
              />
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      is_active: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-primary rounded"
                />
                <span className="text-sm text-foreground/70">Active member</span>
              </label>
            </div>
            <div className="flex gap-3 border-t border-border px-6 py-4 shrink-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (!form.full_name || !form.position) return;
                  setPreviewOpen(true);
                }}
                disabled={!form.full_name || !form.position}
              >
                Preview <Eye size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewOpen && (
        <PreviewModal
          title={editId ? "Edit member preview" : "New member preview"}
          onClose={() => setPreviewOpen(false)}
          onConfirm={handleConfirm}
          loading={isPending}
        >
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-secondary ring-2 ring-border">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-foreground/25">
                  {form.full_name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-lg">
                {form.full_name || "Name"}
              </p>
              <p className="text-sm text-terracotta">{form.position}</p>
              {form.email && (
                <p className="mt-1 text-xs text-foreground/50">{form.email}</p>
              )}
              {form.bio && (
                <p className="mt-2 text-sm text-foreground/65">{form.bio}</p>
              )}
              <p className="mt-2 text-xs text-foreground/40">
                Display order: #{form.order_index} ·{" "}
                {form.order_index <= 3
                  ? "shown in top 3"
                  : "shown in dropdown"}
              </p>
            </div>
          </div>
        </PreviewModal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDelete
          label={deleteTarget.full_name}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMember.isPending}
          onConfirm={async () => {
            await deleteMember.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────── Announcements Tab ─────────────────────── */

function AnnouncementsTab() {
  const { data, isLoading } = useAnnouncements(1, 50);
  const createAnn = useCreateAnnouncement();
  const updateAnn = useUpdateAnnouncement();
  const deleteAnn = useDeleteAnnouncement();
  const uploadCover = useUploadAnnouncementCover();

  const emptyForm = {
    title: "",
    content: "",
    excerpt: "",
    status: "draft" as const,
    is_featured: false,
  };

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<AnnouncementOut | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");

  function openAdd() {
    setForm(emptyForm);
    setEditId(null);
    setCoverFile(null);
    setCoverPreview(null);
    setApiError("");
    setFormOpen(true);
  }

  function openEdit(ann: AnnouncementOut) {
    setForm({
      title: ann.title,
      content: ann.content,
      excerpt: ann.excerpt ?? "",
      status: ann.status,
      is_featured: ann.is_featured,
    });
    setEditId(ann.id);
    setCoverFile(null);
    setCoverPreview(ann.cover_image_url);
    setApiError("");
    setFormOpen(true);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleConfirm() {
    setApiError("");
    try {
      let annId = editId;
      if (editId) {
        await updateAnn.mutateAsync({ id: editId, data: form });
      } else {
        const created = await createAnn.mutateAsync(form);
        annId = created.id;
      }
      if (coverFile && annId) {
        await uploadCover.mutateAsync({ id: annId, file: coverFile });
      }
      setPreviewOpen(false);
      setFormOpen(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An error occurred");
      setPreviewOpen(false);
    }
  }

  const isPending =
    createAnn.isPending || updateAnn.isPending || uploadCover.isPending;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Announcements</h2>
        <Button size="sm" onClick={openAdd}>
          <Plus size={14} className="mr-1.5" /> New announcement
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle size={14} className="shrink-0" />
          {apiError}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-secondary/50"
            />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/20 py-14 text-center">
          <Megaphone size={32} className="mx-auto mb-3 text-foreground/25" />
          <p className="text-sm text-foreground/40">No announcements yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {data.items.map((ann) => (
            <div
              key={ann.id}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
            >
              {ann.cover_image_url && (
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <img
                    src={ann.cover_image_url}
                    alt={ann.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{ann.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      ann.status === "published"
                        ? "bg-sage/15 text-sage"
                        : "bg-secondary text-foreground/40"
                    }`}
                  >
                    {ann.status}
                  </span>
                  {ann.is_featured && (
                    <span className="shrink-0 rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] font-bold uppercase text-terracotta">
                      Featured
                    </span>
                  )}
                </div>
                {ann.excerpt && (
                  <p className="mt-0.5 text-xs text-foreground/50 line-clamp-1">
                    {ann.excerpt}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-foreground/35">
                  {new Date(ann.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => openEdit(ann)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget(ann)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex w-full max-w-lg flex-col max-h-[90vh] rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase text-terracotta">
                  Admin · Announcements
                </p>
                <h2 className="font-display text-xl font-bold">
                  {editId ? "Edit announcement" : "New announcement"}
                </h2>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 grid gap-3">
              <input
                className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="Title *"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
              <input
                className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="Short excerpt (optional)"
                value={form.excerpt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, excerpt: e.target.value }))
                }
              />
              <textarea
                className="min-h-32 rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
                placeholder="Full content *"
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
              />
              <select
                className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status: e.target.value as "draft" | "published",
                  }))
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      is_featured: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-primary rounded"
                />
                <span className="text-sm text-foreground/70">
                  Mark as featured
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-primary/30 bg-secondary/30 px-4 py-3 text-sm transition-colors hover:border-primary/50">
                <Upload size={15} className="shrink-0 text-foreground/50" />
                <span className="text-foreground/60">
                  {coverFile
                    ? coverFile.name
                    : coverPreview
                    ? "Replace cover image"
                    : "Upload cover image (optional)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleCoverChange}
                />
              </label>
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="h-32 w-full rounded-md object-cover"
                />
              )}
            </div>
            <div className="flex gap-3 border-t border-border px-6 py-4 shrink-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (!form.title || !form.content) return;
                  setPreviewOpen(true);
                }}
                disabled={!form.title || !form.content}
              >
                Preview <Eye size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewOpen && (
        <PreviewModal
          title={editId ? "Edit announcement preview" : "New announcement preview"}
          onClose={() => setPreviewOpen(false)}
          onConfirm={handleConfirm}
          loading={isPending}
        >
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {coverPreview && (
              <img
                src={coverPreview}
                alt={form.title}
                className="aspect-[16/9] w-full object-cover"
              />
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    form.status === "published"
                      ? "bg-sage/15 text-sage"
                      : "bg-secondary text-foreground/40"
                  }`}
                >
                  {form.status}
                </span>
                {form.is_featured && (
                  <span className="rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] font-bold uppercase text-terracotta">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="font-display text-xl font-bold">
                {form.title || "Untitled"}
              </h3>
              {form.excerpt && (
                <p className="mt-1 text-sm text-foreground/55">{form.excerpt}</p>
              )}
              <p className="mt-3 text-sm leading-6 text-foreground/65 line-clamp-4">
                {form.content}
              </p>
            </div>
          </div>
        </PreviewModal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDelete
          label={`"${deleteTarget.title}"`}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteAnn.isPending}
          onConfirm={async () => {
            await deleteAnn.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────── Overview Tab ─────────────────────── */

function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data: stats, isLoading } = useAdminStats();
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold">Dashboard overview</h2>
        <p className="text-sm text-foreground/50">
          Welcome back, {user?.full_name?.split(" ")[0] ?? "Admin"}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        <StatCard
          icon={Calendar}
          label="Events"
          value={isLoading ? "…" : stats?.events}
        />
        <StatCard
          icon={ImageIcon}
          label="Gallery photos"
          value={isLoading ? "…" : stats?.gallery}
        />
        <StatCard
          icon={Users}
          label="Cabinet members"
          value={isLoading ? "…" : stats?.committee}
        />
        <StatCard
          icon={Megaphone}
          label="Announcements"
          value={isLoading ? "…" : stats?.announcements}
        />
      </div>

      <p className="mb-3 text-xs font-bold uppercase text-foreground/40">
        Quick actions
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {(
          [
            {
              tab: "events" as Tab,
              icon: Calendar,
              label: "Manage events",
              desc: "Add, edit or remove events",
            },
            {
              tab: "gallery" as Tab,
              icon: ImageIcon,
              label: "Manage gallery",
              desc: "Upload photos, edit captions",
            },
            {
              tab: "cabinet" as Tab,
              icon: UserCheck,
              label: "Manage cabinet",
              desc: "Update member profiles",
            },
            {
              tab: "announcements" as Tab,
              icon: Megaphone,
              label: "Announcements",
              desc: "Draft or publish posts",
            },
          ] as const
        ).map(({ tab, icon: Icon, label, desc }) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Icon size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-foreground/50">{desc}</p>
            </div>
            <ArrowUpRight
              size={14}
              className="ml-auto text-foreground/30 group-hover:text-foreground/60 transition-colors"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Main Dashboard ─────────────────────── */

function AdminDashboard() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-sm text-foreground/50">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "events", label: "Events", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "cabinet", label: "Cabinet", icon: Users },
    { id: "announcements", label: "Announcements", icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground/50 hover:bg-secondary hover:text-foreground transition-colors"
              title="View site"
            >
              <ArrowLeft size={14} />
            </a>
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-sm bg-primary font-display text-xs font-extrabold text-primary-foreground">
                PP
              </span>
              <div className="leading-tight">
                <strong className="block font-display text-xs">
                  Admin Panel
                </strong>
                <span className="text-[10px] uppercase text-foreground/40">
                  PPA · ISLM
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold">{user.full_name}</p>
                <p className="text-[10px] uppercase text-foreground/40">
                  {user.role}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                logout();
                navigate({ to: "/admin/login" });
              }}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground/60 hover:bg-secondary hover:text-foreground transition-colors"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar nav (desktop) */}
          <aside className="hidden w-48 shrink-0 lg:block">
            <nav className="grid gap-1 sticky top-24">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                    activeTab === id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/60 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile tab bar */}
            <div className="mb-5 flex gap-1 overflow-x-auto pb-1 lg:hidden">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    activeTab === id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground/60 hover:bg-secondary"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <OverviewTab onNavigate={setActiveTab} />
            )}
            {activeTab === "events" && <EventsTab />}
            {activeTab === "gallery" && <GalleryTab />}
            {activeTab === "cabinet" && <CabinetTab />}
            {activeTab === "announcements" && <AnnouncementsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
