import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type DocumentAuditLog = {
  id: string;
  document_id: string;
  document_title: string;
  user_id: string;
  user_email: string;
  action: "VIEW" | "DOWNLOAD";
  created_at: string;
};

export async function logDocumentAccess(params: {
  documentId: string;
  documentTitle: string;
  user: { id: string; email: string };
  action: "VIEW" | "DOWNLOAD";
}) {
  try {
    const { error } = await (supabase as any).from("document_audit_logs").insert({
      document_id: params.documentId,
      document_title: params.documentTitle,
      user_id: params.user.id,
      user_email: params.user.email,
      action: params.action,
    });
    if (error) {
      console.warn("Aviso ao registrar auditoria de documento:", error.message);
    }
  } catch (err) {
    console.warn("Falha ao registrar auditoria:", err);
  }
}

export function useDocumentAuditLogs() {
  return useQuery({
    queryKey: ["document-audit-logs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("document_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as DocumentAuditLog[];
    },
    staleTime: 10_000,
  });
}
