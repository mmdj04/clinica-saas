"use client";

import { useState } from "react";
import {
  Stethoscope,
  FileText,
  Pill,
  TestTube,
  Upload,
  Menu,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PatientSummary } from "./patient-summary";
import { AnamnesisForm } from "./anamnesis-form";
import { EvolutionList } from "./evolution-list";
import { EvolutionForm } from "./evolution-form";
import { PrescriptionList } from "./prescription-list";
import { PrescriptionForm } from "./prescription-form";
import { ExamList } from "./exam-list";
import { ExamForm } from "./exam-form";
import { AttachmentsPanel } from "./attachments-panel";

interface ProntuarioPageProps {
  patientId: string;
}

export function ProntuarioPage({ patientId }: ProntuarioPageProps) {
  const [activeTab, setActiveTab] = useState("anamnesis");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-72 border-r">
        <PatientSummary patientId={patientId} />
      </div>

      {/* Mobile sidebar trigger */}
      <div className="lg:hidden fixed bottom-4 left-4 z-40">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex items-center justify-between p-4">
              <h3 className="font-semibold">Paciente</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
            <PatientSummary patientId={patientId} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex h-full flex-col"
        >
          <div className="border-b px-4">
            <ScrollArea className="w-full">
              <TabsList className="mb-0 h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="anamnesis"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  <Stethoscope className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Anamnese</span>
                </TabsTrigger>
                <TabsTrigger
                  value="evolution"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Evolução</span>
                </TabsTrigger>
                <TabsTrigger
                  value="prescriptions"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  <Pill className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Receitas</span>
                </TabsTrigger>
                <TabsTrigger
                  value="exams"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Exames</span>
                </TabsTrigger>
                <TabsTrigger
                  value="attachments"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Anexos</span>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="anamnesis" className="mt-0">
              <AnamnesisForm patientId={patientId} />
            </TabsContent>

            <TabsContent value="evolution" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Evolução</h3>
                <EvolutionForm patientId={patientId} />
              </div>
              <EvolutionList patientId={patientId} />
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Receitas</h3>
                <PrescriptionForm patientId={patientId} />
              </div>
              <PrescriptionList patientId={patientId} />
            </TabsContent>

            <TabsContent value="exams" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Exames</h3>
                <ExamForm patientId={patientId} />
              </div>
              <ExamList patientId={patientId} />
            </TabsContent>

            <TabsContent value="attachments" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Anexos</h3>
              </div>
              <AttachmentsPanel patientId={patientId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
