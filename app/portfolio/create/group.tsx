import Header from "@/src/components/common/Header";
import { addGroup } from "@/src/store/slices/wealthGroupSlice";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Share2, Upload, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
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
import { useDispatch } from "react-redux";

const THEME = "#155D5F";
const THEME_BG = "#F2FFFF";

// ── Types ───────────────────────────────────────────────────────────────────

type GroupData = {
  name: string;
  category: string;
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
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function CreateGroupScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GroupData>({
    name: "",
    category: "",
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
  });

  const updateFormData = (field: string, value: any) => {
    // Defensive check to prevent event objects from being saved as values
    if (value && typeof value === "object" && value.nativeEvent) {
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 5) {
      const newId = Math.random().toString(36).substring(7);
      dispatch(
        addGroup({
          ...formData,
          id: newId,
          membersCount: 1,
          currentSavings: "0.00",
          growthToday: "0.00",
          isAdmin: true,
          isMember: true,
        }),
      );
      setCreatedGroupId(newId);
    }
    setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.category && formData.description);
      case 2:
        return !!(
          formData.amount &&
          formData.frequency &&
          formData.startDate.length >= 10 &&
          formData.endDate.length >= 10
        );
      case 3:
        const limit = parseInt(formData.memberLimit);
        return !!(
          formData.memberLimit &&
          limit > 0 &&
          limit <= 200 &&
          formData.accessType
        );
      case 4:
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
        onDone={() => router.replace("/portfolios/wealth-group")}
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
                  width: 366,
                  height: 132,
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
                  To keep the experience simple and intuitive for the
                  "WealthBuilder," the form for creating a Fixed Contribution
                  Group should be broken down into logical steps. This prevents
                  the user from feeling overwhelmed by too many fields at once.
                </Text>
              </View>
            )}

            {step === 1 && (
              <Step1Identity data={formData} update={updateFormData} />
            )}
            {step === 2 && (
              <Step2Financial data={formData} update={updateFormData} />
            )}
            {step === 3 && (
              <Step3Membership data={formData} update={updateFormData} />
            )}
            {step === 4 && (
              <Step4Risk data={formData} update={updateFormData} />
            )}
            {step === 5 && (
              <Step5Review data={formData} update={updateFormData} />
            )}

            {/* ── Action Button (Inside ScrollView) ────────────────── */}
            <View className="mt-10">
              <TouchableOpacity
                disabled={!isStepValid}
                onPress={nextStep}
                className={`h-14 rounded-2xl items-center justify-center ${
                  isStepValid ? "bg-[#155D5F]" : "bg-gray-200"
                }`}
              >
                <Text className="text-white font-bold text-base">
                  {step === 5 ? "Launch your Wealth Tribe" : "Proceed"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Step Components ─────────────────────────────────────────────────────────

function Step1Identity({ data, update }: any) {
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

  return (
    <View className="space-y-6">
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
  const options = ["Daily", "Weekly", "Monthly"];

  const formatAmount = (val: string) => {
    if (typeof val !== "string") return "";
    const n = val.replace(/\D/g, "");
    return n ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  };

  const formatDate = (val: string) => {
    if (typeof val !== "string") return "";
    const n = val.replace(/\D/g, "");
    if (n.length <= 2) return n;
    if (n.length <= 4) return `${n.slice(0, 2)} / ${n.slice(2)}`;
    return `${n.slice(0, 2)} / ${n.slice(2, 4)} / ${n.slice(4, 8)}`;
  };

  return (
    <View className="space-y-6">
      <FormField
        label="Wealth Amount(₦)"
        placeholder="e.g, ₦3,500,000.00"
        value={data.amount}
        onChange={(t: string) => update("amount", formatAmount(t))}
        keyboardType="numeric"
      />

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

      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-[#64748B] text-[13px] font-bold">
            Member Interest
          </Text>
          <Text className="text-gray-400 text-[10px]">
            Enable this allow each member to earn interest from the group
            savings
          </Text>
        </View>
        <CustomSwitch
          value={data.hasInterest}
          onValueChange={(v) => update("hasInterest", v)}
        />
      </View>

      <FormField
        label="Start Date"
        placeholder="DD / MM / YYYY"
        value={data.startDate}
        onChange={(t: string) => update("startDate", formatDate(t))}
        keyboardType="numeric"
        maxLength={14}
      />
      <FormField
        label="End Date"
        placeholder="DD / MM / YYYY"
        value={data.endDate}
        onChange={(t: string) => update("endDate", formatDate(t))}
        keyboardType="numeric"
        maxLength={14}
      />

      <Text className="text-[10px] text-gray-400 italic">
        Note: To earn the full interest, you must meet your target amount and
        reach this date.
      </Text>
    </View>
  );
}

function Step3Membership({ data, update }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["Public/Open", "Private/Invite-Only"];
  const isOverLimit = parseInt(data.memberLimit) > 200;

  return (
    <View className="space-y-6">
      <View className="mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-[#64748B] text-[13px] font-bold">
            Members Limit
          </Text>
          <Text className="text-gray-400 text-[11px]">200 maximum</Text>
        </View>
        <TextInput
          placeholder="e.g., 10 members"
          value={data.memberLimit}
          onChangeText={(t) => update("memberLimit", t)}
          keyboardType="numeric"
          className={`h-14 bg-gray-50 rounded-xl px-4 text-[#1A1A1A] border ${
            isOverLimit ? "border-red-500" : "border-gray-100"
          }`}
        />
        {isOverLimit && (
          <Text className="text-red-500 text-[10px] mt-1">
            Limit cannot exceed 200 members
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
            className={data.accessType ? "text-[#1A1A1A]" : "text-gray-400"}
          >
            {data.accessType || "Choose an access type"}
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
                  update("accessType", opt);
                  setIsOpen(false);
                }}
                className="px-4 py-4 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] font-medium">{opt}</Text>
                {data.accessType === opt && <Check size={16} color={THEME} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function Step4Risk({ data, update }: any) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const penaltyOptions = [
    "Immediate (5% of contribution)",
    "Grace period (24hours)",
  ];
  const exitOptions = ["Fixed Penalty (10%)", "No Withdrawal", "Custom Rule"];

  return (
    <View className="space-y-6">
      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-1">
          Penalty Settings
        </Text>
        <TouchableOpacity
          onPress={() =>
            setOpenDropdown(openDropdown === "penalty" ? null : "penalty")
          }
          className="h-14 bg-gray-50 rounded-xl px-4 flex-row items-center justify-between border border-gray-100"
        >
          <Text className={data.penalty ? "text-[#1A1A1A]" : "text-gray-400"}>
            {data.penalty || "Set a Penalty"}
          </Text>
          <Ionicons
            name={openDropdown === "penalty" ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
        {openDropdown === "penalty" && (
          <View className="bg-white rounded-xl mt-2 border border-gray-100 overflow-hidden shadow-sm">
            {penaltyOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  update("penalty", opt);
                  setOpenDropdown(null);
                }}
                className="px-4 py-4 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] font-medium">{opt}</Text>
                {data.penalty === opt && <Check size={16} color={THEME} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text className="text-gray-400 text-[10px] mt-1">
          Note: This is for late contribution
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-[#64748B] text-[13px] font-bold mb-1">
          Early Exit
        </Text>
        <TouchableOpacity
          onPress={() =>
            setOpenDropdown(openDropdown === "exit" ? null : "exit")
          }
          className="h-14 bg-gray-50 rounded-xl px-4 flex-row items-center justify-between border border-gray-100"
        >
          <Text className={data.earlyExit ? "text-[#1A1A1A]" : "text-gray-400"}>
            {data.earlyExit || "Set a Penalty"}
          </Text>
          <Ionicons
            name={openDropdown === "exit" ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
        {openDropdown === "exit" && (
          <View className="bg-white rounded-xl mt-2 border border-gray-100 overflow-hidden shadow-sm">
            {exitOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  update("earlyExit", opt);
                  setOpenDropdown(null);
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

      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-[#64748B] text-[13px] font-bold">
            Exit Rule
          </Text>
          <Text className="text-gray-400 text-[10px]">
            Users must agree to the "Lock-in Period" (Funds cannot be withdrawn
            until the end of the cycle)
          </Text>
        </View>
        <CustomSwitch
          value={data.exitRule}
          onValueChange={(v) => update("exitRule", v)}
        />
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-[#64748B] text-[13px] font-bold">
            Emergency Withdrawal
          </Text>
          <Text className="text-gray-400 text-[10px]">
            For members to request funds before the goal date
          </Text>
        </View>
        <CustomSwitch
          value={data.emergencyWithdrawal}
          onValueChange={(v) => update("emergencyWithdrawal", v)}
        />
      </View>
    </View>
  );
}

function Step5Review({ data, update }: any) {
  return (
    <View className="space-y-6">
      <Text className="text-[#155D5F] font-black text-[15px] mb-2 underline">
        Terms of Service
      </Text>
      <TouchableOpacity
        onPress={() => update("agreed", !data.agreed)}
        className="flex-row items-start"
      >
        <View
          className={`w-5 h-5 rounded border items-center justify-center mr-3 mt-1 ${
            data.agreed
              ? "bg-[#155D5F] border-[#155D5F]"
              : "bg-white border-gray-300"
          }`}
        >
          {data.agreed && <Check size={14} color="white" />}
        </View>
        <Text className="text-[#64748B] text-[14px] leading-[20px] flex-1">
          I agree with the{" "}
          <Text className="font-bold underline text-[#1A1A1A]">
            Group Savings Agreement and Accountability Rules.
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function SuccessScreen({
  onDone,
  onView,
  groupName,
}: {
  onDone: () => void;
  onView: () => void;
  groupName: string;
}) {
  const onShare = async () => {
    try {
      await Share.share({
        message: `Join my Wealth Tribe "${groupName}" on Wealthconomy!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-white"
      edges={["top", "bottom"]}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-4">
          <TouchableOpacity onPress={onDone}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

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
