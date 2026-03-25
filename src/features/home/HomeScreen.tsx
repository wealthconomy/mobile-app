import { StatusBar } from "expo-status-bar";
import {
  ArrowDownLeft,
  ArrowUpRight,
  LogOut,
  PieChart,
  TrendingUp,
} from "lucide-react-native";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-secondary text-lg">Welcome back,</Text>
            <Text className="text-primary text-3xl font-bold">
              {user?.name || "User"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="w-12 h-12 items-center justify-center bg-muted rounded-2xl"
          >
            <LogOut size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View className="bg-primary p-6 rounded-3xl shadow-xl shadow-primary/30 mb-8">
          <Text className="text-white/80 text-lg mb-2">Total Balance</Text>
          <Text className="text-white text-4xl font-bold mb-6">$12,850.40</Text>

          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <View className="bg-white/20 p-2 rounded-full mr-3">
                <ArrowDownLeft size={20} color="white" />
              </View>
              <View>
                <Text className="text-white/60 text-sm">Income</Text>
                <Text className="text-white font-bold">$4,250</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="bg-white/20 p-2 rounded-full mr-3">
                <ArrowUpRight size={20} color="white" />
              </View>
              <View>
                <Text className="text-white/60 text-sm">Expenses</Text>
                <Text className="text-white font-bold">$1,840</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-primary font-bold text-xl mb-4">
          Market Overview
        </Text>
        <View className="flex-row justify-between mb-8">
          <View className="bg-muted p-4 rounded-3xl items-center flex-1 mr-3 border border-border">
            <TrendingUp size={28} color="#0369a1" className="mb-2" />
            <Text className="text-secondary text-sm">Investment</Text>
            <Text className="text-primary font-bold">+12.5%</Text>
          </View>
          <View className="bg-muted p-4 rounded-3xl items-center flex-1 border border-border">
            <PieChart size={28} color="#0369a1" className="mb-2" />
            <Text className="text-secondary text-sm">Savings</Text>
            <Text className="text-primary font-bold">$8,400</Text>
          </View>
        </View>

        {/* Recent Activity Placeholder */}
        <View className="bg-muted p-6 rounded-3xl border border-dashed border-border items-center">
          <Text className="text-secondary italic">
            Recent transactions will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
