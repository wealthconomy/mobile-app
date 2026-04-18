import { paymentService } from "@/src/api/paymentService";
import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

type Step = "select-method" | "use-card" | "preview";

interface SavedCard {
  id: string;
  last4: string;
  brand: "Mastercard" | "Visa";
  expiryDate: string;
  nameOnCard: string;
  usageCount: number;
}

export default function DepositScreen() {
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const [step, setStep] = useState<Step>("select-method");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [wealthPlan] = useState(plan || "WealthFlex");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [pin, setPin] = useState("");

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: "1",
      last4: "4252",
      brand: "Mastercard",
      expiryDate: "12/25",
      nameOnCard: "SIMON PETER",
      usageCount: 10,
    },
    {
      id: "2",
      last4: "8372",
      brand: "Visa",
      expiryDate: "09/24",
      nameOnCard: "SIMON PETER",
      usageCount: 5,
    },
  ]);

  const defaultCardId = [...savedCards].sort(
    (a, b) => b.usageCount - a.usageCount,
  )[0]?.id;

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const cleaned = val.replace(/[^\d.]/g, "");
    const amount = parseFloat(cleaned) || 0;
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const getTitle = () => {
    if (step === "select-method") return "Wealth Deposit";
    if (step === "use-card") return "Use Card";
    if (step === "preview") return `${wealthPlan} Preview`;
    return "";
  };

  const handleBack = () => {
    if (step === "preview") setStep("use-card");
    else if (step === "use-card") setStep("select-method");
    else router.back();
  };

  const handleCardSelect = (card: SavedCard) => {
    setCardNumber(`**** **** **** ${card.last4}`);
    setExpiryDate(card.expiryDate);
    setNameOnCard(card.nameOnCard);
    setCvv("");
    setPin("");
    setStep("use-card");
  };

  const handleConfirmPayment = () => {
    // Logic to save/update card
    const last4 = cardNumber.slice(-4);
    const existingCard = savedCards.find((c) => c.last4 === last4);

    if (existingCard) {
      setSavedCards((prev) =>
        prev.map((c) =>
          c.id === existingCard.id ? { ...c, usageCount: c.usageCount + 1 } : c,
        ),
      );
    } else {
      const newCard: SavedCard = {
        id: Date.now().toString(),
        last4,
        brand: cardNumber.startsWith("4") ? "Visa" : "Mastercard",
        expiryDate,
        nameOnCard,
        usageCount: 1,
      };
      setSavedCards((prev) => [...prev, newCard]);
    }
  };

  const InfoRow = ({
    label,
    value,
    icon,
    showCopy = false,
  }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    showCopy?: boolean;
  }) => (
    <View className="flex-row items-center mb-6">
      <View className="w-12 h-12 bg-[#E6F4F4] rounded-full items-center justify-center mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[#6B7280] text-[13px] mb-0.5">{label}</Text>
        <Text className="text-[#1A1A1A] font-bold text-[16px]">{value}</Text>
      </View>
      {showCopy && (
        <TouchableOpacity
          onPress={() => Alert.alert("Copied", `${value} copied to clipboard`)}
          activeOpacity={0.7}
          className="p-2"
        >
          <MaterialCommunityIcons
            name="content-copy"
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSelectMethod = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb- mt-4">
        Select your digital payment method
      </Text>

      <View className="mt-8 border-t border-b border-gray-100">
        <TouchableOpacity
          onPress={() => {
            setCardNumber("");
            setExpiryDate("");
            setNameOnCard("");
            setCvv("");
            setPin("");
            setStep("use-card");
          }}
          className="flex-row items-center py-6 px-1 border-b border-gray-50"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 bg-[#E6F4F4] rounded-full items-center justify-center mr-4">
            <Ionicons name="card-outline" size={24} color="#155D5F" />
          </View>
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-[15px]">
              Top-up with Card
            </Text>
            <Text className="text-[#6B7280] text-[11px] mt-0.5">
              Add funds directly from your ATM card
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowBankModal(true)}
          className="flex-row items-center py-6 px-1"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 bg-[#E6F4F4] rounded-full items-center justify-center mr-4">
            <MaterialCommunityIcons
              name="bank-outline"
              size={24}
              color="#155D5F"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-[15px]">
              Add via bank transfer
            </Text>
            <Text className="text-[#6B7280] text-[11px] mt-0.5">
              Fund your wallet by sending money from your NG bank account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View className="px-1 mt-8">
        <Text className="text-[#6B7280] text-[13px] mb-6">Saved cards</Text>

        {savedCards
          .sort((a, b) => b.usageCount - a.usageCount)
          .map((card) => (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardSelect(card)}
              className="flex-row items-center mb-6"
            >
              {card.brand === "Mastercard" ? (
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png",
                  }}
                  style={{ width: 32, height: 20, resizeMode: "contain" }}
                  className="mr-4"
                />
              ) : (
                <Svg
                  width={32}
                  height={20}
                  viewBox="0 0 20 16"
                  fill="none"
                  className="mr-4"
                >
                  <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 2C0 0.9 0.9 0 2 0H18C18.5304 0 19.0391 0.210714 19.4142 0.585786C19.7893 0.960859 20 1.46957 20 2V14C20 14.5304 19.7893 15.0391 19.4142 15.4142C19.0391 15.7893 18.5304 16 18 16H2C1.46957 16 0.960859 15.7893 0.585786 15.4142C0.210714 15.0391 0 14.5304 0 14V2ZM12.5 5.2C12.9 5.2 13.3 5.2 13.6 5.4L13.5 6.4H13.4C13.0991 6.21323 12.754 6.1097 12.4 6.1C11.9 6.1 11.7 6.4 11.7 6.6C11.7 6.8 11.9 6.9 12.4 7.1C13.1 7.5 13.4 7.9 13.4 8.4C13.4 9.4 12.6 10.1 11.2 10.1C10.6 10.1 10.1 9.9 9.8 9.8L10 8.8H10.1C10.5 9 10.8 9.1 11.3 9.1C11.7 9.1 12.1 8.9 12.1 8.6C12.1 8.4 11.9 8.3 11.4 8C10.9 7.8 10.3 7.4 10.3 6.7C10.3 5.8 11.3 5.2 12.5 5.2ZM16 5.2H17L18 10H16.8L16.6 9.3H15L14.7 10H13.4L15.3 5.6C15.4 5.3 15.6 5.3 16 5.3V5.2ZM9.8 5.2H8.5L7.7 10H9L9.8 5.2ZM5.3 8.5L5.2 7.8L4.7 5.6C4.7 5.3 4.4 5.3 4.1 5.2H2.1V5.3L3.3 5.8L3.4 6L4.5 10H6L8 5.3H6.7L5.4 8.5H5.3Z"
                    fill="#1A1A1A"
                  />
                </Svg>
              )}
              <View>
                <Text className="text-[#1A1A1A] font-bold text-sm">
                  **** {card.last4}
                </Text>
                <Text className="text-[#6B7280] text-[11px]">
                  {card.id === defaultCardId ? "Default card" : "Saved card"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </View>

      <TouchableOpacity
        onPress={() => {
          setCardNumber("");
          setExpiryDate("");
          setNameOnCard("");
          setCvv("");
          setPin("");
          setStep("use-card");
        }}
        className="bg-[#155D5F] rounded-2xl p-4 flex-row items-center justify-center mt-10"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color="white" className="mr-2" />
        <Text className="text-white font-bold ml-2">Add card</Text>
      </TouchableOpacity>

      <Modal visible={showBankModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] px-8 py-10 pb-12 w-full">
            <View className="w-12 h-1.5 bg-[#E5E7EB] rounded-full self-center mb-8" />
            <Text className="text-[#1A1A1A] font-extrabold text-[24px] mb-2 leading-tight">
              Bank Transfer
            </Text>
            <Text className="text-[#6B7280] text-[13px] mb-8">
              Here is the bank details for the transfer
            </Text>

            <View className="h-[1px] bg-gray-100 mb-8" />

            <InfoRow
              label="Bank Acct Number"
              value="Paystack7374w88q8w"
              icon={
                <MaterialCommunityIcons
                  name="pound"
                  size={20}
                  color="#155D5F"
                />
              }
              showCopy
            />
            <InfoRow
              label="Bank"
              value="Palmpay"
              icon={
                <MaterialCommunityIcons name="bank" size={20} color="#155D5F" />
              }
            />
            <InfoRow
              label="Account Name"
              value="SIMON PETER"
              icon={<Ionicons name="person" size={20} color="#155D5F" />}
              showCopy
            />

            <ThemedButton
              title="Confirm"
              onPress={() => setShowBankModal(false)}
              className="mt-6"
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderUseCard = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Input your card details
      </Text>

      <View className="space-y-6 gap-5">
        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Amount(₦)
          </Text>
          <TextInput
            placeholder="₦0.00"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Card number
          </Text>
          <TextInput
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
          />
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
              Expiry Date
            </Text>
            <TextInput
              placeholder="MM / YY"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-xs mb-2">CVV</Text>
            <TextInput
              placeholder="123"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={setCvv}
            />
          </View>
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Name on card
          </Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            value={nameOnCard}
            onChangeText={setNameOnCard}
          />
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">Pin</Text>
          <TextInput
            placeholder="****"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            keyboardType="numeric"
            secureTextEntry
            value={pin}
            onChangeText={setPin}
          />
        </View>
      </View>

      {(() => {
        const isFormValid =
          amount && cardNumber && expiryDate && cvv && nameOnCard && pin;
        return (
          <ThemedButton
            title="Confirm"
            onPress={async () => {
              setLoading(true);
              await paymentService.depositViaCard({
                amount,
                cardNumber,
                expiryDate,
                cvv,
                nameOnCard,
                pin,
              });
              handleConfirmPayment();
              setLoading(false);
              setStep("preview");
            }}
            loading={loading}
            disabled={!isFormValid || loading}
            style={{ opacity: !isFormValid || loading ? 0.5 : 1 }}
            className="mt-10"
          />
        );
      })()}
    </View>
  );

  const renderPreview = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Please, recheck and confirm before making the transaction.
      </Text>

      <View
        className="bg-[#F6F6F6] p-6 rounded-t-[24px] relative self-center"
        style={{
          width: 365,
          height: 250,
          borderWidth: 0.8,
          borderColor: "#00000040",
          borderBottomWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        {/* Wealthconomy Logo */}
        {/* <Image
          source={require("../../assets/images/wealth.png")}
          style={{
            width: 80,
            height: 20,
            position: "absolute",
            right: 10,
          }}
          resizeMode="contain"
        /> */}

        <View className="flex-row justify-between mb-8 mt-2 items-start">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Amount To Deposit
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              ₦{formatAmount(amount)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Account No.
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              8736123335
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Account Name
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              Simon Peter
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Bank Name
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">Opay</Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Wealth Send Into
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {wealthPlan}
            </Text>
          </View>
        </View>

        {/* Jagged Edge Components */}
        <View
          className="flex-row absolute -bottom-[10px] left-0 right-0 overflow-hidden"
          style={{ width: 365.1 }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 14,
                height: 14,
                backgroundColor: "white",
                transform: [{ rotate: "45deg" }],
                marginTop: 4,
              }}
            />
          ))}
        </View>
      </View>

      <ThemedButton
        title="Confirm"
        onPress={() => setShowSuccess(true)}
        className="mt-14"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Header title={getTitle()} onBack={handleBack} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {step === "select-method" && renderSelectMethod()}
        {step === "use-card" && renderUseCard()}
        {step === "preview" && renderPreview()}
      </ScrollView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-10">
          <View className="bg-white rounded-[32px] p-8 items-center w-full">
            <Image
              source={require("@/assets/images/funds.png")}
              style={{ width: 120, height: 120, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text className="text-[#1A1A1A] font-bold text-[20px] text-center mb-2">
              Funds Deposited Successfully ✅
            </Text>
            <Text className="text-[#6B7280] text-[12px] text-center mb-8 px-4">
              Congratulations, WealthBuilder! You have successfully deposited ₦
              {formatAmount(amount)} into your WinUp account.
            </Text>
            <ThemedButton
              title="Confirm"
              onPress={() => {
                setShowSuccess(false);
                router.replace("/education/win-up");
              }}
              className="w-full"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
