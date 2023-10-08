import {
  Dimensions,
  Image as NativeImage,
  type DimensionValue,
} from "react-native";

export function Image(props: { url: string; percentageWidth: number }) {
  const dimensions = Dimensions.get("window");
  return (
    <NativeImage
      source={{ uri: props.url }}
      className="object-cover"
      style={{
        width: (dimensions.width * props.percentageWidth) as DimensionValue,
        height: (dimensions.width * props.percentageWidth * 4) / 3,
      }}
    />
  );
}
