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

/* ----- fixed palette (from the printed reference card) ----- */
const NAVY = "#152a6e";   // header band
const YELLOW = "#f4c81e"; // event title
const RED = "#d8281c";    // "CHEST CARD" band + footer warning
const BODY = "#e9eb9e";   // pale-yellow card body
const INK = "#15213f";    // dark text on the yellow body
const LABEL = "#5c5f37";  // muted olive for field labels
const WHITE = "#FFFFFF";

const styles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    fontFamily: "Helvetica",
    flexDirection: "column",
  },

  /* ---- one full-bleed card ---- */
  card: { flex: 1, overflow: "hidden" },

  /* header */
  header: {
    backgroundColor: NAVY,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 22,
    gap: 16,
  },
  logo: { width: 104, height: 50, objectFit: "contain" },
  headTitles: { flex: 1 },
  eventTitle: { fontSize: 21, fontWeight: 700, color: YELLOW, letterSpacing: 1 },
  district: { fontSize: 12, fontWeight: 700, color: WHITE, letterSpacing: 1, marginTop: 2 },
  website: { fontSize: 7, color: "#C7D0F0", marginTop: 3, letterSpacing: 0.5 },

  /* red band */
  band: { backgroundColor: RED, paddingVertical: 5, alignItems: "center" },
  bandText: { fontSize: 15, fontWeight: 700, color: WHITE, letterSpacing: 3 },

  /* yellow body */
  body: { flex: 1, backgroundColor: BODY, paddingTop: 22, paddingBottom: 14, paddingHorizontal: 26, justifyContent: "space-between" },
  bodyRow: { flexDirection: "row", gap: 18 },

  /* details */
  detailsCol: { flex: 1 },
  rollRow: { flexDirection: "column", alignItems: "flex-start", marginBottom: 7 },
  rollLabel: { fontSize: 9, fontWeight: 700, color: LABEL, letterSpacing: 1.2, marginBottom: 1 },
  rollValue: { fontSize: 23, fontWeight: 700, color: RED },
  name: { fontSize: 20, fontWeight: 700, color: INK, lineHeight: 1.05 },
  category: { fontSize: 12, fontWeight: 700, color: NAVY, marginTop: 3, letterSpacing: 0.5 },

  grid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%", marginBottom: 8, paddingRight: 8 },
  cellFull: { width: "100%", marginBottom: 8, paddingRight: 8 },
  cellLabel: { fontSize: 9, fontWeight: 700, color: LABEL, letterSpacing: 1, marginBottom: 2 },
  cellValue: { fontSize: 13, color: INK, fontWeight: 700 },

  /* photo */
  photoWrap: { width: 118, height: 144, border: `1.5pt solid ${NAVY}`, backgroundColor: WHITE, overflow: "hidden" },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  photoPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#F3F4F6" },
  photoInitial: { fontSize: 50, fontWeight: 700, color: "#9CA3AF" },
  photoCaption: { fontSize: 6.5, color: LABEL, textAlign: "center", marginTop: 3, letterSpacing: 0.8 },

  /* footer */
  footer: { marginTop: 10 },
  warning: { fontSize: 9, fontWeight: 700, color: RED, textAlign: "center" },
  contact: { fontSize: 7, color: "#3a3d22", textAlign: "center", marginTop: 3 },

  /* cut guide between the two cards */
  cutRow: { flexDirection: "row", alignItems: "center", height: 16, paddingHorizontal: 4 },
  cutTick: { width: 1, height: 9, backgroundColor: "#777" },
  cutDash: { flex: 1, borderTopWidth: 1, borderTopStyle: "dashed", borderTopColor: "#9aa", marginHorizontal: 3 },
});

export interface ChestCardProps {
  student: Student;
  logoUrl: string;
  eventName?: string;
}

export interface ChestCardSheetProps {
  students: Student[];
  logoUrl: string;
  eventName?: string;
}

function Card({ student, logoUrl }: { student: Student; logoUrl: string }) {
  const initial = student.full_name.trim().charAt(0).toUpperCase() || "?";
  return (
    <View style={styles.card}>
      {/* header */}
      <View style={styles.header}>
        {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
        <View style={styles.headTitles}>
          <Text style={styles.eventTitle}>DEKHAO APNA TALENT</Text>
          <Text style={styles.district}>DISTRICT COMPETITION {student.event_year}</Text>
          <Text style={styles.website}>www.mindmantraabacus.com</Text>
        </View>
      </View>

      {/* red band */}
      <View style={styles.band}>
        <Text style={styles.bandText}>CHEST CARD</Text>
      </View>

      {/* yellow body */}
      <View style={styles.body}>
        <View style={styles.bodyRow}>
          <View style={styles.detailsCol}>
            <View style={styles.rollRow}>
              <Text style={styles.rollLabel}>ROLL NO.</Text>
              <Text style={styles.rollValue}>{student.roll_number ?? "—"}</Text>
            </View>
            <Text style={styles.name}>{student.full_name}</Text>
            <Text style={styles.category}>{student.category_name.toUpperCase()}</Text>

            <View style={styles.grid}>
              <Cell label="Guardian" value={student.guardian_name} />
              <Cell label="Age" value={`${student.age} yrs`} />
              <Cell label="Class" value={student.class ?? "—"} />
              <Cell label="Phone" value={student.phone ?? "—"} />
              <Cell label="School" value={student.school_name ?? "—"} full />
              <Cell label="Centre" value={student.center_name} full />
            </View>
          </View>

          <View>
            <View style={styles.photoWrap}>
              {student.photo_url ? (
                <Image src={student.photo_url} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoInitial}>{initial}</Text>
                </View>
              )}
            </View>
            <Text style={styles.photoCaption}>STUDENT PHOTO</Text>
          </View>
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Text style={styles.warning}>
            Every student must wear the chest card on their chest and come to the exam hall.
          </Text>
          <Text style={styles.contact}>
            www.mindmantraabacus.com · mindmantraabacus@gmail.com · facebook.com/MindMantraAbacus
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Dashed cut guide with end ticks — the line to cut to separate the cards. */
function CutGuide() {
  return (
    <View style={styles.cutRow}>
      <View style={styles.cutTick} />
      <View style={styles.cutDash} />
      <View style={styles.cutTick} />
    </View>
  );
}

/**
 * One A4 page holding two card slots (top + bottom) separated by a cut guide.
 * A `null` slot is left blank — used for single-student downloads (bottom blank)
 * and the trailing odd card on a bulk sheet.
 */
function CardPage({
  top,
  bottom,
  logoUrl,
}: {
  top: Student | null;
  bottom: Student | null;
  logoUrl: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={{ flex: 1 }}>
        {top ? <Card student={top} logoUrl={logoUrl} /> : <View style={styles.card} />}
      </View>
      <CutGuide />
      <View style={{ flex: 1 }}>
        {bottom ? <Card student={bottom} logoUrl={logoUrl} /> : <View style={styles.card} />}
      </View>
    </Page>
  );
}

/** Single student: card on top, the second slot left blank. */
export function ChestCardDocument({ student, logoUrl }: ChestCardProps) {
  return (
    <Document title={`Chest Card — ${student.roll_number ?? student.full_name}`}>
      <CardPage top={student} bottom={null} logoUrl={logoUrl} />
    </Document>
  );
}

/**
 * Bulk sheet: students packed two-per-page (different students top & bottom).
 * An odd final student leaves the bottom slot blank.
 */
export function ChestCardSheetDocument({ students, logoUrl }: ChestCardSheetProps) {
  const pages: Array<[Student | null, Student | null]> = [];
  for (let i = 0; i < students.length; i += 2) {
    pages.push([students[i], students[i + 1] ?? null]);
  }
  return (
    <Document title="Chest Cards">
      {pages.map(([top, bottom], i) => (
        <CardPage key={i} top={top} bottom={bottom} logoUrl={logoUrl} />
      ))}
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
