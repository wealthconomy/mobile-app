import Header from "@/src/components/common/Header";
import { CardAddedModal } from "@/src/features/payment/components/PaymentModals";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useLinkMandateMutation, useLazyVerifyPaymentQuery, useListMyMandatesQuery } from "@/src/store/api/paymentApi";
import * as WebBrowser from "expo-web-browser";

export default function UseCardScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [email, setEmail] = useState(user?.email || "");
  const [showSuccess, setShowSuccess] = useState(false);

  const [linkMandate, { isLoading }] = useLinkMandateMutation();
  const [verifyPayment] = useLazyVerifyPaymentQuery();
  const { data: mandatesData, refetch: refetchMandates } = useListMyMandatesQuery();
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (mandatesData) {
      console.log("=== LINKED MANDATES DATA ===");
      console.log(JSON.stringify(mandatesData, null, 2));
    }
  }, [mandatesData]);

  const handleConfirm = async () => {
    if (!email) {
      Alert.alert("Error", "Please provide a valid email address.");
      return;
    }

    const idempotencyKey = `mdt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    try {
      const response = await linkMandate({
        userId: user?.id || "",
        email,
        channel: "WEB",
        redirectUrl: `${process.env.EXPO_PUBLIC_API_URL}/payments/mandates/me`,
        idempotencyKey,
      }).unwrap();

      const checkoutUrl = response?.data?.checkoutUrl;
      const paymentRef = response?.data?.providerRef || response?.data?.id;
      if (checkoutUrl) {
        await WebBrowser.openBrowserAsync(checkoutUrl);

        if (paymentRef) {
          setVerifying(true);
          let verified = false;
          for (let i = 0; i < 5; i++) {
            try {
              console.log(`Checking card linking status (Attempt ${i + 1}/5)...`);
              const verifyRes = await verifyPayment(paymentRef).unwrap();
              console.log("Card verify response:", JSON.stringify(verifyRes, null, 2));

              const status = verifyRes?.data?.status;
              if (status === "SUCCESSFUL" || status === "SUCCEEDED") {
                verified = true;
                break;
              }
            } catch (e) {
              console.warn(`Card verification attempt ${i + 1} failed:`, e);
            }
            // Wait 2.5 seconds before retrying
            await new Promise((resolve) => setTimeout(resolve, 2500));
          }
          setVerifying(false);

          if (verified) {
            try {
              refetchMandates();
            } catch (e) {
              console.warn("Failed to refetch mandates:", e);
            }
            setShowSuccess(true);
          } else {
            Alert.alert(
              "Linking Card",
              "We are still finalizing your card connection. It will reflect in your payment methods shortly."
            );
          }
        } else {
          setShowSuccess(true);
        }
      } else {
        throw new Error("Checkout URL not found in API response.");
      }
    } catch (err: any) {
      console.error("Link mandate error:", err);
      Alert.alert("Error", err?.data?.message || err?.message || "Failed to link payment method.");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Add Card / Bank Link" />

      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <Text className="text-[15px] font-bold text-[#155D5F] mb-3">
            Secure Payment Method Linking
          </Text>
          <Text className="text-[13px] text-[#4B5563] leading-[20px]">
            To link your bank card or authorization mandate, you will be redirected to our secure payment gateway (Paga) to complete a verification step.
          </Text>
        </View>

        <View className="gap-y-6">
          <View>
            <Text className="text-[14px] font-semibold text-[#323232] mb-2">
              Billing Email Address
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                placeholder="email@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isLoading || verifying || !email}
          className={`mt-10 h-16 rounded-2xl items-center justify-center shadow-sm ${email && !isLoading && !verifying ? "bg-[#155D5F]" : "bg-[#155D5F]/50"}`}
        >
          {isLoading || verifying ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" className="mr-2" />
              {verifying && <Text className="text-white font-semibold ml-2">Verifying card...</Text>}
            </View>
          ) : (
            <Text className="text-white text-base font-bold">Link Payment Method</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <CardAddedModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        onConfirm={handleSuccessClose}
        title="Mandate Linked Successfully ✅"
        description="Your card or bank authorization has been successfully linked to your account. You can now use it for direct debits and savings."
      />
    </SafeAreaView>
  );
}
