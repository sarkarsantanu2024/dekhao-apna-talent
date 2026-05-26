/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Student } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 24, backgroundColor: "#fff", fontFamily: "Helvetica" },
  card: {
    border: "2pt solid #b91c1c",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    gap: 16,
  },
  left: { width: 130, alignItems: "center" },
  photo: {
    width: 110,
    height: 130,
    objectFit: "cover",
    border: "1pt solid #999",
  },
  qr: { width: 90, height: 90, marginTop: 10 },
  right: { flex: 1, justifyContent: "space-between" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  logo: { fontSize: 14, fontWeight: 700, color: "#b91c1c" },
  year: { fontSize: 10, color: "#444" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  label: { fontSize: 8, color: "#666", textTransform: "uppercase" },
  value: { fontSize: 12, marginBottom: 6, fontWeight: 700 },
  roll: { fontSize: 18, color: "#b91c1c", fontWeight: 700, marginTop: 4 },
  footer: { marginTop: 14, fontSize: 8, color: "#888", textAlign: "center" },
});

export interface ChestCardProps {
  student: Pick<
    Student,
    "full_name" | "guardian_name" | "category_name" | "center_name" | "roll_number" | "photo_url" | "event_year"
  >;
  qrDataUrl: string;
  eventName?: string;
}

export function ChestCardDocument({ student, qrDataUrl, eventName = "Dekhao Apna Talent" }: ChestCardProps) {
  return (
    <Document title={`Chest Card — ${student.roll_number ?? student.full_name}`}>
      <Page size="A5" orientation="landscape" style={styles.page}>
        <View style={styles.card}>
          <View style={styles.left}>
            {student.photo_url ? <Image src={student.photo_url} style={styles.photo} /> : <View style={styles.photo} />}
            <Image src={qrDataUrl} style={styles.qr} />
          </View>
          <View style={styles.right}>
            <View style={styles.header}>
              <Text style={styles.logo}>MIND MANTRA ABACUS</Text>
              <Text style={styles.year}>{student.event_year}</Text>
            </View>
            <Text style={styles.title}>{eventName}</Text>

            <View>
              <Text style={styles.label}>Roll Number</Text>
              <Text style={styles.roll}>{student.roll_number ?? "—"}</Text>

              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{student.full_name}</Text>

              <Text style={styles.label}>Guardian</Text>
              <Text style={styles.value}>{student.guardian_name}</Text>

              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{student.category_name}</Text>

              <Text style={styles.label}>Centre</Text>
              <Text style={styles.value}>{student.center_name}</Text>
            </View>

            <Text style={styles.footer}>
              This card must be presented at the audition venue. Issued by Mind Mantra Abacus.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
