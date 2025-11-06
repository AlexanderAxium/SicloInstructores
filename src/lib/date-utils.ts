/**
 * Utilidades para manejo de fechas en zona horaria de Lima (GMT-5)
 * Las fechas en la base de datos están almacenadas como UTC pero representan hora local de Lima
 */

const LIMA_TIMEZONE = "America/Lima";

/**
 * Suma o resta horas a una fecha
 * @param date - Fecha original (string o Date)
 * @param hours - Número de horas a sumar (positivo) o restar (negativo)
 * @returns Nueva fecha con las horas ajustadas
 *
 * @example
 * // Sumar 3 horas
 * const newDate = addHours(new Date(), 3);
 *
 * // Restar 5 horas
 * const pastDate = addHours("2024-01-01T13:00:00Z", -5);
 */
export function addHours(date: string | Date, hours: number): Date {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
  return new Date(dateObj.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Suma o resta minutos a una fecha
 * @param date - Fecha original (string o Date)
 * @param minutes - Número de minutos a sumar (positivo) o restar (negativo)
 * @returns Nueva fecha con los minutos ajustados
 */
export function addMinutes(date: string | Date, minutes: number): Date {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
  return new Date(dateObj.getTime() + minutes * 60 * 1000);
}

/**
 * Suma o resta días a una fecha
 * @param date - Fecha original (string o Date)
 * @param days - Número de días a sumar (positivo) o restar (negativo)
 * @returns Nueva fecha con los días ajustados
 */
export function addDays(date: string | Date, days: number): Date {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
  return new Date(dateObj.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Convierte una fecha a una zona horaria específica
 * @param date - Fecha a convertir
 * @param timezone - Zona horaria IANA (ej: "America/Lima", "America/New_York")
 * @returns Fecha formateada en la zona horaria especificada (DD/MM/YYYY HH:MM)
 *
 * @example
 * convertToTimezone(new Date(), "America/Lima") // "06/11/2024 13:00"
 * convertToTimezone(new Date(), "America/New_York") // "06/11/2024 14:00"
 */
export function convertToTimezone(
  date: string | Date,
  timezone: string
): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return "";
    }

    return dateObj.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    });
  } catch (_error) {
    return "";
  }
}

/**
 * Formatea una fecha a hora local de Lima (HH:MM)
 */
export function formatTimeInLima(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return "00:00";
    }

    return dateObj.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: LIMA_TIMEZONE,
    });
  } catch (_error) {
    return "00:00";
  }
}

/**
 * Formatea una fecha a formato corto en Lima (DD/MM/YYYY)
 */
export function formatDateInLima(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return "";
    }

    return dateObj.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: LIMA_TIMEZONE,
    });
  } catch (_error) {
    return "";
  }
}

/**
 * Formatea una fecha completa en Lima (DD/MM/YYYY HH:MM)
 */
export function formatDateTimeInLima(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return "";
    }

    return dateObj.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: LIMA_TIMEZONE,
    });
  } catch (_error) {
    return "";
  }
}

/**
 * Obtiene la hora en formato HH:MM para validaciones (ej: horarios no prime)
 */
export function getTimeInLima(date: string | Date): string {
  return formatTimeInLima(date);
}

/**
 * Formatea solo la hora de una fecha con opción de ajustar horas
 * @param date - Fecha original
 * @param hoursToAdd - Horas a sumar (opcional)
 * @param timezone - Zona horaria (opcional, por defecto Lima)
 * @returns Hora formateada (HH:MM)
 *
 * @example
 * formatTime(new Date()) // "13:00"
 * formatTime(new Date(), 3) // "16:00" (suma 3 horas)
 * formatTime(new Date(), -2) // "11:00" (resta 2 horas)
 * formatTime(new Date(), 0, "America/New_York") // Hora en NY
 */
export function formatTime(
  date: string | Date,
  hoursToAdd = 0,
  timezone: string = LIMA_TIMEZONE
): string {
  try {
    let dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return "00:00";
    }

    // Sumar horas si se especifica
    if (hoursToAdd !== 0) {
      dateObj = addHours(dateObj, hoursToAdd);
    }

    return dateObj.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    });
  } catch (_error) {
    return "00:00";
  }
}

/**
 * Formatea una fecha con opción de ajustar días
 * @param date - Fecha original
 * @param daysToAdd - Días a sumar (opcional)
 * @param timezone - Zona horaria (opcional, por defecto Lima)
 * @returns Fecha formateada (DD/MM/YYYY)
 *
 * @example
 * formatDate(new Date()) // "06/11/2024"
 * formatDate(new Date(), 7) // Fecha dentro de 7 días
 * formatDate(new Date(), -1) // Fecha de ayer
 */
export function formatDate(
  date: string | Date,
  daysToAdd = 0,
  timezone: string = LIMA_TIMEZONE
): string {
  try {
    let dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return "";
    }

    // Sumar días si se especifica
    if (daysToAdd !== 0) {
      dateObj = addDays(dateObj, daysToAdd);
    }

    return dateObj.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: timezone,
    });
  } catch (_error) {
    return "";
  }
}
