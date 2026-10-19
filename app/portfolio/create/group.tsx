import { AppCalendarModal, AppDatePickerField } from "@/src/components/common";
import Header from "@/src/components/common/Header";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import {
  useCreateGroupMutation,
  useGetSystemConfigsQuery,
} from "@/src/store/api/groupApi";
import { useGetPortfolioConfigQuery } from "@/src/store/api/portfolioApi";
import { CreateGroupRequest, GroupFrequency } from "@/src/types/group";
import { formatEarlyTerminationPenaltyRate, getDynamicPenaltyRate } from "@/src/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Share2, Upload, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#155D5F";
const THEME_BG = "#F2FFFF";

// ── Types ───────────────────────────────────────────────────────────────────

type GroupData = {
  name: string;
  category: string;
  groupType: "FLEX" | "FIXED" | "ROTATIONAL";
  contributionAmount: string;
  coverImage: string | null;
  description: string;
  amount: string;
  frequency: string;
  hasInterest: boolean;
  startDate: string;
  endDate: string;
  memberLimit: string;
  accessType: string;
  penalty: string;
  earlyExit: string;
  exitRule: boolean;
  emergencyWithdrawal: boolean;
  agreed: boolean;
  wealthPreference: "Interest Based" | "Impact Wealth";
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function CreateGroupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupType?: string }>();

  const paramGroupType = useMemo(() => {
    if (!params.groupType) return null;
    const upper = params.groupType.toUpperCase();
    if (upper === "FIXED" || upper === "FLEX" || upper === "ROTATIONAL") {
      return upper as "FIXED" | "FLEX" | "ROTATIONAL";
    }
    return null;
  }, [params.groupType]);

  const [step, setStep] = useState(1);
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();
  const { uploadImage } = useImageUpload();

  const { data: systemConfigData, refetch: refetchSystemConfig } =
    useGetSystemConfigsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  useFocusEffect(
    useCallback(() => {
      refetchSystemConfig();
    }, [refetchSystemConfig]),
  );

  const { data: configData } = useGetPortfolioConfigQuery();
  const { penaltyRate: groupPenaltyRate } = getDynamicPenaltyRate(
    "group",
    systemConfigData,
    configData?.rates || (configData as any)?.data?.rates,
    "2.5%"
  );

  const [formData, setFormData] = useState<GroupData>({
    name: "",
    category: "",
    groupType: paramGroupType || "FLEX",
    contributionAmount: "",
    coverImage: null,
    description: "",
    amount: "",
    frequency: "",
    hasInterest: false,
    startDate: "",
    endDate: "",
    memberLimit: "",
    accessType: "",
    penalty: "",
    earlyExit: "",
    exitRule: false,
    emergencyWithdrawal: false,
    agreed: false,
    wealthPreference: "Interest Based",
  });

  useEffect(() => {
    if (paramGroupType) {
      setFormData((prev) => ({ ...prev, groupType: paramGroupType }));
    }
  }, [paramGroupType]);

  const updateFormData = (field: string, value: any) => {
    if (value && typeof value === "object" && value.nativeEvent) {
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Start date: 00:00:00 UTC of the chosen day (group opens at the start of that day)
  const parseDateToIsoStart = (dStr: string) => {
    const parts = dStr.split("/").map((p) => p.trim());
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (
        !isNaN(day) &&
        !isNaN(month) &&
        !isNaN(year) &&
        year >= 2020 &&
        day >= 1 &&
        day <= 31 &&
        month >= 0 &&
        month <= 11
      ) {
        return new Date(Date.UTC(year, month, day, 0, 0, 0)).toISOString();
      }
    }
    return new Date(Date.now()).toISOString();
  };

  // End date: 23:59:59 UTC of the chosen day (group is active through the whole end day)
  const parseDateToIsoEnd = (dStr: string) => {
    const parts = dStr.split("/").map((p) => p.trim());
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (
        !isNaN(day) &&
        !isNaN(month) &&
        !isNaN(year) &&
        year >= 2020 &&
        day >= 1 &&
        day <= 31 &&
        month >= 0 &&
        month <= 11
      ) {
        return new Date(Date.UTC(year, month, day, 23, 59, 59)).toISOString();
      }
    }
    return new Date(Date.now() + 365 * 86400000).toISOString();
  };

  const isRotational = formData.groupType === "ROTATIONAL";

  const nextStep = async () => {
    if (step === 5) {
      setIsSubmitting(true);
      try {
        const amountKobo = Math.round(
          (parseFloat(formData.amount.replace(/,/g, "")) || 0) * 100,
        );
        const contribKobo =
          formData.groupType === "FIXED" || formData.groupType === "ROTATIONAL"
            ? Math.round(
                (parseFloat(formData.contributionAmount.replace(/,/g, "")) ||
                  0) * 100,
              )
            : undefined;

        let mappedPenalty = "NONE";
        if (
          formData.penalty.toLowerCase().includes("immediate") ||
          formData.penalty.toLowerCase().includes("5%")
        ) {
          mappedPenalty = "IMMEDIATE_5";
        } else if (
          formData.penalty.toLowerCase().includes("grace") ||
          formData.penalty.toLowerCase().includes("24")
        ) {
          mappedPenalty = "GRACE_24";
        } else if (
          formData.penalty === "IMMEDIATE_5" ||
          formData.penalty === "GRACE_24"
        ) {
          mappedPenalty = formData.penalty;
        }

        let uploadedCoverUrl: string | undefined = undefined;
        if (formData.coverImage) {
          if (
            formData.coverImage.startsWith("http://") ||
            formData.coverImage.startsWith("https://")
          ) {
            uploadedCoverUrl = formData.coverImage;
          } else if (
            formData.coverImage.startsWith("file://") ||
            formData.coverImage.startsWith("content://")
          ) {
            try {
              uploadedCoverUrl = await uploadImage(formData.coverImage, {
                allowFallback: false,
              });
            } catch (e) {
              console.warn(
                "Cover image upload failed, skipping cloud coverImage in payload:",
                e,
              );
              uploadedCoverUrl = undefined;
            }
          }
        }

        // Strictly verify that coverImage is a remote URL, never a local file:// path
        if (
          uploadedCoverUrl &&
          (uploadedCoverUrl.startsWith("file://") ||
            uploadedCoverUrl.startsWith("content://"))
        ) {
          uploadedCoverUrl = undefined;
        }

        const payload: CreateGroupRequest = {
          name: formData.name.trim(),
          category: formData.category.trim() || "General",
          description: formData.description.trim(),
          groupType: formData.groupType,
          contributionAmount: contribKobo,
          coverImage: uploadedCoverUrl,
          targetAmount: amountKobo,
          frequency: (formData.frequency
            ? formData.frequency.toUpperCase()
            : "MONTHLY") as GroupFrequency,
          memberInterest: formData.hasInterest,
          startDate: parseDateToIsoStart(formData.startDate),
          endDate: parseDateToIsoEnd(formData.endDate),
          membersLimit: parseInt(formData.memberLimit) || 10,
          accessType: formData.accessType.toUpperCase().includes("PRIVATE")
            ? "PRIVATE"
            : "PUBLIC",
          penaltySetting: mappedPenalty,
          allowEarlyExit: formData.earlyExit
            ? formData.earlyExit.toLowerCase().includes("allow")
            : false,
          allowEmergencyWithdrawal: formData.emergencyWithdrawal,
        };

        console.log(
          "👥 [WealthGroup Create Request] POST /api/v1/groups with payload:\n",
          JSON.stringify(payload, null, 2),
        );
        const res: any = await createGroup(payload).unwrap();
        console.log(
          "✅ [WealthGroup Create Success] Response:\n",
          JSON.stringify(res, null, 2),
        );

        const newId =
          res?.id || res?.data?.id || (typeof res === "string" ? res : "new");
        setCreatedGroupId(newId);
        setStep(6);
      } catch (err: any) {
        console.error(
          "❌ [WealthGroup Create Error]:\n",
          JSON.stringify(err, null, 2),
        );
        const msg =
          err?.data?.message ||
          err?.message ||
          "Failed to create Wealth Group. Please try again.";
        Alert.alert("Creation Failed", msg);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsNavigating(true);
      setTimeout(() => {
        setStep((s) => s + 1);
        setIsNavigating(false);
      }, 150);
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return !!(
          formData.name &&
          formData.category &&
          formData.description &&
          formData.groupType
        );
      case 2:
        const isFixedOrRotational =
          formData.groupType === "FIXED" || formData.groupType === "ROTATIONAL";
        const validFixedAmount =
          !isFixedOrRotational ||
          (formData.contributionAmount &&
            parseFloat(formData.contributionAmount.replace(/,/g, "")) > 0);
        const groupRatesConfig = configData?.rates?.wealthgroup || (configData as any)?.data?.rates?.wealthgroup;
        const minGroupKobo = groupRatesConfig?.minTargetAmount ?? 100000;
        const minGroupNaira = minGroupKobo / 100;
        const targetAmtVal = parseFloat(formData.amount.replace(/,/g, "")) || 0;
        const isTargetAmountValid = targetAmtVal >= minGroupNaira;
        return !!(
          formData.amount &&
          isTargetAmountValid &&
          formData.frequency &&
          formData.startDate.length >= 10 &&
          formData.endDate.length >= 10 &&
          validFixedAmount
        );
      case 3:
        const limit = parseInt(formData.memberLimit);
        const groupRates = configData?.rates?.wealthgroup || (configData as any)?.data?.rates?.wealthgroup;
        const minM = groupRates?.membersLimitRange?.[0] ?? 2;
        const maxM = groupRates?.membersLimitRange?.[1] ?? 50;
        return !!(
          formData.memberLimit &&
          !isNaN(limit) &&
          limit >= minM &&
          limit <= maxM &&
          formData.accessType
        );
      case 4:
        // ROTATIONAL: only penalty required (no early exit / emergency withdrawal)
        if (isRotational) return !!formData.penalty;
        return !!(formData.penalty && formData.earlyExit);
      case 5:
        return !!formData.agreed;
      default:
        return true;
    }
  }, [step, formData]);

  if (step === 6) {
    return (
      <SuccessScreen
        onDone={() => router.replace("/(tabs)/portfolios/wealth-group")}
        onView={() =>
          router.replace({
            pathname: "/portfolio/detail/group/[id]",
            params: { id: createdGroupId || "new", member: "true" },
          })
        }
        groupName={String(formData.name || "")}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header
        title="Create a WealthGroup"
        onBack={step > 1 ? prevStep : () => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6 pb-20">
            <Text className="text-[#155D5F] text-[18px] font-bold mb-1">
              Step {step}:
            </Text>
            <Text className="text-[#155D5F] text-[24px] font-bold mb-6">
              {getStepTitle(step)}
            </Text>

            {isInfoVisible && (
              <View
                className="rounded-[15px] p-5 mb-8 relative"
                style={{
                  width: "100%",
                  backgroundColor: THEME_BG,
                  alignSelf: "center",
                }}
              >
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setIsInfoVisible(false)}
                >
                  <X size={16} color={THEME} />
                </TouchableOpacity>
                <Text className="text-[#155D5F] font-black text-[14px] mb-2">
                  Important things to know
                </Text>
                <Text className="text-[#155D5F] text-[12px] leading-[18px]">
                  {formData.groupType === "ROTATIONAL"
                    ? "In a Rotational Savings group (Ajo/Esusu), every member contributes a fixed amount each cycle. The pooled funds are paid out as a lump sum to one member at a time, rotating through the payout order set by the admin. Payouts are automatic — no withdrawal requests needed."
                    : formData.groupType === "FIXED"
                      ? "In a Fixed Contribution group, all members contribute the exact same amount every cycle. The goal is a shared target. Members can only access funds through approved early exit or emergency withdrawal rules you set up."
                      : "In a Flex Contribution group, each member contributes what they can each cycle — amounts can differ. The group works toward a collective wealth target and members have more flexible rules for accessing funds."}
                </Text>
              </View>
            )}

            {step === 1 && (
              <Step1Identity
                data={formData}
                update={updateFormData}
                hideGroupTypeSelector={!!paramGroupType}
              />
            )}
            {step === 2 && (
              <Step2Financial data={formData} update={updateFormData} />
            )}
            {step === 3 && (
              <Step3Membership data={formData} update={updateFormData} />
            )}
            {step === 4 && !isRotational && (
              <Step4Risk
                data={formData}
                update={updateFormData}
                groupPenaltyRate={groupPenaltyRate}
              />
            )}
            {step === 4 && isRotational && (
              // For ROTATIONAL: only penalty setting needed — no early exit or emergency withdrawal
              <Step4RiskRotational
                data={formData}
                update={updateFormData}
                groupPenaltyRate={groupPenaltyRate}
              />
            )}
            {step === 5 && (
              <Step5Review data={formData} update={updateFormData} />
            )}

            {/* ── Action Button ────────────────────────────────────────── */}
            <View className="mt-10">
              <TouchableOpacity
                disabled={
                  !isStepValid || isCreating || isNavigating || isSubmitting
                }
                onPress={nextStep}
                className={`h-14 rounded-2xl items-center justify-center ${
                  isStepValid && !isCreating && !isNavigating && !isSubmitting
                    ? "bg-[#155D5F]"
                    : "bg-gray-200"
                }`}
              >
                {isCreating || isNavigating || isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    {step === 5 ? "Launch your Wealth Tribe" : "Proceed"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Step Components ─────────────────────────────────────────────────────────

// Rich info card shown in Step 1 when user arrives from a specific group type
function GroupTypeInfoCard({
  groupType,
}: {
  groupType: "FLEX" | "FIXED" | "ROTATIONAL";
}) {
  const configs = {
    FLEX: {
      icon: "cash-outline" as const,
      title: "Flex Contribution Group",
      badge: "Flexible Savings",
      badgeColor: "#D1FAE5",
      badgeBg: "#1fd4d4ff",
      borderColor: "#1fd4d4ff",
      bg: "#F2FFFF",
      textColor: "#064E3B",
      rows: [
        {
          label: "How it works",
          value:
            "Members contribute any amount they choose each cycle. There's no fixed minimum, everyone saves at their own pace toward a shared group target.",
        },
        {
          label: "Who controls the amount?",
          value:
            "Each member decides their own contribution every cycle. The admin sets the overall group goal and timeline.",
        },
        {
          label: "How do members access funds?",
          value:
            "Members can request early exit or emergency withdrawals based on the rules the admin sets when creating the group.",
        },
        {
          label: "Interest & returns",
          value:
            "If the group is interest-based, members earn returns proportional to the amount they contribute toward the target.",
        },
        {
          label: "Best for",
          value:
            "People with irregular income or who want to save together without a strict commitment amount per cycle.",
        },
      ],
    },
    FIXED: {
      icon: "people-outline" as const,
      title: "Fixed Contribution Group",
      badge: "Disciplined Savings",
      badgeColor: "#D1FAE5",
      badgeBg: "#1fd4d4ff",
      borderColor: "#1fd4d4ff",
      bg: "#F2FFFF",
      textColor: "#064E3B",
      rows: [
        {
          label: "How it works",
          value:
            "Every member commits to paying the same fixed amount each cycle. The group marches together toward a collective savings target.",
        },
        {
          label: "Who controls the amount?",
          value:
            "The admin sets one mandatory contribution amount when creating the group. All members must pay exactly that amount every cycle.",
        },
        {
          label: "How do members access funds?",
          value:
            "Access depends on the exit rules the admin sets, members may be allowed to exit early with or without a penalty, or emergency withdrawals may be permitted.",
        },
        {
          label: "Interest & returns",
          value:
            "All members earn equal proportional returns since contributions are identical. Interest is applied if the group is interest-based.",
        },
        {
          label: "Best for",
          value:
            "Groups that want strict discipline and equal commitment — e.g., house rent goals, joint business capital, or community savings.",
        },
      ],
    },
    ROTATIONAL: {
      icon: "people-circle-outline" as const,
      title: "Rotational Savings (Ajo / Esusu)",
      badge: "Automatic Payouts",
      badgeColor: "#D1FAE5",
      badgeBg: "#1fd4d4ff",
      borderColor: "#1fd4d4ff",
      bg: "#F2FFFF",
      textColor: "#064E3B",
      rows: [
        {
          label: "How it works",
          value:
            "All members contribute a fixed amount each cycle. The pooled total is paid out as a lump sum to one member at a time, rotating through the payout order set by the admin.",
        },
        {
          label: "Who gets paid first?",
          value:
            "The admin assigns each member a payout position when the group starts. Members receive the full pool on their turn, no exceptions.",
        },
        {
          label: "Are payouts automatic?",
          value:
            "Yes — payouts happen automatically on each cycle based on the rotation order. No withdrawal requests or manual approvals are needed.",
        },
        {
          label: "Early exit or emergency withdrawal?",
          value:
            "Not applicable. Because payouts are structured and automatic, early exit and emergency withdrawal features do not apply to rotational groups.",
        },
        {
          label: "Best for",
          value:
            "Communities, friends, or colleagues running a traditional Ajo or Esusu — where trust, rotation, and discipline are the foundation.",
        },
      ],
    },
  };

  const c = configs[groupType] || configs.FLEX;

  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: c.borderColor,
        backgroundColor: c.bg,
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: c.borderColor + "40",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c.borderColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name={c.icon} size={20} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: c.textColor,
              opacity: 0.7,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Selected Group Type
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: c.textColor,
              marginTop: 1,
            }}
          >
            {c.title}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: c.badgeBg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Text
            style={{ color: c.badgeColor, fontSize: 10, fontWeight: "700" }}
          >
            {c.badge}
          </Text>
        </View>
      </View>

      {/* Info rows */}
      <View style={{ padding: 14, gap: 12 }}>
        {c.rows.map((row, i) => (
          <View key={i}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: c.textColor,
                marginBottom: 2,
              }}
            >
              {row.label}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: c.textColor,
                opacity: 0.85,
                lineHeight: 18,
              }}
            >
              {row.value}
            </Text>
            {i < c.rows.length - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: c.borderColor + "20",
                  marginTop: 10,
                }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function Step1Identity({ data, update, hideGroupTypeSelector }: any) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      update("coverImage", result.assets[0].uri);
    }
  };

  const groupTypes = [
    {
      id: "FLEX",
      title: "Flex Contribution Groups",
      subtitle: "Flexible individual contribution amounts per cycle.",
      icon: "cash-outline",
    },
    {
      id: "FIXED",
      title: "Fixed Contribution Groups",
      subtitle: "All members contribute the exact same fixed amount per cycle.",
      icon: "people-outline",
    },
    {
      id: "ROTATIONAL",
      title: "Rotational Savings (Ajo/Esusu Model)",
      subtitle:
        "Contributions rotate as lump-sum payouts to members in turn order.",
      icon: "people-circle-outline",
    },
  ];

  return (
    <View className="space-y-6">
      {hideGroupTypeSelector ? (
        // Rich info card — shown when user arrives from a specific group type button
        <GroupTypeInfoCard groupType={data.groupType} />
      ) : (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              color: "#64748B",
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            Group Type
          </Text>
          <View style={{ gap: 10 }}>
            {groupTypes.map((item) => {
              const isSelected = data.groupType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => update("groupType", item.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: isSelected ? "#F2FFFF" : "#F9FAFB",
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? THEME : "#E5E7EB",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isSelected ? THEME : "#E2E8F0",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isSelected ? "white" : "#64748B"}
                    />
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#1A1A1A",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        marginTop: 2,
                        lineHeight: 15,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: isSelected ? 6 : 2,
                      borderColor: isSelected ? THEME : "#9CA3AF",
                      backgroundColor: "white",
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <FormField
        label="Group Name"
        placeholder='e.g., "The 2026 Homeowners Circle"'
        value={data.name}
        onChange={(t: string) => update("name", t)}
      />

      <FormField
        label="Group Category"
        placeholder="eg., Rent, Festival, Business, etc."
        value={data.category}
        onChange={(t: string) => update("category", t)}
      />

      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-2">
          Group Cover Image (Optional)
        </Text>
        <View className="relative">
          <TouchableOpacity
            onPress={pickImage}
            className="h-32 bg-gray-50 rounded-xl items-center justify-center border-2 border-dashed border-gray-200"
          >
            {data.coverImage ? (
              <Image
                source={{ uri: data.coverImage }}
                className="w-full h-full rounded-xl"
              />
            ) : (
              <View className="items-center">
                <Upload size={24} color="#64748B" className="mb-2" />
                <Text className="text-gray-400 text-[12px]">
                  Browse a file in a PNG and JPG format
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {data.coverImage && (
            <TouchableOpacity
              onPress={() => update("coverImage", null)}
              className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center shadow-md"
            >
              <X size={14} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-2">
          Group Description
        </Text>
        <TextInput
          multiline
          numberOfLines={4}
          value={data.description}
          onChangeText={(t) => update("description", t)}
          placeholder="Enter group description..."
          className="bg-gray-50 rounded-xl p-4 text-[#1A1A1A] border border-gray-100 min-h-[100px]"
          textAlignVertical="top"
        />
        <Text className="text-right text-gray-400 text-[11px] mt-1">
          {data.description.split(/\s+/).filter(Boolean).length}/100 words
        </Text>
      </View>
    </View>
  );
}

function Step2Financial({ data, update }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const options = ["Daily", "Weekly", "Monthly"];

  const formatAmount = (val: string) => {
    if (typeof val !== "string") return "";
    const n = val.replace(/\D/g, "");
    return n ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  };

  const parseDateString = (str: string): Date | null => {
    if (!str) return null;
    const parts = str.split("/").map((p) => p.trim());
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year >= 2020) {
        return new Date(year, month, day);
      }
    }
    return null;
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatDateToDisplay = (d: Date) =>
    `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`;

  const startDateObj = parseDateString(data.startDate);
  const endDateObj = parseDateString(data.endDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Min start date is today
  const minStartDate = today;

  // Min end date: must be at least 1 day after start date, or tomorrow
  const minEndDate = startDateObj
    ? new Date(startDateObj.getTime() + 86400000)
    : new Date(today.getTime() + 86400000);

  const handleSelectStartDate = (picked: Date) => {
    update("startDate", formatDateToDisplay(picked));
    if (endDateObj && endDateObj <= picked) {
      const autoEnd = new Date(picked);
      autoEnd.setFullYear(autoEnd.getFullYear() + 1);
      update("endDate", formatDateToDisplay(autoEnd));
    }
  };

  const handleSelectEndDate = (picked: Date) => {
    update("endDate", formatDateToDisplay(picked));
  };

  const isFixedOrRotational =
    data.groupType === "FIXED" || data.groupType === "ROTATIONAL";

  const { data: configData } = useGetPortfolioConfigQuery();
  const groupRatesConfig = configData?.rates?.wealthgroup || (configData as any)?.data?.rates?.wealthgroup;
  const minGroupKobo = groupRatesConfig?.minTargetAmount ?? 100000;
  const minGroupNaira = minGroupKobo / 100;
  const minGroupNairaFormatted = minGroupNaira.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const targetAmtVal = parseFloat(data.amount.replace(/,/g, "")) || 0;
  const isBelowMinTarget = targetAmtVal > 0 && targetAmtVal < minGroupNaira;

  return (
    <View className="space-y-6">
      <View style={{ marginBottom: 12 }}>
        <FormField
          label="Wealth Target Amount (₦)"
          placeholder="e.g, ₦3,500,000.00"
          value={data.amount}
          onChange={(t: string) => update("amount", formatAmount(t))}
          keyboardType="numeric"
        />
        {isBelowMinTarget && (
          <Text className="text-red-500 text-[11px] mt-1 font-medium">
            Minimum target amount is ₦{minGroupNairaFormatted}
          </Text>
        )}
      </View>

      {isFixedOrRotational && (
        <FormField
          label="Fixed Contribution Amount per Cycle (₦)"
          placeholder="e.g, ₦50,000.00"
          value={data.contributionAmount}
          onChange={(t: string) =>
            update("contributionAmount", formatAmount(t))
          }
          keyboardType="numeric"
          helperText="Mandatory contribution amount required from each member per cycle."
        />
      )}

      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-2">
          Contribution Frequency
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(!isOpen)}
          className="h-14 bg-gray-50 rounded-xl px-4 flex-row items-center justify-between border border-gray-100"
        >
          <Text className={data.frequency ? "text-[#1A1A1A]" : "text-gray-400"}>
            {data.frequency || "Daily, Weekly, or Monthly"}
          </Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
        {isOpen && (
          <View className="bg-white rounded-xl mt-2 border border-gray-100 overflow-hidden shadow-sm">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  update("frequency", opt);
                  setIsOpen(false);
                }}
                className="px-4 py-4 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] font-medium">{opt}</Text>
                {data.frequency === opt && <Check size={16} color={THEME} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: "#64748B",
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Wealth Preference
        </Text>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            padding: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => update("wealthPreference", "Interest Based")}
            style={{
              flex: 1,
              backgroundColor:
                data.wealthPreference === "Interest Based"
                  ? "#FFFFFF"
                  : "transparent",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              shadowColor:
                data.wealthPreference === "Interest Based"
                  ? "#000"
                  : "transparent",
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: data.wealthPreference === "Interest Based" ? 2 : 0,
            }}
          >
            <Text
              style={{
                color:
                  data.wealthPreference === "Interest Based"
                    ? "#1A1A1A"
                    : "#6B7280",
                fontWeight:
                  data.wealthPreference === "Interest Based" ? "700" : "500",
                fontSize: 13,
              }}
            >
              Interest Based
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => update("wealthPreference", "Impact Wealth")}
            style={{
              flex: 1,
              backgroundColor:
                data.wealthPreference === "Impact Wealth"
                  ? "#FFFFFF"
                  : "transparent",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              shadowColor:
                data.wealthPreference === "Impact Wealth"
                  ? "#000"
                  : "transparent",
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: data.wealthPreference === "Impact Wealth" ? 2 : 0,
            }}
          >
            <Text
              style={{
                color:
                  data.wealthPreference === "Impact Wealth"
                    ? "#1A1A1A"
                    : "#6B7280",
                fontWeight:
                  data.wealthPreference === "Impact Wealth" ? "700" : "500",
                fontSize: 13,
              }}
            >
              Impact Wealth
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AppDatePickerField
        label="Start Date"
        placeholder="Select Start Date"
        value={data.startDate}
        onPress={() => setShowStartPicker(true)}
        helperText="Date contributions begin (cannot be in the past)"
      />

      <AppDatePickerField
        label="End Date"
        placeholder="Select End Date"
        value={data.endDate}
        onPress={() => setShowEndPicker(true)}
        helperText="Group maturity date (must be after start date)"
      />

      <AppCalendarModal
        visible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        title="Select Start Date"
        selectedDate={startDateObj}
        minDate={minStartDate}
        onSelectDate={handleSelectStartDate}
      />

      <AppCalendarModal
        visible={showEndPicker}
        onClose={() => setShowEndPicker(false)}
        title="Select End Date"
        selectedDate={endDateObj}
        minDate={minEndDate}
        onSelectDate={handleSelectEndDate}
      />

      {data.wealthPreference === "Interest Based" && (
        <Text className="text-[10px] text-gray-400 italic">
          Note: To earn the full interest, you must meet your target amount and
          reach this date.
        </Text>
      )}
    </View>
  );
}

function Step3Membership({ data, update }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["Public/Open", "Private/Invite-Only"];
  const { data: configData } = useGetPortfolioConfigQuery();
  const rates = configData?.rates || (configData as any)?.data?.rates;
  const groupRates = rates?.wealthgroup || rates?.group;
  const minM = groupRates?.membersLimitRange?.[0] ?? 2;
  const maxM = groupRates?.membersLimitRange?.[1] ?? 50;

  const limitVal = parseInt(data.memberLimit);
  const isInvalidLimit = !isNaN(limitVal) && (limitVal < minM || limitVal > maxM);

  return (
    <View className="space-y-6">
      <View className="mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-[#64748B] text-[13px] font-bold">
            Members Limit
          </Text>
          <Text className="text-gray-400 text-[11px]">{minM} min - {maxM} max</Text>
        </View>
        <TextInput
          placeholder={`e.g., ${minM} to ${maxM} members`}
          value={data.memberLimit}
          onChangeText={(t) => update("memberLimit", t)}
          keyboardType="numeric"
          className="h-14 bg-gray-50 rounded-xl px-4 text-[#1A1A1A] border border-gray-100"
        />
        {isInvalidLimit && (
          <Text className="text-red-500 text-[11px] mt-1 font-medium">
            Limit must be between {minM} and {maxM} members
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-2">
          Access Type
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(!isOpen)}
          className="h-14 bg-gray-50 rounded-xl px-4 flex-row items-center justify-between border border-gray-100"
        >
          <Text
            className={
              data.accessType ? "text-[#1A1A1A] font-semibold" : "text-gray-400"
            }
          >
            {data.accessType || "Public/Open, Private/Invite-Only"}
          </Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
        {isOpen && (
          <View className="bg-white rounded-xl mt-2 border border-gray-100 overflow-hidden shadow-sm">
            {options.map((opt) => {
              const isPublic = opt.toLowerCase().includes("public");
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    update("accessType", opt);
                    setIsOpen(false);
                  }}
                  className="px-4 py-4 border-b border-gray-50 flex-row items-center justify-between"
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text className="text-[#1A1A1A] font-bold text-[14px]">
                      {opt}
                    </Text>
                    <Text className="text-[#64748B] text-[11px] mt-0.5 leading-[16px]">
                      {isPublic
                        ? "Open group: Members can join immediately without waiting for admin approval."
                        : "Private group: Members send a join request. Admin can accept or reject each request."}
                    </Text>
                  </View>
                  {data.accessType === opt && <Check size={18} color={THEME} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {data.accessType && (
          <View className="bg-[#EEF7F8] p-3 rounded-xl mt-3 border border-[#D5EAE9]">
            <Text className="text-[#155D5F] text-[12px] font-bold mb-0.5">
              ℹ️{" "}
              {data.accessType.toLowerCase().includes("public")
                ? "Public Group Policy"
                : "Private Group Policy"}
            </Text>
            <Text className="text-[#155D5F] text-[11px] leading-[16px]">
              {data.accessType.toLowerCase().includes("public")
                ? "People can join this group directly without you approving them."
                : "People must request to join this group. You will have full control in settings to accept or reject them."}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Step4Risk({ data, update, groupPenaltyRate = "10%" }: any) {
  const [isPenaltyOpen, setIsPenaltyOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);

  const penaltyOptions = ["Immediate (5%)", "Grace period (24h)", "No Penalty"];

  const exitOptions = [
    "No Withdrawal",
    `Allow with Fixed Penalty (${groupPenaltyRate})`,
    "Allow without Penalty",
  ];

  return (
    <View className="space-y-6">
      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-2">
          Late Payment Penalty
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsPenaltyOpen(!isPenaltyOpen)}
          className="h-14 bg-gray-50 rounded-xl px-4 flex-row items-center justify-between border border-gray-100"
        >
          <Text className={data.penalty ? "text-[#1A1A1A]" : "text-gray-400"}>
            {data.penalty || "Select Penalty..."}
          </Text>
          <Ionicons
            name={isPenaltyOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
        {isPenaltyOpen && (
          <View className="bg-white rounded-xl mt-2 border border-gray-100 overflow-hidden shadow-sm">
            {penaltyOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  update("penalty", opt);
                  setIsPenaltyOpen(false);
                }}
                className="px-4 py-4 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] font-medium">{opt}</Text>
                {data.penalty === opt && <Check size={16} color={THEME} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-2">
          Early Exit / Default Rule
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsExitOpen(!isExitOpen)}
          className="h-14 bg-gray-50 rounded-xl px-4 flex-row items-center justify-between border border-gray-100"
        >
          <Text className={data.earlyExit ? "text-[#1A1A1A]" : "text-gray-400"}>
            {data.earlyExit || "Select Exit Rule..."}
          </Text>
          <Ionicons
            name={isExitOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
        <Text className="text-[#64748B] text-[11px] mt-1.5 px-1 leading-4">
          Choose whether members can exit early before maturity and whether the
          platform exit penalty ({groupPenaltyRate}) applies.
        </Text>
        {isExitOpen && (
          <View className="bg-white rounded-xl mt-2 border border-gray-100 overflow-hidden shadow-sm">
            {exitOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  update("earlyExit", opt);
                  setIsExitOpen(false);
                }}
                className="px-4 py-4 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] font-medium">{opt}</Text>
                {data.earlyExit === opt && <Check size={16} color={THEME} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
        <View className="flex-1 mr-4">
          <Text className="text-[#1A1A1A] font-bold text-[14px]">
            Emergency Withdrawal
          </Text>
          <Text className="text-gray-400 text-[11px] mt-0.5">
            Allow members to withdraw funds during emergencies
          </Text>
        </View>
        <CustomSwitch
          value={data.emergencyWithdrawal}
          onValueChange={(v: boolean) => update("emergencyWithdrawal", v)}
        />
      </View>
    </View>
  );
}

// Rotational groups only need the late-payment penalty setting.
// Early exit and emergency withdrawal don't apply — payouts are automatic.
function Step4RiskRotational({ data, update, groupPenaltyRate = "10%" }: any) {
  const [isPenaltyOpen, setIsPenaltyOpen] = useState(false);

  const penaltyOptions = ["Immediate (5%)", "Grace period (24h)", "No Penalty"];

  return (
    <View className="space-y-6">
      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-2">
          Late Payment Penalty
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsPenaltyOpen(!isPenaltyOpen)}
          className="h-14 bg-gray-50 rounded-xl px-4 flex-row items-center justify-between border border-gray-100"
        >
          <Text className={data.penalty ? "text-[#1A1A1A]" : "text-gray-400"}>
            {data.penalty || "Select Penalty..."}
          </Text>
          <Ionicons
            name={isPenaltyOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
        {isPenaltyOpen && (
          <View className="bg-white rounded-xl mt-2 border border-gray-100 overflow-hidden shadow-sm">
            {penaltyOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  update("penalty", opt);
                  setIsPenaltyOpen(false);
                }}
                className="px-4 py-4 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] font-medium">{opt}</Text>
                {data.penalty === opt && <Check size={16} color={THEME} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Info banner */}
      <View
        style={{
          backgroundColor: "#F2FFFF",
          borderColor: "#1fd4d4ff",
          borderWidth: 1,
          borderRadius: 14,
          padding: 14,
          marginBottom: 4,
        }}
      >
        <Text
          style={{
            color: "#166534",
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 4,
          }}
        >
          ℹ️ Rotational Group — Automatic Payouts
        </Text>
        <Text style={{ color: "#166534", fontSize: 12, lineHeight: 18 }}>
          In an Ajo/Esusu group, funds are automatically paid out to each member
          in the rotation order set by the admin. There is no need for early
          exit or emergency withdrawal rules. You only need to set the late
          contribution penalty below.
        </Text>
      </View>
    </View>
  );
}

function Step5Review({ data, update }: any) {
  const groupTypeLabel =
    data.groupType === "ROTATIONAL"
      ? "Rotational Savings (Ajo/Esusu)"
      : data.groupType === "FIXED"
        ? "Fixed Contribution"
        : "Flex Contribution";

  return (
    <View className="space-y-6">
      <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <Text className="text-[#155D5F] font-bold text-[16px] mb-4">
          Group Summary
        </Text>

        <ReviewRow label="Name" value={data.name} />
        <ReviewRow label="Category" value={data.category} />
        <ReviewRow label="Group Type" value={groupTypeLabel} />
        {(data.groupType === "FIXED" || data.groupType === "ROTATIONAL") && (
          <ReviewRow
            label="Fixed Contribution"
            value={`₦${data.contributionAmount}`}
          />
        )}
        <ReviewRow label="Target Amount" value={`₦${data.amount}`} />
        <ReviewRow label="Frequency" value={data.frequency} />
        <ReviewRow
          label="Dates"
          value={`${data.startDate} - ${data.endDate}`}
        />
        <ReviewRow label="Access" value={data.accessType} />
        <ReviewRow label="Member Limit" value={`${data.memberLimit} members`} />
        <ReviewRow label="Penalty" value={data.penalty} />
        <ReviewRow label="Exit Rule" value={data.earlyExit || "None"} />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => update("agreed", !data.agreed)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
      >
        <View
          className={`w-6 h-6 rounded-lg items-center justify-center border ${
            data.agreed
              ? "bg-[#155D5F] border-[#155D5F]"
              : "border-gray-300 bg-white"
          }`}
          style={{ marginRight: 4 }}
        >
          {data.agreed && <Check size={14} color="white" />}
        </View>
        <Text className="text-[#64748B] text-[13px] flex-1 leading-[19px]">
          I agree to the WealthGroup Terms of Service and understand the
          financial responsibilities as group administrator.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100/50">
      <Text className="text-[#64748B] text-[13px]">{label}</Text>
      <Text className="text-[#1A1A1A] font-bold text-[13px]">{value}</Text>
    </View>
  );
}

function SuccessScreen({ onDone, onView, groupName }: any) {
  const onShare = async () => {
    try {
      await Share.share({
        message: `Join my Wealth Tribe "${groupName}" on Wealthconomy! 🚀\n\nJoin here: wealthconomy://group/join/${encodeURIComponent(
          groupName,
        )}`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="items-center px-5 pt-4">
          <View className="w-full h-64 items-center justify-center relative">
            <Image
              source={require("../../../assets/images/success.png")}
              style={{
                width: "150%",
                height: "150%",
                opacity: 0.7,
                position: "absolute",
              }}
              resizeMode="contain"
            />
            <Image
              source={require("../../../assets/images/congrats.png")}
              style={{ width: 220, height: 220 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-[30px] font-bold mt-8 text-[#1A1A1A]">
            🎉 Congratulations🎉
          </Text>
          <Text className="text-[16px] font-bold mt-5">
            You’re Leading the Way! 🚀
          </Text>

          <Text className="text-[14px] text-center text-[#64748B] leading-[22px] mt-1">
            {`Congratulations, WealthBuilder! Your group [${
              groupName || "Wealth Tribe"
            }] is officially live. You’ve just taken a massive step toward sustainable wealth for yourself and your community.`}
          </Text>

          {/* Dynamic QR Code */}
          <View className="mt-10 mb-6 w-48 h-48 bg-white border border-gray-100 items-center justify-center rounded-2xl shadow-sm overflow-hidden p-4">
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `wealthconomy://group/join/${groupName || "tribe"}`,
                )}`,
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            onPress={onView}
            className="w-full h-14 bg-[#155D5F] rounded-2xl items-center justify-center mb-3"
          >
            <Text className="text-white font-bold text-base">View Group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShare}
            className="w-full h-14 rounded-2xl border border-gray-200 flex-row items-center justify-center space-x-2"
          >
            <Share2 size={20} color="#64748B" />
            <Text className="text-[#64748B] font-bold">Invite Members</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Components & Helpers ───────────────────────────────────────────────────

function CustomSwitch({ value, onValueChange }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: value ? THEME : "#64748B",
        padding: 2,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "white",
          marginLeft: value ? 20 : 0,
        }}
      />
    </TouchableOpacity>
  );
}

function getStepTitle(step: number) {
  switch (step) {
    case 1:
      return "Identity & Purpose";
    case 2:
      return "Financial Terms";
    case 3:
      return "Membership & Controls";
    case 4:
      return "Risk & Discipline";
    case 5:
      return "Final Review & Acceptance";
    default:
      return "";
  }
}

function FormField({ label, placeholder, onChange, ...props }: any) {
  return (
    <View className="mb-4">
      <Text className="text-[#64748B] text-[13px] font-bold mb-2">{label}</Text>
      <TextInput
        {...props}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        onChangeText={onChange}
        className="h-14 bg-gray-50 rounded-xl px-4 text-[#1A1A1A] border border-gray-100"
      />
    </View>
  );
}
