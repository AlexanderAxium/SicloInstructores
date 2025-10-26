import type { InstructorFromAPI } from "@/types/instructor";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Extended type for PDF with all the data from getAll endpoint
type InstructorForPDF = InstructorFromAPI & {
  disciplines?: Array<{
    id: string;
    name: string;
    color?: string | null;
  }>;
  classes?: Array<{
    id: string;
    date: string;
    totalReservations: number;
    paidReservations: number;
    spots: number;
    discipline: {
      name: string;
      color?: string | null;
    };
  }>;
  payments?: Array<{
    id: string;
    amount: number;
    finalPayment: number;
    status: string;
    period: {
      number: number;
      year: number;
    };
  }>;
};

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
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    padding: 3,
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e0e0e0",
    padding: 3,
    fontSize: 8,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 2,
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
  badge: {
    padding: "2pt 6pt",
    borderRadius: 3,
    fontSize: 8,
    backgroundColor: "#10b981",
    color: "#fff",
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

interface InstructorListPDFProps {
  instructors: InstructorForPDF[];
  totalCount: number;
}

export function InstructorListPDF({
  instructors,
  totalCount,
}: InstructorListPDFProps) {
  const _formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-PE");
  };

  const activeInstructors = instructors.filter((i) => i.active);
  const inactiveInstructors = instructors.filter((i) => !i.active);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LISTADO DE INSTRUCTORES</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Siclo</Text>
        </View>

        {/* Resumen */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Instructores:</Text>
            <Text style={styles.summaryValue}>{totalCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Instructores Activos:</Text>
            <Text style={styles.summaryValue}>{activeInstructors.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Instructores Inactivos:</Text>
            <Text style={styles.summaryValue}>
              {inactiveInstructors.length}
            </Text>
          </View>
        </View>

        {/* Tabla de Instructores */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>Nombre</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>
              Nombre Completo
            </Text>
            <Text style={styles.tableCell}>Teléfono</Text>
            <Text style={styles.tableCell}>DNI</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>Disciplinas</Text>
            <Text style={styles.tableCell}>Total Clases</Text>
            <Text style={styles.tableCell}>Total Pagos</Text>
            <Text style={styles.tableCell}>Estado</Text>
            <Text style={styles.tableCell}>Fecha Creación</Text>
          </View>
          {instructors.map((instructor) => (
            <View key={instructor.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {instructor.name}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {instructor.fullName || "N/A"}
              </Text>
              <Text style={styles.tableCell}>{instructor.phone || "N/A"}</Text>
              <Text style={styles.tableCell}>{instructor.DNI || "N/A"}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {instructor.disciplines?.map((d) => d.name).join(", ") || "N/A"}
              </Text>
              <Text style={styles.tableCell}>
                {instructor.classes?.length || 0}
              </Text>
              <Text style={styles.tableCell}>
                {instructor.payments?.length || 0}
              </Text>
              <Text style={styles.tableCell}>
                {instructor.active ? "Activo" : "Inactivo"}
              </Text>
              <Text style={styles.tableCell}>
                {_formatDate(instructor.createdAt)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento generado el {new Date().toLocaleDateString("es-PE")}
          </Text>
          <Text>Sistema de Gestión de Instructores - Siclo</Text>
        </View>
      </Page>
    </Document>
  );
}
