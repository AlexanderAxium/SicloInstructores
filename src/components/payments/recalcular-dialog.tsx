"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/utils/trpc";
import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type RecalcularDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  instructorId: string;
  periodId: string;
  instructorName?: string;
  periodLabel?: string;
  onDone?: () => void;
};

export function RecalcularDialog({
  isOpen,
  onClose,
  instructorId,
  periodId,
  instructorName,
  periodLabel,
  onDone,
}: RecalcularDialogProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"success" | "error" | null>(
    null
  );

  const utils = trpc.useUtils();

  const runCalculation = useCallback(async () => {
    if (!instructorId || !periodId) return;
    setIsRunning(true);
    setLogs([]);
    setResultMessage(null);
    setResultStatus(null);

    try {
      const res = await utils.client.payments.calculateInstructorPayment.mutate(
        {
          instructorId,
          periodId,
        }
      );

      setLogs(res.logs || []);
      setResultMessage(res.message);
      setResultStatus(res.success ? "success" : "error");

      // Refrescar listados relacionados
      await utils.payments.getWithFilters.invalidate();
      if ("paymentId" in res) {
        await utils.payments.getById.invalidate({ id: res.paymentId });
      }
      onDone?.();
    } catch (_e) {
      setResultMessage("Error al recalcular el pago");
      setResultStatus("error");
    } finally {
      setIsRunning(false);
    }
  }, [instructorId, periodId, utils, onDone]);

  useEffect(() => {
    if (isOpen) {
      // Ejecutar automáticamente al abrir
      void runCalculation();
    } else {
      setLogs([]);
      setResultMessage(null);
      setResultStatus(null);
      setIsRunning(false);
    }
  }, [isOpen, runCalculation]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (!open ? onClose() : undefined)}
    >
      <DialogContent className="max-w-3xl bg-card border border-border p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <RefreshCw className="h-4 w-4" />
            Recalcular Pago
          </DialogTitle>
          {instructorName || periodLabel ? (
            <div className="text-xs text-muted-foreground">
              {instructorName ? (
                <span>Instructor: {instructorName}</span>
              ) : null}
              {instructorName && periodLabel ? (
                <span className="mx-2">•</span>
              ) : null}
              {periodLabel ? <span>Período: {periodLabel}</span> : null}
            </div>
          ) : null}
        </DialogHeader>

        <Separator />

        <div className="p-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-muted-foreground">
              Logs de ejecución
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={runCalculation}
              disabled={isRunning}
              className="h-7 px-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Reintentar
                </>
              )}
            </Button>
          </div>

          <div className="border border-border rounded-md bg-muted/5">
            <ScrollArea className="h-72">
              <pre className="text-xs p-3 whitespace-pre-wrap leading-5">
                {(logs && logs.length > 0
                  ? logs
                  : [
                      isRunning
                        ? "Iniciando cálculo..."
                        : resultMessage || "Sin logs",
                    ]
                ).join("\n")}{" "}
              </pre>
            </ScrollArea>
          </div>

          {resultMessage ? (
            <div
              className={`mt-3 text-xs ${resultStatus === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {resultMessage}
            </div>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="h-8 px-3">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
