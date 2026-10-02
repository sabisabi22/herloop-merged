import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./cloudinaryConfig";
import { updateProfileField, getUserProfile } from "./auth";

export type DocKey = "photo" | "idProof" | "addressProof" | "medicalCertificate";

export const DOC_LABELS: Record<DocKey, string> = {
  photo: "Profile photo",
  idProof: "ID proof (Aadhaar / school ID)",
  addressProof: "Address proof",
  medicalCertificate: "Medical certificate",
};

export interface DocMeta {
  fileName: string;
  url: string;
  publicId: string;
  uploadedAt: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadProfileDocument(uid: string, key: DocKey, file: File): Promise<DocMeta> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File is too large — please upload something under 5MB.");
  }
  if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME") {
    throw new Error("Cloudinary isn't set up yet — add your cloud name and upload preset in lib/cloudinaryConfig.ts.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `herloop/${uid}`);

  // Images use the /image/upload endpoint; PDFs and other docs need /raw/upload.
  const isImage = file.type.startsWith("image/");
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${isImage ? "image" : "raw"}/upload`;

  const res = await fetch(endpoint, { method: "POST", body: formData });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message ?? "Upload failed. Check your Cloudinary setup.");
  }
  const data = await res.json();

  const meta: DocMeta = {
    fileName: file.name,
    url: data.secure_url,
    publicId: data.public_id,
    uploadedAt: new Date().toISOString(),
  };

  const profile = await getUserProfile(uid);
  const documents = { ...(profile?.documents ?? {}), [key]: meta };
  await updateProfileField(uid, "documents", documents);

  return meta;
}

// Cloudinary deletion needs a signed request (API secret), which can't run
// safely from the browser. This removes the reference from the user's
// profile; the file itself stays in Cloudinary (harmless — well within the
// free tier for a project like this).
export async function deleteProfileDocument(uid: string, key: DocKey) {
  const profile = await getUserProfile(uid);
  const documents = { ...(profile?.documents ?? {}) };
  delete documents[key];
  await updateProfileField(uid, "documents", documents);
}
