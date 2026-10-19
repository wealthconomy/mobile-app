import os

file_path = r'c:\Users\efemi\OneDrive\Desktop\work\wealthconomy\mobile-app\app\support\index.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace import
content = content.replace('  Text,\n  TouchableOpacity,', '  TouchableOpacity,')
content = content.replace('import { SafeAreaView } from "react-native-safe-area-context";', 'import { SafeAreaView } from "react-native-safe-area-context";\nimport { Text } from "@/src/components/common/ui/Text";')

# Replace texts
content = content.replace('<Text className="text-xl font-extrabold text-[#323232]">', '<Text variant="h2" className="font-kumbh-extrabold">')
content = content.replace('<Text className="text-lg font-extrabold text-[#323232] mb-4">', '<Text variant="h3" className="font-kumbh-extrabold mb-4">')
content = content.replace('<Text className="text-sm text-[#408688] font-semibold mb-5 leading-5">', '<Text variant="caption" className="text-[#408688] font-kumbh-semibold mb-5 leading-5">')
content = content.replace('<Text className="text-lg font-extrabold text-[#323232]">', '<Text variant="h3" className="font-kumbh-extrabold">')
content = content.replace('<Text className="text-[#155D5F] text-[13px] font-bold">', '<Text className="text-[#155D5F] text-[13px] font-kumbh-bold">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
