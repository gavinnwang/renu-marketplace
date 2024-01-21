import Svg, { Path } from "react-native-svg";
import Colors from "../../shared/constants/Colors";

export const VerifiedIcon = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke={Colors.northwesternPurple}
      className="w-[19px] h-[19px]"
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </Svg>
  );
};
