/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Student } from "@/types";

/* ----- palette / spec ----- */
const ORANGE = "#A855F7";
const INK    = "#0E1330";
const MUTED  = "#6B7280";
const HAIR   = "#E5E7EB";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    color: INK,
  },
  card: {
    flex: 1,
    border: `2pt solid ${ORANGE}`,
    borderRadius: 12,
    overflow: "hidden",
  },

  /* ---- header ribbon ---- */
  ribbon: {
    backgroundColor: INK,
    color: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: "#FFFFFF" },
  brandAccent: { color: ORANGE, fontWeight: 700 },
  edition: { fontSize: 9, color: "#FFFFFF", letterSpacing: 1.5 },

  /* ---- body ---- */
  body: { flexDirection: "row", padding: 18, gap: 18, flex: 1 },

  /* photo column */
  photoCol: { width: 200, alignItems: "center" },
  photoWrap: {
    width: 200,
    height: 240,
    border: `1.5pt solid ${ORANGE}`,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  photoPlaceholder: {
    width: "100%", height: "100%",
    alignItems: "center", justifyContent: "center",
  },
  photoInitial: { fontSize: 64, fontWeight: 700, color: "#9CA3AF" },

  qrWrap: {
    marginTop: 12,
    padding: 6,
    border: `1pt solid ${HAIR}`,
    borderRadius: 6,
    alignItems: "center",
  },
  qr: { width: 96, height: 96 },
  qrCaption: { fontSize: 7, color: MUTED, marginTop: 4, letterSpacing: 1 },

  /* details column */
  detailsCol: { flex: 1, justifyContent: "space-between" },

  rollBlock: {
    backgroundColor: "#FFF1EC",
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
    borderLeftStyle: "solid",
    padding: 10,
    borderRadius: 4,
  },
  rollLabel: { fontSize: 8, color: MUTED, letterSpacing: 1.5, fontWeight: 700 },
  rollValue: { fontSize: 24, color: ORANGE, fontWeight: 700, marginTop: 2 },

  name: { fontSize: 26, fontWeight: 700, marginTop: 14, color: INK, lineHeight: 1.05 },
  category: { fontSize: 11, color: ORANGE, fontWeight: 700, marginTop: 4, letterSpacing: 1 },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 0 },
  cell: { width: "50%", marginBottom: 10, paddingRight: 6 },
  cellFull: { width: "100%", marginBottom: 10, paddingRight: 6 },
  cellLabel: { fontSize: 7, color: MUTED, letterSpacing: 1.5, fontWeight: 700, marginBottom: 2 },
  cellValue: { fontSize: 10, color: INK },

  /* footer */
  footer: {
    borderTopWidth: 1, borderTopColor: HAIR, borderTopStyle: "solid",
    paddingTop: 8, marginTop: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerText: { fontSize: 7, color: MUTED, letterSpacing: 0.5 },
  signLine: { fontSize: 8, color: MUTED },
});

export interface ChestCardProps {
  student: Student;
  qrDataUrl: string;
  eventName?: string;
}

export function ChestCardDocument({
  student,
  qrDataUrl,
  eventName = "Dekhao Apna Talent",
}: ChestCardProps) {
  const initial = student.full_name.trim().charAt(0).toUpperCase() || "?";
  return (
    <Document title={`Chest Card — ${student.roll_number ?? student.full_name}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.card}>
          {/* ribbon */}
          <View style={styles.ribbon}>
            <Text style={styles.brand}>
              MIND MANTRA <Text style={styles.brandAccent}>· DEKHAO APNA TALENT</Text>
            </Text>
            <Text style={styles.edition}>EDITION {student.event_year}</Text>
          </View>

          {/* body */}
          <View style={styles.body}>
            {/* photo + QR */}
            <View style={styles.photoCol}>
              <View style={styles.photoWrap}>
                {student.photo_url ? (
                  <Image src={student.photo_url} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoInitial}>{initial}</Text>
                  </View>
                )}
              </View>
              <View style={styles.qrWrap}>
                <Image src={qrDataUrl} style={styles.qr} />
                <Text style={styles.qrCaption}>SCAN TO VERIFY</Text>
              </View>
            </View>

            {/* details */}
            <View style={styles.detailsCol}>
              <View>
                <View style={styles.rollBlock}>
                  <Text style={styles.rollLabel}>CHEST ROLL NUMBER</Text>
                  <Text style={styles.rollValue}>{student.roll_number ?? "—"}</Text>
                </View>

                <Text style={styles.name}>{student.full_name}</Text>
                <Text style={styles.category}>{student.category_name.toUpperCase()}</Text>

                <View style={styles.grid}>
                  <Cell label="Guardian"          value={student.guardian_name} />
                  <Cell label="Date of birth"     value={student.dob} />
                  <Cell label="Age"               value={`${student.age} yrs`} />
                  <Cell label="Class"             value={student.class ?? "—"} />
                  <Cell label="School"            value={student.school_name ?? "—"} full />
                  <Cell label="Centre"            value={student.center_name} full />
                  <Cell label="Phone"             value={student.phone ?? "—"} />
                  <Cell label="City / State"      value={[student.city, student.state].filter(Boolean).join(", ") || "—"} />
                  {student.performance_topic && (
                    <Cell label="Performance"     value={student.performance_topic} full />
                  )}
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {eventName} · Present this card at the audition venue. Issued by Mind Mantra Abacus.
                </Text>
                <Text style={styles.signLine}>Authorised signature ✓</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function Cell({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <View style={full ? styles.cellFull : styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}
