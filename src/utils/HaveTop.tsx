import Svg, { Path } from "react-native-svg";
import { Dimensions } from "react-native";
import React from "react";

const { width } = Dimensions.get("window");

export function WaveTop() {
  return (
    <Svg
      width={width}
      height={100} // alto de la onda
      viewBox={`0 0 ${width} 100`}
      style={{ position: "absolute", top: -1, left: 0 }}
    >
      {/* Comentario (ES): path que dibuja la onda blanca */}
    <Path
  d={`M0,40 
      C${width * 0.25},80 ${width * 0.75},0 ${width},40 
      L${width},100 L0,100 Z`}
  fill="#FFFFFF"
/>

    </Svg>
  );
}
