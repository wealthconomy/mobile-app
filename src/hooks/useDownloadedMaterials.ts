import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { resolveDocumentUri } from "../utils/documentFile";

export interface DownloadedMaterialInfo {
  relativePath: string;
  uri?: string;
  ext: "pdf" | "docx" | "doc" | string;
  documentUrl?: string;
  savedAt: number;
}

export type DownloadedMaterialsMap = Record<string, DownloadedMaterialInfo>;

export function useDownloadedMaterials() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || user?._id || "guest";
  const storageKey = `@wealth_downloaded_materials_${userId}`;

  const [downloads, setDownloads] = useState<DownloadedMaterialsMap>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load, normalize relative paths, and prune missing files
  const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (!raw) {
        setDownloads({});
        setIsLoaded(true);
        return;
      }

      const parsed: Record<string, any> = JSON.parse(raw);
      const validEntries: DownloadedMaterialsMap = {};
      let hasChanges = false;

      for (const [id, entry] of Object.entries(parsed)) {
        if (!entry) {
          hasChanges = true;
          continue;
        }

        // Support both new relativePath and legacy uri starting with file:
        const rawPath = entry.relativePath || entry.uri;
        const resolvedUri = resolveDocumentUri(rawPath);

        if (!resolvedUri) {
          hasChanges = true;
          continue;
        }

        try {
          const fileInfo = await FileSystem.getInfoAsync(resolvedUri);
          if (fileInfo.exists) {
            // Keep strictly relative path "library/<id>.<ext>" for storage
            const relativePath = resolvedUri.includes("library/")
              ? `library/${resolvedUri.split("library/").pop()}`
              : `library/${id}.${entry.ext || "pdf"}`;

            validEntries[id] = {
              relativePath,
              uri: resolvedUri,
              ext: entry.ext || "pdf",
              documentUrl: entry.documentUrl,
              savedAt: entry.savedAt || Date.now(),
            };

            // Migrate old records that had absolute uri stored
            if (!entry.relativePath || entry.uri) {
              hasChanges = true;
            }
          } else {
            hasChanges = true;
          }
        } catch {
          hasChanges = true;
        }
      }

      setDownloads(validEntries);
      if (hasChanges) {
        const toSave: Record<string, any> = {};
        for (const [k, v] of Object.entries(validEntries)) {
          toSave[k] = {
            relativePath: v.relativePath,
            ext: v.ext,
            documentUrl: v.documentUrl,
            savedAt: v.savedAt,
          };
        }
        await AsyncStorage.setItem(storageKey, JSON.stringify(toSave));
      }
    } catch {
      console.warn("[useDownloadedMaterials] Error loading downloads");
      setDownloads({});
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isDownloaded = useCallback(
    (id?: string | null, currentDocumentUrl?: string | null): boolean => {
      if (!id) return false;
      const entry = downloads[id];
      if (!entry) return false;

      // If material's documentUrl has changed on the backend/admin, treat as not downloaded
      if (
        currentDocumentUrl &&
        entry.documentUrl &&
        entry.documentUrl !== currentDocumentUrl
      ) {
        return false;
      }
      return true;
    },
    [downloads]
  );

  const getDownload = useCallback(
    (id?: string | null, currentDocumentUrl?: string | null): DownloadedMaterialInfo | null => {
      if (!id) return null;
      const entry = downloads[id];
      if (!entry) return null;

      // If documentUrl changed, return null so caller initiates re-download
      if (
        currentDocumentUrl &&
        entry.documentUrl &&
        entry.documentUrl !== currentDocumentUrl
      ) {
        return null;
      }
      return entry;
    },
    [downloads]
  );

  const markDownloaded = useCallback(
    async (
      id: string,
      info: {
        uri?: string;
        relativePath?: string;
        ext: string;
        documentUrl?: string;
      }
    ) => {
      if (!id) return;
      const relativePath =
        info.relativePath ||
        (info.uri && info.uri.includes("library/")
          ? `library/${info.uri.split("library/").pop()}`
          : `library/${id}.${info.ext}`);

      const resolvedUri = resolveDocumentUri(relativePath);

      const newEntry: DownloadedMaterialInfo = {
        relativePath,
        uri: resolvedUri || info.uri || "",
        ext: info.ext,
        documentUrl: info.documentUrl,
        savedAt: Date.now(),
      };

      const nextDownloads = { ...downloads, [id]: newEntry };
      setDownloads(nextDownloads);

      // Write to AsyncStorage once, outside setState updater
      const toSave: Record<string, any> = {};
      for (const [k, v] of Object.entries(nextDownloads)) {
        toSave[k] = {
          relativePath: v.relativePath,
          ext: v.ext,
          documentUrl: v.documentUrl,
          savedAt: v.savedAt,
        };
      }

      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(toSave));
      } catch {
        console.warn("[useDownloadedMaterials] Error persisting download");
      }
    },
    [downloads, storageKey]
  );

  const removeDownload = useCallback(
    async (id: string) => {
      if (!id || !downloads[id]) return;
      const nextDownloads = { ...downloads };
      delete nextDownloads[id];
      setDownloads(nextDownloads);

      // Write to AsyncStorage once, outside setState updater
      const toSave: Record<string, any> = {};
      for (const [k, v] of Object.entries(nextDownloads)) {
        toSave[k] = {
          relativePath: v.relativePath,
          ext: v.ext,
          documentUrl: v.documentUrl,
          savedAt: v.savedAt,
        };
      }

      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(toSave));
      } catch {
        console.warn("[useDownloadedMaterials] Error removing download");
      }
    },
    [downloads, storageKey]
  );

  return {
    downloads,
    isLoaded,
    isDownloaded,
    getDownload,
    markDownloaded,
    removeDownload,
    refresh,
  };
}
