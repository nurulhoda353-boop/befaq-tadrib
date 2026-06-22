import { supabase } from "@/integrations/supabase/client";

/**
 * Extract the storage path of a notice attachment. Accepts:
 *  - bare storage paths ("notices/xxx.pdf") — preferred new format
 *  - legacy long-lived signed URLs ("https://.../object/sign/cms-attachments/notices/xxx.pdf?token=...")
 *  - legacy public URLs ("https://.../object/public/cms-attachments/notices/xxx.pdf")
 */
export function getAttachmentPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("http")) return value;
  const m = value.match(/cms-attachments\/([^?#]+)/);
  return m ? m[1] : null;
}

/**
 * Resolve an attachment value to a short-lived signed URL.
 * RLS gates access to published notices only — calling this on a draft
 * attachment from the public site will return null.
 */
export async function resolveAttachmentUrl(
  value: string | null | undefined,
  expiresInSeconds = 60 * 60, // 1 hour
): Promise<string | null> {
  const path = getAttachmentPath(value);
  if (!path) return null;
  const { data } = await supabase.storage
    .from("cms-attachments")
    .createSignedUrl(path, expiresInSeconds);
  return data?.signedUrl ?? null;
}
