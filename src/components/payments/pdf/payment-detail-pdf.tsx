import type { Class } from "@/types/classes";
import type {
  DisciplineFromAPI,
  InstructorFromAPI,
  PeriodFromAPI,
} from "@/types/instructor";
import type { InstructorPaymentFromAPI } from "@/types/payments";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    color: "#333",
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    padding: 5,
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e0e0e0",
    padding: 5,
    fontSize: 9,
  },
  tableCell: {
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderTop: "2pt solid #000",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  badge: {
    padding: "3pt 8pt",
    borderRadius: 3,
    fontSize: 9,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  badgePaid: {
    backgroundColor: "#10b981",
    color: "#fff",
  },
  badgePending: {
    backgroundColor: "#f59e0b",
    color: "#fff",
  },
  detailItem: {
    marginBottom: 5,
    padding: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 3,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
    borderTop: "1pt solid #ccc",
    paddingTop: 10,
  },
});

// Types for discipline stats and payment details
interface DisciplineStat {
  disciplineId: string;
  name: string;
  classes: number;
  reservations: number;
  capacity: number;
  occupancy: number;
  baseAmount: number;
}

interface PaymentDetails {
  coversConBono?: number;
  totalBrandeos?: number;
  totalThemeRides?: number;
  totalWorkshops?: number;
  [key: string]: unknown;
}

interface PaymentDetailPDFProps {
  payment: InstructorPaymentFromAPI;
  instructor: InstructorFromAPI;
  period: PeriodFromAPI;
  disciplines: DisciplineFromAPI[];
  instructorClasses: Class[];
  disciplineStats: DisciplineStat[];
  details: PaymentDetails;
}

export function PaymentDetailPDF({
  payment,
  instructor,
  period,
  disciplines,
  instructorClasses,
  disciplineStats,
  details,
}: PaymentDetailPDFProps) {
  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-PE");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>RECIBO DE PAGO DE INSTRUCTOR</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Siclo</Text>
        </View>

        {/* Información General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Instructor:</Text>
            <Text style={styles.value}>{instructor.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Período:</Text>
            <Text style={styles.value}>
              P{period.number} - {period.year}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de emisión:</Text>
            <Text style={styles.value}>
              {formatDate(new Date().toISOString())}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado:</Text>
            <View
              style={[
                styles.badge,
                payment.status === "PAID"
                  ? styles.badgePaid
                  : styles.badgePending,
              ]}
            >
              <Text>
                {payment.status === "PAID" ? "APROBADO" : "PENDIENTE"}
              </Text>
            </View>
          </View>
        </View>

        {/* Desglose por Disciplina */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESGLOSE POR DISCIPLINA</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Disciplina</Text>
              <Text style={styles.tableCell}>Clases</Text>
              <Text style={styles.tableCell}>Reservas</Text>
              <Text style={styles.tableCell}>Ocupación</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Monto Base</Text>
            </View>
            {disciplineStats.map((stat: DisciplineStat, index: number) => (
              <View
                key={`discipline-${stat.name}-${index}`}
                style={styles.tableRow}
              >
                <Text style={[styles.tableCell, { flex: 2 }]}>{stat.name}</Text>
                <Text style={styles.tableCell}>{stat.classes}</Text>
                <Text style={styles.tableCell}>
                  {stat.reservations}/{stat.capacity}
                </Text>
                <Text style={styles.tableCell}>{stat.occupancy}%</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {formatCurrency(stat.baseAmount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Resumen de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESUMEN DE PAGO</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Monto Base Total:</Text>
            <Text style={styles.value}>{formatCurrency(payment.amount)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Reajuste (
              {payment.adjustmentType === "PORCENTAJE"
                ? `${payment.adjustment}%`
                : "Fijo"}
              ):
            </Text>
            <Text style={styles.value}>
              {payment.adjustment >= 0 ? "+" : ""}
              {formatCurrency(
                payment.adjustmentType === "PORCENTAJE"
                  ? (payment.amount * payment.adjustment) / 100
                  : payment.adjustment
              )}
            </Text>
          </View>

          {payment.bonus && payment.bonus > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Bono:</Text>
              <Text style={styles.value}>
                +{formatCurrency(payment.bonus || 0)}
              </Text>
            </View>
          )}

          {payment.cover > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Covers ({details?.coversConBono || 0} covers):
              </Text>
              <Text style={styles.value}>+{formatCurrency(payment.cover)}</Text>
            </View>
          )}

          {payment.branding > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Brandeos ({details?.totalBrandeos || 0} brandeos):
              </Text>
              <Text style={styles.value}>
                +{formatCurrency(payment.branding)}
              </Text>
            </View>
          )}

          {payment.themeRide > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Theme Rides ({details?.totalThemeRides || 0} theme rides):
              </Text>
              <Text style={styles.value}>
                +{formatCurrency(payment.themeRide)}
              </Text>
            </View>
          )}

          {payment.workshop > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Workshops ({details?.totalWorkshops || 0} workshops):
              </Text>
              <Text style={styles.value}>
                +{formatCurrency(payment.workshop)}
              </Text>
            </View>
          )}

          {payment.penalty > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Penalización:</Text>
              <Text style={[styles.value, { color: "#dc2626" }]}>
                -{formatCurrency(payment.penalty)}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Retención (8%):</Text>
            <Text style={[styles.value, { color: "#dc2626" }]}>
              -{formatCurrency(payment.retention)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MONTO FINAL:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(payment.finalPayment)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Este documento fue generado automáticamente el{" "}
            {new Date().toLocaleString("es-PE")}
          </Text>
          <Text>Sistema de Gestión de Instructores - Siclo</Text>
        </View>
      </Page>

      {/* Segunda Página - Lista de Clases */}
      {instructorClasses.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>LISTA DE CLASES DEL PERÍODO</Text>
            <Text style={styles.subtitle}>
              {instructor.name} - P{period.number} {period.year}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Fecha</Text>
              <Text style={styles.tableCell}>Hora</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Estudio</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Disciplina</Text>
              <Text style={styles.tableCell}>Reservas</Text>
            </View>
            {instructorClasses
              .slice(0, 50)
              .map((clase: Class, index: number) => {
                const discipline = disciplines.find(
                  (d) => d.id === clase.disciplineId
                );
                return (
                  <View
                    key={`class-${clase.id}-${index}`}
                    style={styles.tableRow}
                  >
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>
                      {formatDate(clase.date.toISOString())}
                    </Text>
                    <Text style={styles.tableCell}>
                      {new Date(clase.date).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>
                      {clase.studio}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>
                      {discipline?.name || "N/A"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {clase.totalReservations}/{clase.spots}
                    </Text>
                  </View>
                );
              })}
          </View>

          {instructorClasses.length > 50 && (
            <Text style={{ marginTop: 10, fontSize: 8, color: "#666" }}>
              * Mostrando las primeras 50 clases de {instructorClasses.length}{" "}
              totales
            </Text>
          )}

          <View style={styles.footer}>
            <Text>Página 2 de 2</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
