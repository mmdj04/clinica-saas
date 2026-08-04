import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = url && serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : null;

export const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET ?? "clinica-saas";

/**
 * Upload de arquivo para o Supabase Storage com nome seguro.
 * Retorna a URL pública assinada.
 */
export async function uploadFile(options: {
  bucket?: string;
  path: string;
  file: Buffer | ArrayBuffer;
  contentType: string;
}): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  const bucket = options.bucket ?? BUCKET_NAME;
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(options.path, options.file, {
      contentType: options.contentType,
      upsert: false,
    });
  if (error) throw new Error(`Falha no upload: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(options.path);
  return data.publicUrl;
}

export async function deleteFile(options: {
  bucket?: string;
  path: string;
}): Promise<void> {
  if (!supabaseAdmin) return;
  const bucket = options.bucket ?? BUCKET_NAME;
  await supabaseAdmin.storage.from(bucket).remove([options.path]);
}

export function buildFilePath(organizationId: string, category: string, filename: string): string {
  const safeName = filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
  const ts = Date.now();
  return `${organizationId}/${category}/${ts}-${safeName}`;
}