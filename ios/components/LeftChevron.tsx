import Svg, { Path } from "react-native-svg";
import Colors from "../../shared/constants/Colors";

export default function LeftChevron() {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke={Colors.blackPrimary}
      className="w-6 h-6"
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </Svg>
  );
}
