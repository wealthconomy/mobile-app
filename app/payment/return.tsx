import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function PaymentReturnScreen() {
  const router = useRouter();

  useEffect(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [router]);

  return null;
}
