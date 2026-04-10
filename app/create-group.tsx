import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, ChevronDown, X } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#155D5F"; // Deep teal for buttons
const THEME_LIGHT = "#F2FFFF"; // Request color for info boxes

export default function CreateGroupScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: null as string | null,
    amount: "",
    frequency: "Monthly",
    interest: false,
    startDate: "",
    endDate: "",
    memberLimit: "",
    accessType: "Public/Open",
    penalty: "Immediate (5% of Contribution)",
    earlyExit: "Set a Penalty",
    exitRule: false,
    emergencyWithdrawal: false,
    agreed: false,
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const isStep1Valid =
    formData.name && formData.category && formData.description;
  const isStep2Valid =
    formData.amount && formData.startDate && formData.endDate;
  const isStep3Valid = formData.memberLimit && formData.accessType;
  const isStep4Valid = true; // Most are optional or have defaults
  const isStep5Valid = formData.agreed;

  if (step === 6) {
    return <SuccessScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header
        title={`Create a Wealth Group${step < 6 ? `_Step ${step}:...` : ""}`}
        onBack={() => (step === 1 ? router.back() : prevStep())}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-2">
          {/* ── Progress Indicator ────────────────────────────────── */}
          <View className="flex-row items-center space-x-1 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <View
                key={s}
                className="flex-1 h-1 rounded-full"
                style={{ backgroundColor: s <= step ? THEME : "#E2E8F0" }}
              />
            ))}
          </View>

          {/* ── Step Title ────────────────────────────────────────── */}
          <Text className="text-[20px] font-black text-[#1A1A1A] mb-2">
            Step {step}:
          </Text>
          <Text className="text-[22px] font-black text-[#1A1A1A] mb-6">
            {getStepTitle(step)}
          </Text>

          {/* ── Info Box ──────────────────────────────────────────── */}
          <View
            className="rounded-2xl p-4 mb-8 flex-row items-start relative"
            style={{ backgroundColor: THEME_LIGHT }}
          >
            <TouchableOpacity className="absolute right-3 top-3">
              <X size={16} color={THEME} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text
                className="font-black text-[12px] mb-2"
                style={{ color: THEME }}
              >
                Important things to know
              </Text>
              <Text
                className="text-[10px] leading-[15px] opacity-80"
                style={{ color: THEME }}
              >
                {getStepInfo(step)}
              </Text>
            </View>
          </View>

          {/* ── Form Content ──────────────────────────────────────── */}
          {step === 1 && (
            <Step1
              data={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
          )}
          {step === 2 && (
            <Step2
              data={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
          )}
          {step === 3 && (
            <Step3
              data={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
          )}
          {step === 4 && (
            <Step4
              data={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
          )}
          {step === 5 && (
            <Step5
              data={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Button ─────────────────────────────────────── */}
      <View className="px-5 py-6 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="h-14 rounded-2xl items-center justify-center"
          style={{
            backgroundColor:
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 3 && !isStep3Valid) ||
              (step === 5 && !isStep5Valid)
                ? "#E0E0E0"
                : THEME,
            opacity:
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 3 && !isStep3Valid) ||
              (step === 5 && !isStep5Valid)
                ? 0.45
                : 1,
          }}
          disabled={
            (step === 1 && !isStep1Valid) ||
            (step === 2 && !isStep2Valid) ||
            (step === 3 && !isStep3Valid) ||
            (step === 5 && !isStep5Valid)
          }
          onPress={nextStep}
        >
          <Text className="text-white font-black text-[16px]">
            {step === 5 ? "Launch your Wealth Tribe" : "Proceed"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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

function getStepInfo(step: number) {
  return "To keep the experience simple and intuitive for the 'Wealth Builder', the form for creating a Wealth Contribution Group should be broken down into logical steps. This prevents the user from feeling overwhelmed by too many fields at once.";
}

function InputLabel({ label, extra }: { label: string; extra?: string }) {
  return (
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-[13px] font-black text-[#1A1A1A]">{label}</Text>
      {extra && <Text className="text-[11px] text-[#94A3B8]">{extra}</Text>}
    </View>
  );
}

function Step1({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <View className="space-y-6">
      <View>
        <InputLabel label="Group Name" />
        <TextInput
          placeholder='e.g. "The 2024 Homeowners Circle"'
          className="h-12 bg-gray-50 rounded-xl px-4 text-[14px]"
          value={data.name}
          onChangeText={(t) => onChange({ name: t })}
        />
      </View>

      <View>
        <InputLabel label="Group Category" />
        <TextInput
          placeholder="e.g. Rent, Festival, Business, etc."
          className="h-12 bg-gray-50 rounded-xl px-4 text-[14px]"
          value={data.category}
          onChangeText={(t) => onChange({ category: t })}
        />
      </View>

      <View>
        <InputLabel label="Group Cover Image (Optional)" />
        {data.image ? (
          <View className="relative w-full h-40 rounded-2xl overflow-hidden mb-2">
            <ImageBackground
              source={{ uri: data.image }}
              className="w-full h-full"
              resizeMode="cover"
            >
              <TouchableOpacity
                className="absolute right-3 top-3 bg-white/80 p-2 rounded-full"
                onPress={() => onChange({ image: null })}
              >
                <X size={16} color={THEME} />
              </TouchableOpacity>
            </ImageBackground>
          </View>
        ) : (
          <TouchableOpacity
            className="w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-[#E2E8F0] items-center justify-center"
            onPress={() =>
              onChange({
                image:
                  "https://images.unsplash.com/photo-1542435503-956c469947f6",
              })
            }
          >
            <View className="items-center">
              <Ionicons name="cloud-upload-outline" size={28} color="#94A3B8" />
              <Text className="text-[11px] text-[#94A3B8] mt-2">
                Browse a file in a PNG and JPG format
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View>
        <InputLabel label="Group Description" />
        <TextInput
          placeholder="e.g. 2024 Homeowners Circle description"
          multiline
          className="h-24 bg-gray-50 rounded-xl px-4 py-3 text-[14px]"
          value={data.description}
          onChangeText={(t) => onChange({ description: t })}
        />
      </View>
    </View>
  );
}

function Step2({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <View className="space-y-6">
      <View>
        <InputLabel label="Wealth Amount(₦)" />
        <TextInput
          placeholder="e.g. ₦1,000,000.00"
          keyboardType="numeric"
          className="h-12 bg-gray-50 rounded-xl px-4 text-[14px]"
          value={data.amount}
          onChangeText={(t) => onChange({ amount: t })}
        />
      </View>

      <View>
        <InputLabel label="Contribution Frequency" />
        <TouchableOpacity className="h-12 bg-gray-50 rounded-xl px-4 flex-row justify-between items-center">
          <Text className="text-[14px]">
            {data.frequency || "Select Frequency"}
          </Text>
          <ChevronDown size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[13px] font-black text-[#1A1A1A]">
            Member Interest
          </Text>
          <Text className="text-[10px] text-[#94A3B8] max-w-[200px]">
            Enable the option each member to earn interest from the group
            savings.
          </Text>
        </View>
        <Switch
          value={data.interest}
          onValueChange={(v) => onChange({ interest: v })}
          trackColor={{ false: "#E2E8F0", true: THEME }}
        />
      </View>

      <View>
        <InputLabel label="Start Date" />
        <TextInput
          placeholder="DD / MM / YYYY"
          className="h-12 bg-gray-50 rounded-xl px-4 text-[14px]"
          value={data.startDate}
          onChangeText={(t) => onChange({ startDate: t })}
        />
      </View>

      <View>
        <InputLabel label="End Date" />
        <TextInput
          placeholder="DD / MM / YYYY"
          className="h-12 bg-gray-50 rounded-xl px-4 text-[14px]"
          value={data.endDate}
          onChangeText={(t) => onChange({ endDate: t })}
        />
        <Text className="text-[9px] text-[#94A3B8] mt-2">
          Note: To earn the full interest, you must meet your target amount on
          or each of this date.
        </Text>
      </View>
    </View>
  );
}

function Step3({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const ACCESS_TYPES = ["Private/Invite-only", "Public/Open"];
  return (
    <View className="space-y-6">
      <View>
        <InputLabel label="Members Limit" extra="100 maximum" />
        <TextInput
          placeholder="e.g. 10 members"
          keyboardType="numeric"
          className="h-12 bg-gray-50 rounded-xl px-4 text-[14px]"
          value={data.memberLimit}
          onChangeText={(t) => onChange({ memberLimit: t })}
        />
      </View>

      <View>
        <InputLabel label="Access Type" />
        <View className="space-y-3">
          {ACCESS_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              className="h-12 bg-gray-50 rounded-xl px-4 flex-row justify-between items-center"
              style={{
                borderWidth: data.accessType === type ? 1 : 0,
                borderColor: THEME,
              }}
              onPress={() => onChange({ accessType: type })}
            >
              <Text className="text-[14px]">{type}</Text>
              {data.accessType === type && <Check size={18} color={THEME} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function Step4({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const PENALTIES = [
    "Immediate (5% of Contribution)",
    "Grace period (24 hours)",
  ];
  return (
    <View className="space-y-6">
      <View>
        <InputLabel
          label="Penalty Settings"
          extra="Note: This is for late contribution"
        />
        <View className="space-y-3">
          {PENALTIES.map((p) => (
            <TouchableOpacity
              key={p}
              className="h-12 bg-gray-50 rounded-xl px-4 flex-row justify-between items-center"
              style={{
                borderWidth: data.penalty === p ? 1 : 0,
                borderColor: THEME,
              }}
              onPress={() => onChange({ penalty: p })}
            >
              <Text className="text-[14px]">{p}</Text>
              {data.penalty === p && <Check size={18} color={THEME} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View>
        <InputLabel label="Early Exit" />
        <TouchableOpacity className="h-12 bg-gray-50 rounded-xl px-4 flex-row justify-between items-center">
          <Text className="text-[14px]">{data.earlyExit}</Text>
          <ChevronDown size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[13px] font-black text-[#1A1A1A]">
            Exit Rule
          </Text>
          <Text className="text-[10px] text-[#94A3B8] max-w-[200px]">
            Users must agree to the "Lock-in Period". Funds cannot be withdrawn
            until the end of the cycle.
          </Text>
        </View>
        <Switch
          value={data.exitRule}
          onValueChange={(v) => onChange({ exitRule: v })}
          trackColor={{ false: "#E2E8F0", true: THEME }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[13px] font-black text-[#1A1A1A]">
            Emergency Withdrawal
          </Text>
          <Text className="text-[10px] text-[#94A3B8] max-w-[200px]">
            For members to request fund before the options.
          </Text>
        </View>
        <Switch
          value={data.emergencyWithdrawal}
          onValueChange={(v) => onChange({ emergencyWithdrawal: v })}
          trackColor={{ false: "#E2E8F0", true: THEME }}
        />
      </View>
    </View>
  );
}

function Step5({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <View className="space-y-6">
      <View className="bg-gray-50 p-4 rounded-2xl">
        <Text className="font-extrabold text-[14px] mb-3">Group Summary</Text>
        <View className="space-y-2">
          <SummaryRow label="Name" value={data.name} />
          <SummaryRow label="Category" value={data.category} />
          <SummaryRow label="Wealth Amount" value={`₦${data.amount}`} />
          <SummaryRow label="Frequency" value={data.frequency} />
          <SummaryRow label="Access" value={data.accessType} />
        </View>
      </View>

      <View className="flex-row items-start space-x-3 mt-4">
        <TouchableOpacity
          className="w-6 h-6 rounded border items-center justify-center"
          style={{
            borderColor: data.agreed ? THEME : "#E2E8F0",
            backgroundColor: data.agreed ? THEME : "white",
          }}
          onPress={() => onChange({ agreed: !data.agreed })}
        >
          {data.agreed && <Check size={14} color="white" />}
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[13px] text-[#1A1A1A]">
            I agree with the{" "}
            <Text className="text-teal-600 font-bold decoration-teal-600 underline">
              Group Savings Agreement and Accountability Rules.
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-1">
      <Text className="text-[11px] text-[#64748B] font-bold">{label}:</Text>
      <Text className="text-[11px] text-[#1A1A1A] font-black">{value}</Text>
    </View>
  );
}

function SuccessScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <ImageBackground
        source={require("../assets/images/success.png")}
        className="flex-1 items-center justify-center px-10"
        resizeMode="cover"
      >
        <View className="items-center mb-10">
          <Image
            source={require("../assets/images/group1.png")}
            style={{ width: 150, height: 150, marginBottom: 20 }}
            resizeMode="contain"
          />
          <Text className="text-[28px] font-black text-center mb-4">
            🎉 Congratulation
          </Text>
          <Text className="text-[14px] text-center text-[#64748B] leading-[22px]">
            You're leading the Way! 🚀 {"\n"}
            Congratulations. Wealth Builder! Your group{" "}
            {`"The 2024 Homeowners Circle"`} is now active and live. You've just
            taken a massive step toward sustainable wealth for yourself and your
            community.
          </Text>
        </View>

        <View className="bg-white p-4 rounded-2xl shadow-sm mb-10 border border-gray-100">
          {/* Mock QR Code */}
          <View className="w-32 h-32 bg-gray-50 items-center justify-center">
            <Ionicons name="qr-code-outline" size={80} color="#1A1A1A" />
          </View>
        </View>

        <TouchableOpacity
          className="w-full h-14 rounded-2xl flex-row items-center justify-center"
          style={{
            backgroundColor: THEME_LIGHT,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color={THEME}
            className="mr-2"
          />
          <Text
            style={{ color: THEME }}
            className="font-black text-[16px] ml-2"
          >
            Invite Members
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6"
          onPress={() => router.replace("/(tabs)/portfolios/wealth-group")}
        >
          <Text className="text-[#64748B] font-bold">Go back to dashboard</Text>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  );
}
