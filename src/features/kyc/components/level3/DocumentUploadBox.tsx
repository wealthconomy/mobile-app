import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Upload, X, FileText, CheckCircle2, AlertTriangle } from "lucide-react-native";

interface Props {
  label: string;
  imageUri: string | null;
  fileName?: string | null;
  error?: string;
  status?: "Approved" | "Rejected" | "Pending" | string;
  rejectionReason?: string | null;
  onPick: () => void;
  onRemove: () => void;
}

export const DocumentUploadBox: React.FC<Props> = ({
  label,
  imageUri,
  fileName,
  error,
  status,
  rejectionReason,
  onPick,
  onRemove,
}) => {
  const isPdf = Boolean(
    imageUri &&
      (imageUri.toLowerCase().includes(".pdf") ||
        (fileName && fileName.toLowerCase().endsWith(".pdf")))
  );

  const isRejected = status === "Rejected";
  const isApproved = status === "Approved";

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, marginLeft: 2 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: "#475569",
            flex: 1,
          }}
        >
          {label}
        </Text>
        {isRejected ? (
          <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "#FCA5A5" }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#B91C1C" }}>REJECTED</Text>
          </View>
        ) : isApproved ? (
          <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "#86EFAC" }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#166534" }}>APPROVED</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onPick}
        activeOpacity={0.8}
        style={{
          width: "100%",
          height: 130,
          borderRadius: 18,
          borderWidth: 1.5,
          borderColor: isRejected ? "#EF4444" : error && !imageUri ? "#EF4444" : isApproved ? "#16A34A" : imageUri ? "#155D5F" : "#CBD5E1",
          borderStyle: isRejected ? "dashed" : imageUri ? "solid" : "dashed",
          backgroundColor: isRejected ? "#FFF5F5" : error && !imageUri ? "#FEF2F2" : imageUri ? "#FFFFFF" : "#F8FAFC",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {imageUri ? (
          <View style={{ width: "100%", height: "100%", position: "relative", alignItems: "center", justifyContent: "center" }}>
            {isPdf ? (
              <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#F2FFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                    borderWidth: 1,
                    borderColor: "#CCFBF1",
                  }}
                >
                  <FileText size={22} color="#155D5F" />
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#1E293B",
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {fileName || "PDF Document"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 }}>
                  <CheckCircle2 size={12} color="#16A34A" />
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#16A34A" }}>
                    Ready to submit
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ width: "100%", height: "100%", backgroundColor: "#0F172A08", alignItems: "center", justifyContent: "center" }}>
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                {fileName ? (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 12,
                      right: 50,
                      backgroundColor: "rgba(15, 23, 42, 0.75)",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{ fontSize: 11, color: "#FFFFFF", fontWeight: "600" }}
                      numberOfLines={1}
                    >
                      {fileName}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Remove / Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "#EF4444",
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 3,
                zIndex: 20,
              }}
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X size={15} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Upload size={20} color="#155D5F" strokeWidth={2} />
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#1E293B",
                textAlign: "center",
                marginBottom: 2,
              }}
            >
              Choose document to upload
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color: "#94A3B8",
                textAlign: "center",
              }}
            >
              Supports PDF, PNG or JPG format (max 10MB)
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {isRejected && (
        <View
          style={{
            marginTop: 8,
            backgroundColor: "#FEF2F2",
            borderWidth: 1,
            borderColor: "#FECACA",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <AlertTriangle size={15} color="#DC2626" />
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#991B1B" }}>
              Rejection Notice
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: "#7F1D1D", lineHeight: 17 }}>
            Reason: <Text style={{ fontWeight: "600" }}>{rejectionReason || "Document is blurry or illegible"}</Text>
          </Text>
          <Text style={{ fontSize: 11, color: "#B91C1C", fontWeight: "600", marginTop: 4 }}>
            Tap the box above to upload a clear replacement document.
          </Text>
        </View>
      )}

      {error && !imageUri && !isRejected ? (
        <Text
          style={{
            fontSize: 12,
            color: "#EF4444",
            marginTop: 6,
            fontWeight: "500",
            marginLeft: 2,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};


