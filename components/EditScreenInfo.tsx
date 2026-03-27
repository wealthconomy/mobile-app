import { Text, View } from "react-native";

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View className="mx-[20px] items-center">
        <Text className="text-center text-base leading-6 text-[#323232]">
          Open up the code for this screen:
        </Text>

        <View className="my-[7px] rounded-sm bg-[rgba(0,0,0,0.05)] px-1">
          <Text className="text-center font-mono text-base leading-6 text-[#323232]">
            {path}
          </Text>
        </View>

        <Text className="text-center text-base leading-6 text-[#323232]">
          Change any of the text, save the file, and your app will automatically
          update.
        </Text>
      </View>
    </View>
  );
}
