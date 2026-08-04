"use client";

import {
  Upload,
  Download,
  FileText,
  Image,
  File,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { useAttachments } from "../queries/prontuario";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { AttachmentCategory } from "../types";

const CATEGORY_LABELS: Record<AttachmentCategory, string> = {
  DOCUMENT: "Documento",
  PHOTO: "Foto",
  EXTERNAL_REPORT: "Laudo Externo",
  EXAM: "Exame",
  RECEIPT: "Comprovante",
  OTHER: "Outro",
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("pdf")) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentsPanelProps {
  patientId: string;
}

export function AttachmentsPanel({ patientId }: AttachmentsPanelProps) {
  const { data: attachments, isLoading } = useAttachments(patientId);

  function handleUploadClick() {
    toast.info("Upload em breve", {
      description: "A funcionalidade de upload estará disponível em breve.",
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (!attachments?.length) {
    return (
      <EmptyState
        icon={<Upload className="h-6 w-6" />}
        title="Nenhum anexo"
        description="Faça upload de documentos, fotos ou laudos."
        action={
          <Button size="sm" onClick={handleUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Fazer Upload
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Fazer Upload
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-2 pr-4">
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.mimeType);

            return (
              <Card key={attachment.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {attachment.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">
                        {CATEGORY_LABELS[attachment.category]}
                      </Badge>
                      <span>{formatFileSize(attachment.size)}</span>
                      <span>•</span>
                      <span>{formatDate(attachment.createdAt)}</span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
