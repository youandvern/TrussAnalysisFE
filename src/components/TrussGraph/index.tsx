import React from "react";
import { useState, useEffect } from "react";
import "./style.css";
import { Stage, Layer, Line, Circle, Text, Label, Tag } from "react-konva";
import ApiGeometry, { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";

interface GeometryProps {
  globalGeometry: ApiGeometryGlobal;
  trussGeometry: ApiGeometry;
  frameHeight: number;
  frameWidth: number;
  showNodeLabels: boolean;
  showMemberLabels: boolean;
}

// Graph canvas to display truss
export default function TrussGraph({
  globalGeometry,
  trussGeometry,
  frameHeight,
  frameWidth,
  showNodeLabels,
  showMemberLabels,
}: GeometryProps) {
  const trussHeight = globalGeometry.height;
  const trussWidth = globalGeometry.span;
  const nodeSize = Math.max(trussHeight * 3, trussWidth) / 100;
  const border = nodeSize * 4;
  const borderBot = nodeSize * 5;
  const sceneHeight = trussHeight + border + borderBot;
  const sceneWidth = trussWidth + 2 * border;
  const fscale = Math.min(frameHeight / sceneHeight, frameWidth / sceneWidth);

  const pinMarker = (xp: number, yp: number, pSize: number) => {
    const pLength = 1.5;
    const pHeight = 2;
    return (
      <>
        <Line
          points={[xp - 3 * pSize, -1 * yp + 3 * pSize, xp + 3 * pSize, -1 * yp + 3 * pSize]}
          stroke="orange"
          strokeWidth={pSize}
          fillAfterStrokeEnabled
        />
        <Line
          points={[
            xp - pLength * pSize,
            -1 * yp + pHeight * pLength * pSize,
            xp,
            -1 * yp,
            xp + pLength * pSize,
            -1 * yp + pHeight * pLength * pSize,
          ]}
          stroke="orange"
          strokeWidth={pSize * 1}
          fillAfterStrokeEnabled
        />
      </>
    );
  };

  const rollerMarker = (xp: number, yp: number, rSize: number) => {
    return (
      <>
        <Line
          points={[xp - 3 * rSize, -1 * yp + 3 * rSize, xp + 3 * rSize, -1 * yp + 3 * rSize]}
          stroke="orange"
          strokeWidth={rSize}
          fillAfterStrokeEnabled
        />
        <Circle
          x={xp}
          y={-1 * yp + rSize}
          radius={rSize * 1.25}
          stroke="orange"
          strokeWidth={rSize}
        />
      </>
    );
  };

  const nodeLabel = (x: number, y: number, i: string, offSet: number) => {
    const yOffset = y === 0 && !(x === 0 || x === trussWidth) ? offSet * -1 : offSet * 4;
    return (
      <Text
        x={x - offSet / 2 - offSet * (i.length - 1)}
        y={y - yOffset}
        text={i}
        fontSize={offSet * 3}
      />
    );
  };

  const memberLabel = (x1: number, y1: number, x2: number, y2: number, i: string, size: number) => {
    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;
    return (
      <Label x={x - 0.75 * size * i.length} y={y - size} opacity={1.0}>
        <Tag fill="white" cornerRadius={size} />
        <Text text={i} fontSize={size * 2} fill="blue" padding={size / 4} />
      </Label>
    );
  };

  return (
    <Stage width={frameWidth} height={frameHeight} x={(frameWidth - sceneWidth * fscale) / 2}>
      <Layer
        scale={{ x: fscale, y: fscale }}
        x={border * fscale}
        y={frameHeight - borderBot * fscale}
      >
        {Object.entries(trussGeometry.members).map(([iMember, member]) => {
          const points = {
            x1: trussGeometry.nodes[member.start].x,
            y1: trussGeometry.nodes[member.start].y,
            x2: trussGeometry.nodes[member.end].x,
            y2: trussGeometry.nodes[member.end].y,
          };
          return (
            <>
              <Line
                key={"member-" + iMember}
                points={[points.x1, -1 * points.y1, points.x2, -1 * points.y2]}
                stroke="blue"
                strokeWidth={nodeSize}
                fillAfterStrokeEnabled
              />
              {showMemberLabels &&
                memberLabel(points.x1, -points.y1, points.x2, -points.y2, iMember, nodeSize)}
            </>
          );
        })}

        {Object.entries(trussGeometry.nodes).map(([iNode, node]) => {
          return (
            <>
              {node.fixity === "pin" && pinMarker(node.x, node.y - nodeSize / 2, nodeSize)}
              {node.fixity === "roller" && rollerMarker(node.x, node.y - nodeSize, nodeSize)}
              <Circle x={node.x} y={-node.y} fill="black" radius={nodeSize} key={"node-" + iNode} />
              {showNodeLabels && nodeLabel(node.x, -1 * node.y, iNode, nodeSize)}
            </>
          );
        })}
      </Layer>
    </Stage>
  );
}
