import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

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
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    padding: 5,
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e0e0e0",
    padding: 5,
    fontSize: 8,
  },
  tableCell: {
    flex: 1,
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
  summaryBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 10,
  },
});

// Types
type Class = {
  id: string;
  country: string;
  city: string;
  disciplineId: string;
  week: number;
  studio: string;
  instructorId: string;
  periodId: string;
  room: string;
  totalReservations: number;
  waitingLists: number;
  complimentary: number;
  spots: number;
  paidReservations: number;
  specialText?: string | null;
  date: string;
  replacementInstructorId?: string | null;
  penaltyType?: string | null;
  penaltyPoints?: number | null;
  isVersus: boolean;
  versusNumber?: number | null;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
  };
  discipline: {
    id: string;
    name: string;
  };
};

interface ClassesListPDFProps {
  classes: Class[];
  totalCount: number;
  filters?: {
    period?: string;
    discipline?: string;
    instructor?: string;
  };
}

export function ClassesListPDF({
  classes,
  totalCount,
  filters,
}: ClassesListPDFProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-CO");
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalReservations = classes.reduce(
    (sum, c) => sum + c.totalReservations,
    0
  );
  const totalCapacity = classes.reduce((sum, c) => sum + c.spots, 0);
  const averageOccupancy =
    totalCapacity > 0
      ? Math.round((totalReservations / totalCapacity) * 100)
      : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LISTADO DE CLASES</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Siclo</Text>
        </View>

        {/* Resumen */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Clases:</Text>
            <Text style={styles.summaryValue}>{totalCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Reservas Totales:</Text>
            <Text style={styles.summaryValue}>
              {totalReservations} / {totalCapacity}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ocupación Promedio:</Text>
            <Text style={styles.summaryValue}>{averageOccupancy}%</Text>
          </View>
          {filters?.period && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Período:</Text>
              <Text style={styles.summaryValue}>{filters.period}</Text>
            </View>
          )}
        </View>

        {/* Tabla de Clases */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 1 }]}>Fecha</Text>
            <Text style={[styles.tableCell, { flex: 0.8 }]}>Hora</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>Instructor</Text>
            <Text style={[styles.tableCell, { flex: 1.2 }]}>Disciplina</Text>
            <Text style={[styles.tableCell, { flex: 1.2 }]}>Estudio</Text>
            <Text style={[styles.tableCell, { flex: 0.8 }]}>Sala</Text>
            <Text style={[styles.tableCell, { flex: 0.6 }]}>Sem</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Reservas</Text>
            <Text style={[styles.tableCell, { flex: 0.8 }]}>Ocup%</Text>
          </View>
          {classes.slice(0, 35).map((clase: Class) => {
            const occupancy =
              clase.spots > 0
                ? Math.round((clase.totalReservations / clase.spots) * 100)
                : 0;
            return (
              <View key={clase.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {formatDate(clase.date)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>
                  {formatTime(clase.date)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {clase.instructor.name}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>
                  {clase.discipline.name}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>
                  {clase.studio}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>
                  {clase.room}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.6 }]}>
                  {clase.week}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {clase.totalReservations}/{clase.spots}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>
                  {occupancy}%
                </Text>
              </View>
            );
          })}
        </View>

        {classes.length > 35 && (
          <Text style={{ marginTop: 10, fontSize: 8, color: "#666" }}>
            * Mostrando las primeras 35 clases de {classes.length} totales
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento generado el {new Date().toLocaleDateString("es-CO")} a las{" "}
            {new Date().toLocaleTimeString("es-CO")}
          </Text>
          <Text>Sistema de Gestión de Clases - Siclo</Text>
        </View>
      </Page>
    </Document>
  );
}
