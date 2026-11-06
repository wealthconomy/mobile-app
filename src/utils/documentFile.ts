import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { Alert, Platform } from "react-native";
import { suspendAppLock } from "../store/slices/appStatusSlice";

export interface DocumentMaterialLike {
  id?: string;
  title?: string;
  documentUrl?: string;
  fileType?: string;
  isDownloadable?: boolean;
}

/**
 * Returns the extension at the end of documentUrl's path (ignoring any query string
 * or hash fragment) when it is 'pdf', 'doc', or 'docx'; otherwise returns null.
 */
export function getExtension(
  material?: DocumentMaterialLike | null
): "pdf" | "doc" | "docx" | null {
  if (!material?.documentUrl) return null;
  try {
    const cleanUrl = material.documentUrl.split("?")[0].split("#")[0];
    const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
      const ext = match[1].toLowerCase();
      if (ext === "pdf" || ext === "doc" || ext === "docx") {
        return ext;
      }
    }
  } catch {
    // ignore parsing errors
  }
  return null;
}

/**
 * Converts a base64 string into an array of unsigned 8-bit byte values.
 */
function base64ToBytes(base64: string): number[] {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < base64.length; i++) {
    const c = base64[i];
    if (c === "=" || c === "\r" || c === "\n") break;
    const val = chars.indexOf(c);
    if (val === -1) continue;
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

/**
 * Reads the initial bytes of a downloaded local file and detects its real format:
 * - "pdf" for %PDF (0x25 0x50 0x44 0x46)
 * - "docx" for PK (0x50 0x4B - ZIP container)
 * - "doc" for D0 CF 11 E0 (OLE2 Compound File Binary Format)
 * Returns null if unrecognized.
 */
export async function sniffExtension(
  localUri: string
): Promise<"pdf" | "docx" | "doc" | null> {
  try {
    let base64: string | null = null;
    try {
      base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
        position: 0,
        length: 32,
      });
    } catch {
      // Fallback if position/length option is not supported on certain platforms
      const full = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64 = full ? full.slice(0, 64) : null;
    }

    if (!base64) return null;

    const bytes = base64ToBytes(base64);
    if (bytes.length < 4) return null;

    // PDF magic bytes: "%PDF" (0x25 0x50 0x44 0x46)
    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      return "pdf";
    }

    // DOCX (ZIP archive container): "PK" (0x50 0x4B)
    if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
      return "docx";
    }

    // DOC (Word 97-2004 Compound File): 0xD0 0xCF 0x11 0xE0
    if (
      bytes[0] === 0xd0 &&
      bytes[1] === 0xcf &&
      bytes[2] === 0x11 &&
      bytes[3] === 0xe0
    ) {
      return "doc";
    }

    return null;
  } catch {
    console.warn("[documentFile] Error sniffing extension");
    return null;
  }
}

/**
 * Maps extension to standard MIME type.
 */
export function mimeFor(ext: string): string {
  const normalized = ext.toLowerCase().replace(/^\./, "");
  switch (normalized) {
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return "application/octet-stream";
  }
}

/**
 * Maps extension to Apple Uniform Type Identifier (UTI).
 */
export function utiFor(ext: string): string {
  const normalized = ext.toLowerCase().replace(/^\./, "");
  switch (normalized) {
    case "pdf":
      return "com.adobe.pdf";
    case "doc":
      return "com.microsoft.word.doc";
    case "docx":
      return "org.openxmlformats.wordprocessingml.document";
    default:
      return "public.data";
  }
}

/**
 * Generates a clean filename with sanitized title and extension (e.g. "Investment_Guide.pdf").
 */
export function safeFileName(
  title: string | undefined,
  ext: string
): string {
  const cleanTitle =
    (title || "document")
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "document";
  const normalizedExt = ext.startsWith(".")
    ? ext.toLowerCase()
    : `.${ext.toLowerCase()}`;
  return `${cleanTitle}${normalizedExt}`;
}

/**
 * Resolves a stored relative path or legacy absolute URI to a valid current absolute URI.
 * Stored relative path format: "library/<id>.<ext>"
 * Legacy absolute path format: "file:///.../library/<id>.<ext>"
 */
export function resolveDocumentUri(rawPathOrUri?: string | null): string | null {
  if (!rawPathOrUri) return null;
  const docDir = FileSystem.documentDirectory;
  if (!docDir) return null;

  // If already relative "library/..."
  if (rawPathOrUri.startsWith("library/")) {
    return `${docDir}${rawPathOrUri}`;
  }

  // If contains "library/", extract the relative part
  const libraryIndex = rawPathOrUri.indexOf("library/");
  if (libraryIndex !== -1) {
    const relative = rawPathOrUri.substring(libraryIndex);
    return `${docDir}${relative}`;
  }

  return null;
}

/**
 * Returns true if the material is a PDF:
 * getExtension is "pdf", or getExtension is null and fileType is "PDF".
 */
export function isPdf(
  material?: DocumentMaterialLike | null
): boolean {
  if (!material) return false;
  const ext = getExtension(material);
  if (ext === "pdf") return true;
  if (ext === null && material.fileType?.toUpperCase() === "PDF") return true;
  return false;
}

/**
 * Downloads a document, sniffs the actual file type, moves it into
 * FileSystem.documentDirectory + "library/" as <materialId>.<ext>, and shares it
 * using the appropriate MIME type and UTI.
 * Returns { uri, relativePath, ext, documentUrl } on success and null on failure.
 */
export async function downloadAndShareDocument(
  material: DocumentMaterialLike,
  options?: {
    onRecordDownload?: (id: string) => void;
    setIsDownloading?: (loading: boolean) => void;
  }
): Promise<{
  uri: string;
  relativePath: string;
  ext: "pdf" | "docx" | "doc";
  documentUrl?: string;
} | null> {
  if (!material.documentUrl) {
    Alert.alert("Error", "No document URL available for this material.");
    return null;
  }

  options?.setIsDownloading?.(true);

  const tempUri = `${FileSystem.cacheDirectory}temp_download_${Date.now()}`;
  let finalUri: string | null = null;
  let relativePath: string | null = null;

  try {
    const downloadResult = await FileSystem.downloadAsync(
      material.documentUrl,
      tempUri
    );

    if (downloadResult.status !== 200) {
      try {
        await FileSystem.deleteAsync(tempUri, { idempotent: true });
      } catch {}
      Alert.alert(
        "Download Failed",
        "Could not download the file. Please try again."
      );
      return null;
    }

    // Sniff actual file format from file header bytes
    const detectedExt = await sniffExtension(downloadResult.uri);

    if (!detectedExt) {
      try {
        await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });
      } catch {}
      Alert.alert(
        "Download Error",
        "This file can't be opened. It may need to be uploaded again."
      );
      return null;
    }

    // Permanent destination: FileSystem.documentDirectory + "library/"
    const libraryDir = `${FileSystem.documentDirectory}library/`;
    const dirInfo = await FileSystem.getInfoAsync(libraryDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(libraryDir, { intermediates: true });
    }

    const safeId = (material.id || `material_${Date.now()}`).replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );
    relativePath = `library/${safeId}.${detectedExt}`;
    finalUri = `${libraryDir}${safeId}.${detectedExt}`;

    // If a saved copy for this material already exists, replace it
    const existingFile = await FileSystem.getInfoAsync(finalUri);
    if (existingFile.exists) {
      await FileSystem.deleteAsync(finalUri, { idempotent: true });
    }

    await FileSystem.moveAsync({
      from: downloadResult.uri,
      to: finalUri,
    });

    // Call recordDownload only after a successful download
    if (material.id && options?.onRecordDownload) {
      try {
        options.onRecordDownload(material.id);
      } catch {
        console.warn("[documentFile] Failed to record download");
      }
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      // Create a temporary copy named with the human-readable title so iOS/Android Save to Files shows the title instead of cmvj...
      const shareFileName = safeFileName(material.title, detectedExt);
      const shareUri = `${FileSystem.cacheDirectory}${shareFileName}`;

      try {
        await FileSystem.deleteAsync(shareUri, { idempotent: true });
      } catch {}

      await FileSystem.copyAsync({
        from: finalUri,
        to: shareUri,
      });

      suspendAppLock(true);
      try {
        await Sharing.shareAsync(shareUri, {
          mimeType: mimeFor(detectedExt),
          UTI: utiFor(detectedExt),
          dialogTitle: `Open ${material.title || "Document"}`,
        });
      } catch {
        console.error("[documentFile] Share error");
        Alert.alert(
          "Unable to Open Document",
          "Could not open or share the downloaded file."
        );
      } finally {
        suspendAppLock(false);
      }
    } else {
      Alert.alert(
        "Downloaded",
        `"${material.title || "Document"}" saved to your device.`
      );
    }

    return {
      uri: finalUri,
      relativePath,
      ext: detectedExt,
      documentUrl: material.documentUrl,
    };
  } catch {
    console.error("[documentFile] Download error");
    Alert.alert(
      "Download Failed",
      "Something went wrong while downloading the file. Please check your connection and try again."
    );
    return null;
  } finally {
    options?.setIsDownloading?.(false);
  }
}

/**
 * Opens an already saved downloaded document from local storage without recording a download again.
 * Returns true if opened successfully, or false if the file is missing/unopenable.
 */
export async function openDownloadedDocument(
  info: { uri?: string; relativePath?: string; ext: string },
  title?: string
): Promise<boolean> {
  try {
    const fileUri = info.uri || resolveDocumentUri(info.relativePath);
    if (!fileUri) return false;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      return false;
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      // Create a temporary copy named with the human-readable title so iOS/Android Save to Files shows the title instead of cmvj...
      const shareFileName = safeFileName(title, info.ext);
      const shareUri = `${FileSystem.cacheDirectory}${shareFileName}`;

      try {
        await FileSystem.deleteAsync(shareUri, { idempotent: true });
      } catch {}

      await FileSystem.copyAsync({
        from: fileUri,
        to: shareUri,
      });

      suspendAppLock(true);
      try {
        await Sharing.shareAsync(shareUri, {
          mimeType: mimeFor(info.ext),
          UTI: utiFor(info.ext),
          dialogTitle: `Open ${title || "Document"}`,
        });
      } catch {
        console.error("[documentFile] Share error");
        Alert.alert(
          "Unable to Open Document",
          "Could not open or share the downloaded file."
        );
      } finally {
        suspendAppLock(false);
      }
    } else {
      Alert.alert(
        "Downloaded",
        `"${title || "Document"}" is saved on your device.`
      );
    }
    return true;
  } catch {
    console.error("[documentFile] Error opening downloaded document");
    Alert.alert(
      "Unable to Open Document",
      "An error occurred while opening the downloaded file."
    );
    return false;
  }
}

/**
 * Opens a PDF document inside the app browser.
 * Note: this is an interim reader; a dedicated in-app PDF reader is planned.
 */
export async function openDocumentInApp(
  material: DocumentMaterialLike
): Promise<boolean> {
  if (!material.documentUrl) {
    Alert.alert("Error", "No document URL available for this material.");
    return false;
  }

  if (!isPdf(material)) {
    Alert.alert("Notice", "This material is not available to read in the app.");
    return false;
  }

  const ext = getExtension(material);

  // Interim reader: on iOS with a .pdf URL, Safari renders PDF directly inline.
  // On Android, or when the URL has no .pdf extension, Google Docs Viewer embeds the PDF.
  // Note: A real in-app PDF reader is planned.
  const targetUrl =
    Platform.OS === "ios" && ext === "pdf"
      ? material.documentUrl
      : `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(
          material.documentUrl
        )}`;

  suspendAppLock(true);
  try {
    await WebBrowser.openBrowserAsync(targetUrl);
    return true;
  } catch {
    console.error("[documentFile] Error opening document in browser");
    Alert.alert(
      "Unable to Open Document",
      "Could not open the document preview. Please check your internet connection or verify the link."
    );
    return false;
  } finally {
    suspendAppLock(false);
  }
}
