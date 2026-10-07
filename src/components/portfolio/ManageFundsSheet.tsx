import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import ThemedButton from "@/src/components/ThemedButton";
import ConfirmActionModal from "@/src/components/common/ConfirmActionModal";
import { BlurView } from "expo-blur";
import { useGetPortfoliosQuery } from "@/src/store/api/portfolioApi";
import { useGetUserPayoutAccountsQuery } from "@/src/store/api/payoutAccountApi";
import { Portfolio, PortfolioType } from "@/src/types/portfolio";

const TEAL = "#0B575B";
const TEAL_LIGHT = "#EEF6F6";
const TEXT_DARK = "#1A1A1A";

export interface ManageFundsSheetProps {
  portfolioId: string;
  portfolioName: string;
  portfolioBalance: string; // Balance in kobo string (e.g. "5000000")
  portfolioType?: string; // e.g. "wealthgoal" | "wealthfam" | "wealthflow"
  visible: boolean;
  onClose: () => void;
}

type TabType = "withdraw" | "portfolio" | "bank";

export default function ManageFundsSheet({
  portfolioId,
  portfolioName,
  portfolioBalance,
  portfolioType = "wealthgoal",
  visible,
  onClose,
}: ManageFundsSheetProps) {
  const [activeTab, setActiveTab] = useState<TabType>("withdraw");
  const [amount, setAmount] = useState("");
  const [selectedDestPortfolioId, setSelectedDestPortfolioId] = useState<string | null>(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    summaryRows: { label: string; value: string }[];
    onConfirm: () => void;
  }>({
    title: "Confirm Action",
    summaryRows: [],
    onConfirm: () => {},
  });

  // Balance calculations (balance prop is in kobo)
  const balanceKobo = parseFloat(portfolioBalance || "0");
  const balanceNaira = balanceKobo / 100;

  // Validation calculations
  const numAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
  const isOverBalance = numAmount > 0 && numAmount > balanceNaira;
  const isValidAmount = numAmount > 0 && !isOverBalance;

  useEffect(() => {
    if (!visible) {
      setAmount("");
      setIsNavigating(false);
      setShowConfirmModal(false);
    }
  }, [visible]);

  // Fetch portfolios for all types for Tab 2 (Transfer to Portfolio)
  const { data: goalPortfolios, isLoading: loadingGoal } = useGetPortfoliosQuery({ type: "wealthgoal" }, { skip: !visible || activeTab !== "portfolio" });
  const { data: fixPortfolios, isLoading: loadingFix } = useGetPortfoliosQuery({ type: "wealthfix" }, { skip: !visible || activeTab !== "portfolio" });
  const { data: flexPortfolios, isLoading: loadingFlex } = useGetPortfoliosQuery({ type: "wealthflex" }, { skip: !visible || activeTab !== "portfolio" });
  const { data: famPortfolios, isLoading: loadingFam } = useGetPortfoliosQuery({ type: "wealthfam" }, { skip: !visible || activeTab !== "portfolio" });
  const { data: flowPortfolios, isLoading: loadingFlow } = useGetPortfoliosQuery({ type: "wealthflow" }, { skip: !visible || activeTab !== "portfolio" });

  const loadingPortfolios = loadingGoal || loadingFix || loadingFlex || loadingFam || loadingFlow;

  // Merge candidate target portfolios (active only, excluding self)
  const candidatePortfolios = useMemo(() => {
    const all: Portfolio[] = [
      ...(goalPortfolios?.items || []),
      ...(fixPortfolios?.items || []),
      ...(flexPortfolios?.items || []),
      ...(famPortfolios?.items || []),
      ...(flowPortfolios?.items || []),
    ];
    return all.filter((p) => p.id !== portfolioId && (p.status || "ACTIVE") === "ACTIVE");
  }, [goalPortfolios, fixPortfolios, flexPortfolios, famPortfolios, flowPortfolios, portfolioId]);

  // Fetch payout bank accounts for Tab 3 (Transfer to Bank)
  const { data: payoutAccountsData, isLoading: loadingPayouts } = useGetUserPayoutAccountsQuery(undefined, {
    skip: !visible || activeTab !== "bank",
  });
  const payoutAccounts = payoutAccountsData?.items || [];

  const formatCurrency = (val: number) => {
    return val.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleFillFullBalance = () => {
    setAmount(balanceNaira > 0 ? balanceNaira.toString() : "");
  };

  const getTypeLabel = (typeStr: string) => {
    switch (typeStr?.toLowerCase()) {
      case "wealthgoal":
        return "Goal";
      case "wealthfix":
        return "Fix";
      case "wealthflex":
        return "Flex";
      case "wealthfam":
        return "Fam";
      case "wealthflow":
        return "Flow";
      default:
        return typeStr || "Portfolio";
    }
  };

  const getReturnUrl = () => {
    const typeClean = portfolioType.replace("wealth", "");
    return `/portfolio/detail/${typeClean}/${portfolioId}`;
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount.replace(/[^\d.]/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (numAmount > balanceNaira && balanceNaira > 0) {
      Alert.alert(
        "Insufficient Balance",
        "You can't transfer more than what is in your balance."
      );
      return;
    }

    if (activeTab === "portfolio" && !selectedDestPortfolioId) {
      Alert.alert("Selection Required", "Please select a destination portfolio.");
      return;
    }

    if (activeTab === "bank" && !selectedBankAccountId) {
      Alert.alert("Selection Required", "Please select a saved payout bank account.");
      return;
    }

    setIsNavigating(true);
    const returnUrl = getReturnUrl();
    const actionPrefix = portfolioType.toUpperCase().replace("WEALTH", "");

    if (activeTab === "withdraw") {
      setConfirmConfig({
        title: "Confirm Withdrawal",
        summaryRows: [
          { label: "Amount", value: `₦${formatCurrency(numAmount)}` },
          { label: "From Plan", value: portfolioName },
          { label: "Destination", value: "Main Wallet" },
        ],
        onConfirm: () => {
          router.push({
            pathname: "/payment/insert-pin",
            params: {
              amount: numAmount.toString(),
              action: `${actionPrefix}_WITHDRAW`,
              targetId: portfolioId,
              targetName: portfolioName,
              returnUrl,
            },
          } as any);
        },
      });
      setShowConfirmModal(true);
    } else if (activeTab === "portfolio") {
      const chosenPortfolio = candidatePortfolios.find((p) => p.id === selectedDestPortfolioId);
      setConfirmConfig({
        title: "Confirm Portfolio Transfer",
        summaryRows: [
          { label: "Amount", value: `₦${formatCurrency(numAmount)}` },
          { label: "From Plan", value: portfolioName },
          { label: "To Plan", value: chosenPortfolio?.name || "Target Portfolio" },
        ],
        onConfirm: () => {
          router.push({
            pathname: "/payment/insert-pin",
            params: {
              amount: numAmount.toString(),
              action: "TRANSFER_PORTFOLIO",
              targetId: portfolioId,
              targetName: portfolioName,
              destinationId: selectedDestPortfolioId,
              destinationName: chosenPortfolio?.name || "Target Portfolio",
              returnUrl,
            },
          } as any);
        },
      });
      setShowConfirmModal(true);
    } else if (activeTab === "bank") {
      const chosenAccount = payoutAccounts.find((a) => a.id === selectedBankAccountId);
      const destName = chosenAccount ? `${chosenAccount.bankName} (${chosenAccount.accountNumber})` : "Bank Account";
      setConfirmConfig({
        title: "Confirm Bank Transfer",
        summaryRows: [
          { label: "Amount", value: `₦${formatCurrency(numAmount)}` },
          { label: "From Plan", value: portfolioName },
          { label: "Bank Account", value: destName },
        ],
        onConfirm: () => {
          router.push({
            pathname: "/payment/insert-pin",
            params: {
              amount: numAmount.toString(),
              action: "TRANSFER_BANK",
              targetId: portfolioId,
              targetName: portfolioName,
              destinationId: selectedBankAccountId,
              destinationName: destName,
              returnUrl,
            },
          } as any);
        },
      });
      setShowConfirmModal(true);
    }
  };

  if (!visible && !showConfirmModal) return null;

  return (
    <>
      <Modal visible={visible && !showConfirmModal} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetContainer}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

              {/* Title & Close */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.sheetTitle}>Transfer Portfolio Funds</Text>
                  <Text style={styles.sheetSubtitle}>
                    {portfolioName} • Bal: ₦{formatCurrency(balanceNaira)}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  onPress={() => setActiveTab("withdraw")}
                  style={[styles.tabBtn, activeTab === "withdraw" && styles.activeTabBtn]}
                >
                  <Text style={[styles.tabText, activeTab === "withdraw" && styles.activeTabText]}>
                    To Wallet
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("portfolio")}
                  style={[styles.tabBtn, activeTab === "portfolio" && styles.activeTabBtn]}
                >
                  <Text style={[styles.tabText, activeTab === "portfolio" && styles.activeTabText]}>
                    To Portfolio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("bank")}
                  style={[styles.tabBtn, activeTab === "bank" && styles.activeTabBtn]}
                >
                  <Text style={[styles.tabText, activeTab === "bank" && styles.activeTabText]}>
                    To Bank
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Amount Input Block */}
                <View style={[styles.amountBlock, isOverBalance && styles.amountBlockError]}>
                  <View style={styles.amountHeader}>
                    <Text style={styles.inputLabel}>Enter Amount (₦)</Text>
                    {balanceNaira > 0 && (
                      <TouchableOpacity onPress={handleFillFullBalance} style={styles.quickFillBtn}>
                        <Text style={styles.quickFillText}>Full Balance (₦{formatCurrency(balanceNaira)})</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.amountInputRow}>
                    <Text style={[styles.currencyPrefix, isOverBalance && { color: "#EF4444" }]}>₦</Text>
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={(val) => {
                        let cleaned = val.replace(/[^\d.]/g, "");
                        const parts = cleaned.split(".");
                        if (parts.length > 2) {
                          cleaned = parts[0] + "." + parts.slice(1).join("");
                        }
                        setAmount(cleaned);
                      }}
                      style={[styles.amountInput, isOverBalance && { color: "#EF4444" }]}
                    />
                    {amount.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setAmount("")}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{
                          backgroundColor: isOverBalance ? "#FEE2E2" : "#E2E8F0",
                          borderRadius: 999,
                          padding: 4,
                          marginLeft: 8,
                        }}
                      >
                        <Ionicons
                          name={isOverBalance ? "alert-circle" : "close"}
                          size={14}
                          color={isOverBalance ? "#EF4444" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  {isOverBalance && (
                    <View style={styles.errorMessageRow}>
                      <Ionicons name="alert-circle" size={15} color="#EF4444" style={{ marginRight: 5 }} />
                      <Text style={styles.errorMessageText}>
                        You can't transfer more than what is in your balance
                      </Text>
                    </View>
                  )}
                </View>

                {/* Tab 1 Content: Withdraw to Wallet Info */}
                {activeTab === "withdraw" && (
                  <View style={styles.infoBox}>
                    <Ionicons name="wallet-outline" size={24} color={TEAL} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", color: TEXT_DARK, fontSize: 13 }}>
                        Withdraw to Main Wallet
                      </Text>
                      <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
                        Funds will be transferred directly to your Main Wallet balance instantly.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Tab 2 Content: Transfer to Portfolio Target Picker */}
                {activeTab === "portfolio" && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.inputLabel}>Select Destination Portfolio</Text>
                    {loadingPortfolios ? (
                      <View style={{ paddingVertical: 20, alignItems: "center" }}>
                        <ActivityIndicator color={TEAL} size="small" />
                        <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 6 }}>Loading portfolios...</Text>
                      </View>
                    ) : candidatePortfolios.length > 0 ? (
                      <View style={{ gap: 10, marginTop: 8 }}>
                        {candidatePortfolios.map((item) => {
                          const isSelected = selectedDestPortfolioId === item.id;
                          const pBal = parseFloat(item.balance || "0") / 100;
                          return (
                            <TouchableOpacity
                              key={item.id}
                              onPress={() => setSelectedDestPortfolioId(item.id)}
                              style={[styles.candidateCard, isSelected && styles.selectedCandidateCard]}
                            >
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                  <Text style={styles.candidateName}>{item.name}</Text>
                                  <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{getTypeLabel(item.type)}</Text>
                                  </View>
                                </View>
                                <Text style={styles.candidateBalance}>
                                  Bal: ₦{formatCurrency(pBal)}
                                </Text>
                              </View>
                              <Ionicons
                                name={isSelected ? "radio-button-on" : "radio-button-off"}
                                size={20}
                                color={isSelected ? TEAL : "#9CA3AF"}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : (
                      <View style={styles.emptyCard}>
                        <Text style={{ color: "#6B7280", fontSize: 13, textAlign: "center" }}>
                          No other active portfolios found to transfer funds into.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Tab 3 Content: Transfer to Bank Account Picker */}
                {activeTab === "bank" && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.inputLabel}>Select Saved Bank Account</Text>
                    {loadingPayouts ? (
                      <View style={{ paddingVertical: 20, alignItems: "center" }}>
                        <ActivityIndicator color={TEAL} size="small" />
                        <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 6 }}>Loading accounts...</Text>
                      </View>
                    ) : payoutAccounts.length > 0 ? (
                      <View style={{ gap: 10, marginTop: 8 }}>
                        {payoutAccounts.map((account) => {
                          const isSelected = selectedBankAccountId === account.id;
                          return (
                            <TouchableOpacity
                              key={account.id}
                              onPress={() => setSelectedBankAccountId(account.id)}
                              style={[styles.candidateCard, isSelected && styles.selectedCandidateCard]}
                            >
                              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: TEAL_LIGHT, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                                <MaterialCommunityIcons name="bank-outline" size={20} color={TEAL} />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.candidateName}>{account.accountName}</Text>
                                <Text style={styles.candidateBalance}>
                                  {account.bankName} • {account.accountNumber}
                                </Text>
                              </View>
                              <Ionicons
                                name={isSelected ? "radio-button-on" : "radio-button-off"}
                                size={20}
                                color={isSelected ? TEAL : "#9CA3AF"}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : (
                      <View style={styles.emptyCard}>
                        <Text style={{ color: "#6B7280", fontSize: 13, textAlign: "center" }}>
                          No saved bank accounts found. Please add a bank account in your profile settings.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Action Button */}
              <ThemedButton
                title="Proceed to Confirm"
                loading={isNavigating}
                disabled={!isValidAmount || isNavigating}
                onPress={handleSubmit}
                style={[
                  styles.submitBtn,
                  (!isValidAmount || isNavigating) && styles.submitBtnDisabled,
                ]}
              />
            </KeyboardAvoidingView>
        </View>
      </Modal>

      <ConfirmActionModal
        visible={showConfirmModal}
        title={confirmConfig.title}
        summaryRows={confirmConfig.summaryRows}
        onCancel={() => {
          setShowConfirmModal(false);
          setIsNavigating(false);
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
          onClose();
          confirmConfig.onConfirm();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 44 : 32,
    maxHeight: "85%",
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTabBtn: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: TEAL,
    fontWeight: "700",
  },
  amountBlock: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  amountBlockError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  errorMessageText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  amountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  quickFillBtn: {
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quickFillText: {
    fontSize: 10,
    fontWeight: "700",
    color: TEAL,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_DARK,
    height: 40,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL_LIGHT,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  candidateCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedCandidateCard: {
    borderColor: TEAL,
    backgroundColor: TEAL_LIGHT,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  candidateBalance: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  badge: {
    backgroundColor: TEAL,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  emptyCard: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtn: {
    backgroundColor: TEAL,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  submitBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});
