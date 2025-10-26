"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, FileText, X } from "lucide-react";
import { useState } from "react";

interface ReajusteEditorProps {
  nuevoReajuste: number;
  setNuevoReajuste: (value: number) => void;
  tipoReajuste: "FIJO" | "PORCENTAJE";
  setTipoReajuste: (value: "FIJO" | "PORCENTAJE") => void;
  isActualizandoReajuste: boolean;
  pagoId: string;
  actualizarReajuste: (pagoId: string) => void;
  cancelarEdicionReajuste: () => void;
}

export function ReajusteEditor({
  nuevoReajuste,
  setNuevoReajuste,
  tipoReajuste,
  setTipoReajuste,
  isActualizandoReajuste,
  pagoId,
  actualizarReajuste,
  cancelarEdicionReajuste,
}: ReajusteEditorProps) {
  const [localReajuste, setLocalReajuste] = useState(nuevoReajuste.toString());
  const [localTipo, setLocalTipo] = useState(tipoReajuste);

  const handleSave = () => {
    const numericValue = Number.parseFloat(localReajuste);
    if (!Number.isNaN(numericValue)) {
      setNuevoReajuste(numericValue);
      setTipoReajuste(localTipo);
      actualizarReajuste(pagoId);
    }
  };

  const handleCancel = () => {
    setLocalReajuste(nuevoReajuste.toString());
    setLocalTipo(tipoReajuste);
    cancelarEdicionReajuste();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Input
          type="number"
          step="0.01"
          value={localReajuste}
          onChange={(e) => setLocalReajuste(e.target.value)}
          className="w-20 h-6 text-xs"
          placeholder="0.00"
        />
        <Select
          value={localTipo}
          onValueChange={(value: "FIJO" | "PORCENTAJE") => setLocalTipo(value)}
        >
          <SelectTrigger className="w-20 h-6 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FIJO" className="text-xs">
              S/
            </SelectItem>
            <SelectItem value="PORCENTAJE" className="text-xs">
              %
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-5 w-5 p-0 text-green-600 hover:text-green-700"
          onClick={handleSave}
          disabled={isActualizandoReajuste}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
          onClick={handleCancel}
          disabled={isActualizandoReajuste}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
