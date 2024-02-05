import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";
import Colors from "../../shared/constants/Colors";

export const OptionIcon = () => {
  const colorScheme = useColorScheme();
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={
        colorScheme === "dark" ? Colors.whitePrimary : Colors.blackPrimary
      }
      className="w-6 h-6"
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </Svg>
  );
};
