import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PROTOCOL_MENU_ITEMS } from "@/lib/protocol-menu";

/** Every protocol topic stores its own row in site_content under this key prefix. */
export const PROTOCOL_TOPIC_KEY_PREFIX = "protocolo_topic_";
/** The protocol overview page stores its editable hero text under this key. */
export const PROTOCOL_OVERVIEW_KEY = "protocolo_overview";

export type ProtocolTopicContent = {
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  images: string[];
  published: boolean;
};

export type ProtocolOverviewContent = {
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
};

export const EMPTY_PROTOCOL_TOPIC: ProtocolTopicContent = {
  eyebrow: "",
  title: "",
  description: "",
  body: "",
  images: [],
  published: false,
};

export const DEFAULT_PROTOCOL_OVERVIEW: ProtocolOverviewContent = {
  eyebrow: "Cerimonial e protocolo",
  title: "Protocolo Leonístico",
  description: "Diretrizes de precedência, cerimonial e conduta nas reuniões e eventos oficiais do Distrito LC-11.",
  intro: "",
};

export function protocolTopicKey(slug: string): string {
  return `${PROTOCOL_TOPIC_KEY_PREFIX}${slug}`;
}

export function isProtocolTopicKey(key: unknown): key is string {
  return typeof key === "string" && key.startsWith(PROTOCOL_TOPIC_KEY_PREFIX);
}

export function protocolTopicSlugFromKey(key: string): string {
  return isProtocolTopicKey(key) ? key.slice(PROTOCOL_TOPIC_KEY_PREFIX.length) : "";
}

export function isKnownProtocolSlug(slug: string): boolean {
  return PROTOCOL_MENU_ITEMS.some((item) => item.slug === slug);
}

export function normalizeProtocolTopic(raw: unknown): ProtocolTopicContent {
  const value = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const images = Array.isArray(value.images)
    ? value.images.filter((url): url is string => typeof url === "string" && url.trim() !== "")
    : [];
  return {
    eyebrow: typeof value.eyebrow === "string" ? value.eyebrow : "",
    title: typeof value.title === "string" ? value.title : "",
    description: typeof value.description === "string" ? value.description : "",
    body: typeof value.body === "string" ? value.body : "",
    images,
    published: value.published === true,
  };
}

export function normalizeProtocolOverview(raw: unknown): ProtocolOverviewContent {
  const value = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const text = (field: string, fallback: string) =>
    typeof value[field] === "string" && value[field] !== "" ? (value[field] as string) : fallback;
  return {
    eyebrow: text("eyebrow", DEFAULT_PROTOCOL_OVERVIEW.eyebrow),
    title: text("title", DEFAULT_PROTOCOL_OVERVIEW.title),
    description: text("description", DEFAULT_PROTOCOL_OVERVIEW.description),
    intro: typeof value.intro === "string" ? value.intro : "",
  };
}

export type ProtocolTopicStatus = "vazio" | "rascunho" | "publicado";

export function protocolTopicStatus(content: ProtocolTopicContent): ProtocolTopicStatus {
  const hasContent =
    content.title.trim() !== "" ||
    content.description.trim() !== "" ||
    content.body.trim() !== "" ||
    content.images.length > 0;
  if (!hasContent) return "vazio";
  return content.published ? "publicado" : "rascunho";
}

export async function fetchProtocolTopic(slug: string): Promise<ProtocolTopicContent> {
  const { data } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", protocolTopicKey(slug))
    .maybeSingle();
  return normalizeProtocolTopic(data?.data);
}

export function useProtocolTopic(slug: string) {
  return useQuery({
    queryKey: ["site_content", protocolTopicKey(slug)],
    queryFn: () => fetchProtocolTopic(slug),
    enabled: isKnownProtocolSlug(slug),
    staleTime: 30_000,
  });
}

export async function saveProtocolTopic(slug: string, content: ProtocolTopicContent): Promise<void> {
  if (!isKnownProtocolSlug(slug)) throw new Error("Tema de protocolo desconhecido.");
  const { error } = await supabase.from("site_content").upsert({
    key: protocolTopicKey(slug),
    data: normalizeProtocolTopic(content),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function fetchProtocolOverview(): Promise<ProtocolOverviewContent> {
  const { data } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", PROTOCOL_OVERVIEW_KEY)
    .maybeSingle();
  return normalizeProtocolOverview(data?.data);
}

export function useProtocolOverview() {
  return useQuery({
    queryKey: ["site_content", PROTOCOL_OVERVIEW_KEY],
    queryFn: fetchProtocolOverview,
    staleTime: 30_000,
  });
}

export async function saveProtocolOverview(content: ProtocolOverviewContent): Promise<void> {
  const { error } = await supabase.from("site_content").upsert({
    key: PROTOCOL_OVERVIEW_KEY,
    data: normalizeProtocolOverview(content),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Status map for every topic, used by the panel list screen. */
export async function fetchAllProtocolTopics(): Promise<Record<string, ProtocolTopicContent>> {
  const { data, error } = await supabase
    .from("site_content")
    .select("key,data")
    .like("key", `${PROTOCOL_TOPIC_KEY_PREFIX}%`);
  if (error) throw error;
  const map: Record<string, ProtocolTopicContent> = {};
  for (const row of data ?? []) {
    const slug = protocolTopicSlugFromKey(String(row.key ?? ""));
    if (slug && isKnownProtocolSlug(slug)) map[slug] = normalizeProtocolTopic(row.data);
  }
  return map;
}
