"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { AlertCircle, Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DuplicateFormulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periods: Array<{
    id: string;
    number: number;
    year: number;
  }>;
}

export function DuplicateFormulaDialog({
  open,
  onOpenChange,
  periods,
}: DuplicateFormulaDialogProps) {
  const [fromPeriodId, setFromPeriodId] = useState<string>("");
  const [toPeriodId, setToPeriodId] = useState<string>("");

  const utils = trpc.useUtils();

  const duplicateMutation = trpc.formulas.duplicateToPeriod.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.formulas.getWithFilters.invalidate();
      utils.formulas.getByPeriod.invalidate();
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Error al duplicar fórmulas");
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFromPeriodId("");
      setToPeriodId("");
    }
  }, [open]);

  const handleClose = () => {
    if (!duplicateMutation.isPending) {
      onOpenChange(false);
    }
  };

  const handleSubmit = () => {
    if (!fromPeriodId || !toPeriodId) {
      toast.error("Por favor selecciona ambos períodos");
      return;
    }

    if (fromPeriodId === toPeriodId) {
      toast.error("Los períodos de origen y destino no pueden ser iguales");
      return;
    }

    const fromPeriod = periods.find((p) => p.id === fromPeriodId);
    const toPeriod = periods.find((p) => p.id === toPeriodId);

    if (!fromPeriod || !toPeriod) {
      toast.error("Períodos no válidos");
      return;
    }

    // Show confirmation
    if (
      !confirm(
        `¿Estás seguro de duplicar todas las fórmulas del período ${fromPeriod.number}/${fromPeriod.year} al período ${toPeriod.number}/${toPeriod.year}? Esto reemplazará todas las fórmulas existentes en el período de destino.`
      )
    ) {
      return;
    }

    duplicateMutation.mutate({
      fromPeriodId,
      toPeriodId,
    });
  };

  const fromPeriod = periods.find((p) => p.id === fromPeriodId);
  const toPeriod = periods.find((p) => p.id === toPeriodId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicar Fórmulas
          </DialogTitle>
          <DialogDescription>
            Duplica todas las fórmulas de un período a otro. Las fórmulas
            existentes en el período destino serán reemplazadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atención</AlertTitle>
            <AlertDescription className="text-xs">
              Esta acción reemplazará todas las fórmulas existentes en el
              período destino.
            </AlertDescription>
          </Alert>

          {/* From Period */}
          <div className="space-y-2">
            <Label htmlFor="from-period">Período de Origen</Label>
            <Select
              value={fromPeriodId}
              onValueChange={setFromPeriodId}
              disabled={duplicateMutation.isPending}
            >
              <SelectTrigger id="from-period">
                <SelectValue placeholder="Selecciona el período origen" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    Período {period.number} - {period.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Period */}
          <div className="space-y-2">
            <Label htmlFor="to-period">Período de Destino</Label>
            <Select
              value={toPeriodId}
              onValueChange={setToPeriodId}
              disabled={duplicateMutation.isPending}
            >
              <SelectTrigger id="to-period">
                <SelectValue placeholder="Selecciona el período destino" />
              </SelectTrigger>
              <SelectContent>
                {periods
                  .filter((p) => p.id !== fromPeriodId)
                  .map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      Período {period.number} - {period.year}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {fromPeriodId && toPeriodId && fromPeriod && toPeriod && (
            <div className="bg-muted/50 p-3 rounded-lg border border-border">
              <p className="text-sm font-medium mb-1">Resumen:</p>
              <p className="text-xs text-muted-foreground">
                Se duplicarán todas las fórmulas del{" "}
                <span className="font-medium">
                  Período {fromPeriod.number}/{fromPeriod.year}
                </span>{" "}
                al{" "}
                <span className="font-medium">
                  Período {toPeriod.number}/{toPeriod.year}
                </span>
                . Las fórmulas existentes en el período destino serán
                reemplazadas.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={duplicateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !fromPeriodId ||
              !toPeriodId ||
              fromPeriodId === toPeriodId ||
              duplicateMutation.isPending
            }
          >
            {duplicateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Duplicando...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar Fórmulas
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
