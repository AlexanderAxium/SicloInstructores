import { useEffect, useState } from "react";

const PERIOD_STORAGE_KEY = "selectedPeriodFilter";

/**
 * Hook personalizado para manejar el filtro de periodo compartido entre páginas
 * Guarda y lee el periodo seleccionado desde localStorage
 */
export function usePeriodFilter() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar el periodo desde localStorage al montar
  useEffect(() => {
    const storedPeriod = localStorage.getItem(PERIOD_STORAGE_KEY);
    if (storedPeriod) {
      setSelectedPeriod(storedPeriod);
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage cuando cambie el periodo
  const updatePeriod = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    localStorage.setItem(PERIOD_STORAGE_KEY, newPeriod);

    // Disparar evento personalizado para sincronizar entre tabs/componentes
    window.dispatchEvent(
      new CustomEvent("periodFilterChanged", { detail: newPeriod })
    );
  };

  // Escuchar cambios desde otras tabs o componentes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PERIOD_STORAGE_KEY && e.newValue) {
        setSelectedPeriod(e.newValue);
      }
    };

    const handleCustomEvent = (e: CustomEvent<string>) => {
      setSelectedPeriod(e.detail);
    };

    window.addEventListener("storage", handleStorageChange as EventListener);
    window.addEventListener(
      "periodFilterChanged",
      handleCustomEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange as EventListener
      );
      window.removeEventListener(
        "periodFilterChanged",
        handleCustomEvent as EventListener
      );
    };
  }, []);

  return {
    selectedPeriod,
    setSelectedPeriod: updatePeriod,
    isLoaded,
  };
}
