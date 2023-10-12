import {
  Dimensions,
  Image as NativeImage,
  type DimensionValue,
} from "react-native";

export function Image({url, percentageWidth, percentageHeight = 4/3}: { url: string; percentageWidth: number; percentageHeight?: number  }) {
  const dimensions = Dimensions.get("window");
  return (
    <NativeImage
      source={{ uri: url }}
      className="object-cover"
      style={{
        width: (dimensions.width * percentageWidth) as DimensionValue,
        height: (dimensions.width * percentageWidth ) * percentageHeight as DimensionValue,
      }}
    />
  );
}
