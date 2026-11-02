// TanStack Query hooks for every backend resource

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";

/* ─────────────────────────── Types ─────────────────────────── */

export interface EventOut {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  venue: string | null;
  start_date: string;
  end_date: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  cover_image_url: string | null;
  is_featured: boolean;
  registration_link: string | null;
  created_at: string;
  images: EventImageOut[];
}

export interface EventImageOut {
  id: number;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  venue?: string;
  start_date: string;
  end_date?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  is_featured?: boolean;
  registration_link?: string;
}

export type EventUpdate = Partial<EventCreate>;

export interface GalleryImageOut {
  id: number;
  image_url: string;
  caption: string | null;
  category: string;
  created_at: string;
}

export interface CommitteeMemberOut {
  id: number;
  full_name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  order_index: number;
  is_active: boolean;
}

export interface CommitteeMemberCreate {
  full_name: string;
  position: string;
  bio?: string;
  email?: string;
  order_index?: number;
}

export type CommitteeMemberUpdate = Partial<CommitteeMemberCreate> & {
  is_active?: boolean;
};

export interface AnnouncementOut {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: "draft" | "published";
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

export interface AnnouncementCreate {
  title: string;
  content: string;
  excerpt?: string;
  status?: "draft" | "published";
  is_featured?: boolean;
}

export type AnnouncementUpdate = Partial<AnnouncementCreate>;

export interface AdminStats {
  events: number;
  gallery: number;
  announcements: number;
  committee: number;
  users: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

/* ─────────────────────────── Events ─────────────────────────── */

export function useEvents(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ["events", page, perPage],
    queryFn: () =>
      apiFetch<PaginatedResponse<EventOut>>(
        `/api/events/?page=${page}&per_page=${perPage}`
      ),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventCreate) =>
      apiFetch<EventOut>("/api/events/", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EventUpdate }) =>
      apiFetch<EventOut>(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/events/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUploadEventCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetch<EventOut>(`/api/events/${id}/cover`, {
        method: "POST",
        body: form,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

/* ─────────────────────────── Gallery ─────────────────────────── */

export function useGallery(page = 1, perPage = 40, category?: string) {
  return useQuery({
    queryKey: ["gallery", page, perPage, category],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (category) params.set("category", category);
      return apiFetch<PaginatedResponse<GalleryImageOut>>(
        `/api/gallery/?${params}`
      );
    },
  });
}

export function useUploadGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, category }: { files: File[]; category: string }) => {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      return apiFetch<GalleryImageOut[]>(
        `/api/gallery/upload?category=${encodeURIComponent(category)}`,
        { method: "POST", body: form }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useUpdateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      caption,
      category,
    }: {
      id: number;
      caption?: string;
      category?: string;
    }) =>
      apiFetch<GalleryImageOut>(`/api/gallery/${id}`, {
        method: "PUT",
        body: JSON.stringify({ caption, category }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/gallery/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

/* ─────────────────────────── Committee ─────────────────────────── */

export function useCommittee() {
  return useQuery({
    queryKey: ["committee"],
    queryFn: () => apiFetch<CommitteeMemberOut[]>("/api/committee/"),
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CommitteeMemberCreate) =>
      apiFetch<CommitteeMemberOut>("/api/committee/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["committee"] }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CommitteeMemberUpdate;
    }) =>
      apiFetch<CommitteeMemberOut>(`/api/committee/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["committee"] }),
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/committee/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["committee"] }),
  });
}

export function useUploadMemberPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetch<CommitteeMemberOut>(`/api/committee/${id}/photo`, {
        method: "POST",
        body: form,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["committee"] }),
  });
}

/* ─────────────────────────── Announcements ─────────────────────────── */

export function useAnnouncements(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ["announcements", page, perPage],
    queryFn: () =>
      apiFetch<PaginatedResponse<AnnouncementOut>>(
        `/api/announcements/?page=${page}&per_page=${perPage}`
      ),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AnnouncementCreate) =>
      apiFetch<AnnouncementOut>("/api/announcements/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AnnouncementUpdate }) =>
      apiFetch<AnnouncementOut>(`/api/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useUploadAnnouncementCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetch<AnnouncementOut>(`/api/announcements/${id}/cover`, {
        method: "POST",
        body: form,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

/* ─────────────────────────── Dashboard ─────────────────────────── */

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiFetch<AdminStats>("/api/admin/stats"),
  });
}
