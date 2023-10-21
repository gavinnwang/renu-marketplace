import { View } from "react-native";

export default function PaginationDots(props: { data: string[], currentIndex: number }) {
  return (
    <View className="absolute bottom-5 flex flex-row w-full items-center justify-center">
      {props.data.map((_, i) => (
        <View key={i} className={`w-2 h-2 rounded-full mx-1 ${i === props.currentIndex ? "bg-purplePrimary" : "bg-gray-400"}`} />
      ))}
    </View>
  );
}
