import Header from "@/src/components/common/Header";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <Header title="Privacy Policy" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-[#6B7280] text-[12px] font-semibold mb-6">
          Last Updated · June 1, 2026
        </Text>

        <SectionBlock num="01" title="Our Commitment to Security">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            At Wealthconomy, the security of our users' information, funds, and transactions is a top priority. We are committed to maintaining robust security measures designed to protect against unauthorized access, misuse, loss, disclosure, alteration, and destruction of data.
          </Text>
        </SectionBlock>

        <SectionBlock num="02" title="How We Protect Your Information">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-3">
            We employ multiple defensive layers and strict architectural patterns to secure our platform:
          </Text>

          <SubSection title="1. Data Encryption">
            We utilize industry-standard encryption technologies to protect sensitive information during transmission and storage. Information exchanged between users and our platform is secured using encrypted communication protocols.
          </SubSection>

          <SubSection title="2. Secure Infrastructure">
            Our systems are hosted within secure environments that implement multiple layers of protection, including firewalls, intrusion detection/prevention systems, network monitoring, access controls, and continuous security updates.
          </SubSection>

          <SubSection title="3. Access Management">
            Access to customer information is strictly restricted to authorized personnel who require such access for legitimate business purposes. Access rights are reviewed periodically and governed by internal security procedures.
          </SubSection>

          <SubSection title="4. Identity & KYC">
            To protect our users and comply with regulatory requirements, Wealthconomy conducts Know Your Customer (KYC) verification processes and may request additional information where necessary.
          </SubSection>

          <SubSection title="5. Fraud Monitoring">
            We maintain systems and processes designed to identify, monitor, investigate, and prevent suspicious or fraudulent activities. Transactions may be reviewed and flagged where unusual activity is detected.
          </SubSection>

          <SubSection title="6. Third-Party Standards">
            We work with licensed financial institutions, payment processors, and technology partners that maintain appropriate security, compliance, and regulatory standards.
          </SubSection>

          <SubSection title="7. Continuous Monitoring">
            Our systems are monitored to identify potential vulnerabilities, threats, and unauthorized activities. Security assessments and reviews are conducted periodically to strengthen our defenses.
          </SubSection>
        </SectionBlock>

        <SectionBlock num="03" title="User Security Responsibilities">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-2">
            Security is a joint responsibility. We encourage our users to maintain strong personal security hygiene:
          </Text>
          <BulletPoint text="Create strong and unique passwords for your account." />
          <BulletPoint text="Enable multi-factor authentication (2FA) where available." />
          <BulletPoint text="Protect login credentials, security PINs, and OTP codes." />
          <BulletPoint text="Avoid sharing account information or devices with third parties." />
          <BulletPoint text="Notify Wealthconomy immediately of any suspected unauthorized access." />
          <BulletPoint text="Verify the authenticity of all communications before responding to requests for personal information." />
        </SectionBlock>

        <SectionBlock num="04" title="Security Disclaimer">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            While Wealthconomy employs reasonable and industry-accepted security measures, no electronic transmission, storage system, or internet-based service can be guaranteed to be completely secure. Users acknowledge and accept the inherent risks associated with digital communications and online transactions.
          </Text>
        </SectionBlock>

        <SectionBlock num="05" title="Reporting Security Concerns">
          <Text className="text-[#4B5563] text-[13px] leading-[20px] mb-3">
            If you believe your account has been compromised or you discover a potential security vulnerability, please contact us immediately through our official support channels:
          </Text>
          <View className="bg-[#FEF2F2] p-4 rounded-xl border border-[#FEE2E2]">
            <Text className="text-[#DC2626] font-bold text-[12px] mb-1">
              Security Response Team
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:security@wealthconomy.org")}
              activeOpacity={0.7}
            >
              <Text className="text-[#991B1B] font-extrabold text-[14px]">
                security@wealthconomy.org
              </Text>
            </TouchableOpacity>
          </View>
        </SectionBlock>

        <SectionBlock num="06" title="Updates to this Security Policy">
          <Text className="text-[#4B5563] text-[13px] leading-[20px]">
            We may update this Security Policy periodically to reflect changes in technology, regulatory requirements, or business operations. Updated versions will be published on our website and platform.
          </Text>
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

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
      <Text className="text-[#1A1A1A] font-bold text-[13px] mb-1">
        {title}
      </Text>
      <Text className="text-[#4B5563] text-[12px] leading-[18px]">
        {children}
      </Text>
    </View>
  );
}
