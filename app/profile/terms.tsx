import Header from "@/src/components/common/Header";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsAndConditionsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <Header title="Terms & Conditions" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-[#6B7280] text-[12px] font-semibold mb-6">
          Last Updated · June 1, 2026
        </Text>

        <SectionBlock num="01" title="Acceptance of Terms">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            By accessing or using Wealthconomy, you agree to be bound by these Terms and Conditions. These terms form a legally binding agreement between you and Wealthconomy. If you do not agree, please discontinue use of the platform.
          </Text>
        </SectionBlock>

        <SectionBlock num="02" title="Eligibility">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-2">
            To access our services, you must satisfy the following criteria:
          </Text>
          <BulletPoint text="Be at least 18 years old or possess lawful parental/guardian authorization." />
          <BulletPoint text="Provide accurate, current, and truthful information during account registration." />
          <BulletPoint text="Comply with all local and international laws and financial regulations." />
        </SectionBlock>

        <SectionBlock num="03" title="Account Registration">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-2">
            When you create an account with us, you acknowledge and agree that you are solely responsible for:
          </Text>
          <BulletPoint text="Maintaining the absolute confidentiality of your login credentials and security PINs." />
          <BulletPoint text="Ensuring all information provided is accurate and promptly updated." />
          <BulletPoint text="Notifying Wealthconomy support immediately of any suspected unauthorized access." />
        </SectionBlock>

        <SectionBlock num="04" title="Wealthconomy Services">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-3">
            Wealthconomy provides technological tools for financial growth, including savings products, investment opportunities, financial literacy resources, and social impact initiatives.
          </Text>
          <View className="bg-[#FEF2F2] border border-[#FEE2E2] p-3.5 rounded-xl">
            <Text className="text-[#DC2626] font-bold text-[12px] mb-1">
              ⚠️ WARNING / DISCLAIMER
            </Text>
            <Text className="text-[#B91C1C] text-[11px] leading-[17px]">
              Wealthconomy is a financial technology platform, not a licensed commercial bank. We custody user funds through licensed and regulated partner banks. We do not guarantee investment performance unless explicitly stated.
            </Text>
          </View>
        </SectionBlock>

        <SectionBlock num="05" title="Investments and Risk Disclosure">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-2">
            All investments carry risk. By using our services, you acknowledge that:
          </Text>
          <BulletPoint text="Investments carry inherent market and liquidity risks." />
          <BulletPoint text="Past performance is not a reliable indicator or guarantee of future returns." />
          <BulletPoint text="Market conditions can affect asset prices and yield outcomes." />
          <BulletPoint text="Wealthconomy does not guarantee investment profits or yield rates." />
          <Text className="text-[#4B5563] text-[12px] italic mt-2">
            We strongly encourage users to seek independent financial advice where appropriate before allocating funds.
          </Text>
        </SectionBlock>

        <SectionBlock num="06" title="User Responsibilities">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-2">
            You agree not to engage in prohibited platform activities, including:
          </Text>
          <BulletPoint text="Providing false, misleading, or fraudulent information during verification." />
          <BulletPoint text="Engaging in fraudulent activities, money laundering, or coordinated platform manipulation." />
          <BulletPoint text="Attempting unauthorized access to system databases or executing security exploits." />
          <BulletPoint text="Using the platform for any illegal purpose or violating financial sanctions." />
        </SectionBlock>

        <SectionBlock num="07" title="KYC and Compliance">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-2">
            To maintain security and comply with anti-money laundering regulations, Wealthconomy reserves the right to:
          </Text>
          <BulletPoint text="Verify user identities utilizing official governmental databases." />
          <BulletPoint text="Request additional identification documents, utility bills, or proof of income source." />
          <BulletPoint text="Suspend or restrict access to accounts undergoing regulatory and compliance reviews." />
          <BulletPoint text="Report suspicious transactions to relevant law enforcement and financial authorities." />
        </SectionBlock>

        <SectionBlock num="08" title="Fees and Charges">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            Applicable transactional and management fees will be disclosed to you prior to the execution of any transaction. Wealthconomy reserves the right to modify fees at any time, subject to reasonable advance notice as required by law.
          </Text>
        </SectionBlock>

        <SectionBlock num="09" title="Intellectual Property">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            All platform content, codebases, software designs, user interfaces, branding, logos, trademarks, and educational resources are the exclusive property of Wealthconomy and its licensors, protected by intellectual property laws.
          </Text>
        </SectionBlock>

        <SectionBlock num="10" title="Limitation of Liability">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-2">
            To the maximum extent permitted by applicable law, Wealthconomy shall not be held liable for:
          </Text>
          <BulletPoint text="Indirect, incidental, punitive, or consequential damages." />
          <BulletPoint text="Loss of profits, revenue, or investment capital resulting from market fluctuations." />
          <BulletPoint text="Platform service interruptions beyond our reasonable control (network failures, force majeure)." />
          <BulletPoint text="Losses resulting from user negligence in securing account credentials." />
        </SectionBlock>

        <SectionBlock num="11" title="Suspension and Termination">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-2">
            We reserve the right to suspend, freeze, or terminate your account and platform access if:
          </Text>
          <BulletPoint text="You violate these Terms and Conditions or our security policies." />
          <BulletPoint text="We suspect fraudulent, unauthorized, or illegal activities on your account." />
          <BulletPoint text="We are required to do so by court order or regulatory directive." />
        </SectionBlock>

        <SectionBlock num="12" title="Force Majeure">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            Wealthconomy shall not be liable for any delays, performance failures, or service interruptions resulting from acts of God, civil unrest, grid blackouts, telecommunication failures, government restrictions, or other occurrences beyond our reasonable control.
          </Text>
        </SectionBlock>

        <SectionBlock num="13" title="Dispute Resolution">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            Parties shall first attempt to resolve all disputes amicably through consultation and mediation. Where an amicable settlement cannot be reached, the dispute shall be referred to and resolved by arbitration in accordance with applicable arbitration laws.
          </Text>
        </SectionBlock>

        <SectionBlock num="14" title="Governing Law">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            These Terms and Conditions shall be governed by, construed, and enforced in accordance with the laws of the Federal Republic of Nigeria.
          </Text>
        </SectionBlock>

        <SectionBlock num="15" title="Amendments">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            We reserve the right to amend these Terms and Conditions at any time. Continued use of our platform and website following any updates constitutes your explicit acceptance of the revised Terms and Conditions.
          </Text>
        </SectionBlock>

        <SectionBlock num="16" title="Contact Information">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-3">
            For any questions, legal queries, or technical support regarding these Terms and Conditions, please contact us:
          </Text>
          <View className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Text className="text-[#1A1A1A] font-bold text-[13px] mr-1.5">
                Email Support:
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL("mailto:support@wealthconomy.org")}
                activeOpacity={0.7}
              >
                <Text className="text-[#155D5F] font-extrabold text-[13px]">
                  support@wealthconomy.org
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              <Text className="text-[#1A1A1A] font-bold text-[13px] mr-1.5">
                Official Website:
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://www.wealthconomy.org")}
                activeOpacity={0.7}
              >
                <Text className="text-[#155D5F] font-extrabold text-[13px]">
                  www.wealthconomy.org
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SectionBlock>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionBlock({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-2">
        <View className="bg-[#E6F4F4] px-2.5 py-1 rounded-lg mr-2.5">
          <Text className="text-[#155D5F] font-bold text-[12px]">{num}</Text>
        </View>
        <Text className="text-[#1A1A1A] font-extrabold text-[16px] flex-1">
          {title}
        </Text>
      </View>
      <View className="pl-1">{children}</View>
    </View>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View className="flex-row items-start mb-2 pr-2">
      <Text className="text-[#155D5F] font-bold text-[14px] mr-2">•</Text>
      <Text className="text-[#4B5563] text-[13px] leading-[19px] flex-1">
        {text}
      </Text>
    </View>
  );
}
