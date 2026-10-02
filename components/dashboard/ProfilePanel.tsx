"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, FileText, Trash2, UploadCloud, CheckCircle2 } from "lucide-react";
import { COLORS } from "@/lib/theme";
import { updateProfileField } from "@/lib/auth";
import { DOC_LABELS, DocKey, DocMeta, deleteProfileDocument, uploadProfileDocument } from "@/lib/documents";

const DOC_KEYS: DocKey[] = ["photo", "idProof", "addressProof", "medicalCertificate"];
const INFO_FIELDS = [
  "age",
  "periodStartDate",
  "menarcheAge",
  "emergencyContactName",
  "emergencyContactPhone",
  "bloodGroup",
  "knownAllergies",
];

export default function ProfilePanel({
  uid,
  profile,
  onSaved,
}: {
  uid: string;
  profile: any;
  onSaved: () => void;
}) {
  const [age, setAge] = useState(profile.age ?? "");
  const [periodStartDate, setPeriodStartDate] = useState(profile.periodStartDate ?? "");
  const [menarcheAge, setMenarcheAge] = useState(profile.menarcheAge ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(profile.emergencyContactName ?? "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile.emergencyContactPhone ?? "");
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup ?? "");
  const [knownAllergies, setKnownAllergies] = useState(profile.knownAllergies ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const docs: Partial<Record<DocKey, DocMeta>> = profile.documents ?? {};

  const filledInfo = [
    age,
    periodStartDate,
    menarcheAge,
    emergencyContactName,
    emergencyContactPhone,
    bloodGroup,
    knownAllergies,
  ].filter((v) => v !== undefined && v !== "").length;
  const filledDocs = DOC_KEYS.filter((k) => docs[k]).length;
  const totalFields = INFO_FIELDS.length + DOC_KEYS.length + 1; // +1 for name, already set at signup
  const filledTotal = filledInfo + filledDocs + 1;
  const pct = Math.round((filledTotal / totalFields) * 100);

  async function saveInfo() {
    setSaving(true);
    try {
      await Promise.all([
        updateProfileField(uid, "age", age),
        updateProfileField(uid, "periodStartDate", periodStartDate),
        updateProfileField(uid, "menarcheAge", menarcheAge),
        updateProfileField(uid, "emergencyContactName", emergencyContactName),
        updateProfileField(uid, "emergencyContactPhone", emergencyContactPhone),
        updateProfileField(uid, "bloodGroup", bloodGroup),
        updateProfileField(uid, "knownAllergies", knownAllergies),
      ]);
      onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-4">
      <div className="px-5 pt-4 pb-3">
        <h2 className="font-display text-lg" style={{ color: COLORS.plum }}>Your profile</h2>
        <p className="text-xs font-body mt-0.5" style={{ color: `${COLORS.plum}77` }}>
          Personal details and documents, kept on your account only
        </p>
      </div>

      {/* Completion */}
      <div className="px-5 mb-4">
        <div className="p-4 rounded-2xl bg-white shadow-soft" style={{ border: `1px solid ${COLORS.mist}` }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold font-body" style={{ color: `${COLORS.plum}88` }}>Profile completion</span>
            <span className="text-xs font-bold font-body" style={{ color: COLORS.plum }}>{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: `${COLORS.plum}0E` }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${COLORS.rose} 0%, ${COLORS.gold} 100%)` }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="px-5 mb-4">
        <div className="p-5 rounded-2xl bg-white shadow-soft" style={{ border: `1px solid ${COLORS.mist}` }}>
          <h3 className="font-semibold text-sm font-body mb-4" style={{ color: COLORS.plum }}>Personal details</h3>
          <div className="flex flex-col gap-3">
            <LabeledInput label="Your age" type="number" value={age} onChange={setAge} />
            <LabeledInput label="Last period start date" type="date" value={periodStartDate} onChange={setPeriodStartDate} />
            <LabeledInput label="Age when periods started" type="number" value={menarcheAge} onChange={setMenarcheAge} />
            <LabeledInput label="Emergency contact name" value={emergencyContactName} onChange={setEmergencyContactName} />
            <LabeledInput label="Emergency contact phone" value={emergencyContactPhone} onChange={setEmergencyContactPhone} />
            <LabeledInput label="Blood group" value={bloodGroup} onChange={setBloodGroup} />
            <LabeledInput label="Known allergies (or 'None')" value={knownAllergies} onChange={setKnownAllergies} />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={saving}
            onClick={saveInfo}
            className="w-full py-3 rounded-xl font-semibold text-sm font-body mt-4 flex items-center justify-center gap-2"
            style={{ background: COLORS.plum, color: "#fff", opacity: saving ? 0.7 : 1 }}
          >
            {saved ? (<><CheckCircle2 size={15} /> Saved</>) : saving ? "Saving..." : "Save details"}
          </motion.button>
        </div>
      </div>

      {/* Documents */}
      <div className="px-5">
        <div className="p-5 rounded-2xl bg-white shadow-soft" style={{ border: `1px solid ${COLORS.mist}` }}>
          <h3 className="font-semibold text-sm font-body mb-1" style={{ color: COLORS.plum }}>Documents</h3>
          <p className="text-xs font-body mb-4" style={{ color: `${COLORS.plum}77` }}>
            Upload once — used to speed up scheme applications and verification. Max 5MB per file.
          </p>
          <div className="flex flex-col gap-3">
            {DOC_KEYS.filter((k) => k !== "medicalCertificate").map((key) => (
              <DocumentRow key={key} uid={uid} docKey={key} meta={docs[key]} onChanged={onSaved} />
            ))}
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${COLORS.mist}` }}>
            <HealthDocumentUpload uid={uid} meta={docs.medicalCertificate} consented={!!profile.healthDocConsent} onChanged={onSaved} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthDocumentUpload({
  uid,
  meta,
  consented,
  onChanged,
}: {
  uid: string;
  meta?: DocMeta;
  consented: boolean;
  onChanged: () => void;
}) {
  const [checked, setChecked] = useState(consented);
  const [saving, setSaving] = useState(false);

  async function handleConsent(next: boolean) {
    setChecked(next);
    setSaving(true);
    try {
      await updateProfileField(uid, "healthDocConsent", next);
      await updateProfileField(uid, "healthDocConsentAt", next ? new Date().toISOString() : null);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold font-body mb-2" style={{ color: COLORS.plum }}>Health document</p>
      <p className="text-[11px] font-body mb-3 leading-relaxed" style={{ color: `${COLORS.plum}77` }}>
        This is your most sensitive data — a medical certificate or health record. It's stored separately from your
        other documents and only visible to you (and your guardian, if you're under 10). We only upload it with your
        explicit say-so.
      </p>
      <label className="flex items-start gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          disabled={saving}
          onChange={(e) => handleConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-xs font-body" style={{ color: COLORS.plumSoft }}>
          I consent to uploading my health document to herLoop for my own record-keeping.
        </span>
      </label>
      {checked ? (
        <DocumentRow uid={uid} docKey="medicalCertificate" meta={meta} onChanged={onChanged} />
      ) : (
        <p className="text-[11px] font-body px-3 py-2.5 rounded-xl" style={{ background: `${COLORS.plum}06`, color: `${COLORS.plum}55` }}>
          Check the box above to enable this upload.
        </p>
      )}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold font-body block mb-1" style={{ color: `${COLORS.plum}77` }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border text-sm font-body"
        style={{ borderColor: COLORS.mist, background: COLORS.cream }}
      />
    </label>
  );
}

function DocumentRow({
  uid,
  docKey,
  meta,
  onChanged,
}: {
  uid: string;
  docKey: DocKey;
  meta?: DocMeta;
  onChanged: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadProfileDocument(uid, docKey, file);
      onChanged();
    } catch (err: any) {
      setError(err.message ?? "Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    setUploading(true);
    try {
      await deleteProfileDocument(uid, docKey);
      onChanged();
    } finally {
      setUploading(false);
    }
  }

  const Icon = docKey === "photo" ? Camera : FileText;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${COLORS.plum}06` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: meta ? `${COLORS.moss}20` : `${COLORS.plum}0E` }}>
        <Icon size={16} style={{ color: meta ? COLORS.moss : COLORS.plumSoft }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold font-body" style={{ color: COLORS.plum }}>{DOC_LABELS[docKey]}</p>
        {meta ? (
          <a href={meta.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-body truncate block" style={{ color: COLORS.rose }}>
            {meta.fileName}
          </a>
        ) : (
          <p className="text-[11px] font-body" style={{ color: `${COLORS.plum}55` }}>Not uploaded</p>
        )}
        {error && <p className="text-[11px] font-body mt-0.5" style={{ color: COLORS.rose }}>{error}</p>}
      </div>

      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />

      {meta ? (
        <button onClick={handleDelete} disabled={uploading} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${COLORS.rose}15` }}>
          <Trash2 size={14} style={{ color: COLORS.rose }} />
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${COLORS.plum}0E`, opacity: uploading ? 0.6 : 1 }}
        >
          <UploadCloud size={14} style={{ color: COLORS.plum }} />
        </button>
      )}
    </div>
  );
}
