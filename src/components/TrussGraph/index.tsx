import React from "react";
import { useState, useEffect } from "react";
import "./style.css";
import { Stage, Layer, Line, Circle, Text, Label, Tag, Arrow, Rect } from "react-konva";
import ApiGeometry, { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";
import { dataToColorScale } from "../Utilities/DataToColorscale";
import { MemberForcesSummary, NodeForceSimple, NodeForcesSimple } from "../Interfaces/ApiForces";

interface GeometryProps {
  globalGeometry: ApiGeometryGlobal;
  trussGeometry: ApiGeometry;
  frameHeight: number;
  frameWidth: number;
  showNodeLabels: boolean;
  showMemberLabels: boolean;
  showForceArrows: boolean;
  nodeForces?: NodeForcesSimple;
  memberForcesSummary?: MemberForcesSummary;
}

// Graph canvas to display truss
export default function TrussGraph({
  globalGeometry,
  trussGeometry,
  frameHeight,
  frameWidth,
  showNodeLabels,
  showMemberLabels,
  showForceArrows,
  nodeForces,
  memberForcesSummary,
}: GeometryProps) {
  const trussHeight = globalGeometry.height;
  const trussWidth = globalGeometry.span;
  const nodeSize = Math.max(trussHeight * 3, trussWidth) / 100;
  const border = nodeSize * 4;
  const borderBot = nodeSize * 5;
  const sceneHeight = trussHeight + border + borderBot;
  const sceneWidth = trussWidth + 2 * border;
  const fscale = Math.min(frameHeight / sceneHeight, frameWidth / sceneWidth);

  const forceArrows = (xp: number, yp: number, fx: number, fy: number, aSize: number) => {
    const xdir = fx < 0 ? -1 : 1;
    const ydir = fy < 0 ? -1 : 1;
    return (
      <>
        {fx !== 0 && (
          <Arrow
            points={[xp, yp, xp + xdir * aSize, yp]}
            stroke="red"
            strokeWidth={aSize / 7}
            pointerLength={aSize / 3}
            pointerWidth={aSize / 3}
            fillAfterStrokeEnabled
          />
        )}
        {fy !== 0 && (
          <Arrow
            points={[xp, yp, xp, yp + ydir * aSize]}
            stroke="red"
            strokeWidth={aSize / 7}
            pointerLength={aSize / 3}
            pointerWidth={aSize / 3}
            fillAfterStrokeEnabled
          />
        )}
      </>
    );
  };

  const forceScale = (xp: number, yp: number, length: number, min: number, max: number) => {
    const width = length / 15;
    const fontSize = 1.25 * width;
    const mid = (max + min) / 2;
    return (
      <>
        <Rect
          x={xp}
          y={yp}
          width={width}
          height={length}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: length }}
          fillLinearGradientColorStops={[
            0,
            dataToColorScale(1, 1, 0),
            1,
            dataToColorScale(0, 1, 0),
          ]}
        />
        <Text
          x={xp - (fontSize / 2) * max.toPrecision(3).length}
          y={yp - fontSize / 2}
          fontSize={fontSize}
          text={max.toPrecision(3)}
        />
        <Text
          x={xp - (fontSize / 2) * mid.toPrecision(3).length}
          y={yp - fontSize / 2 + length / 2}
          fontSize={fontSize}
          text={mid.toPrecision(3)}
        />
        <Text
          x={xp - (fontSize / 2) * min.toPrecision(3).length}
          y={yp - fontSize / 2 + length}
          fontSize={fontSize}
          text={min.toPrecision(3)}
        />
        <Circle x={xp + width / 2} y={yp} fill="black" radius={width / 3} />
        <Circle x={xp + width / 2} y={yp + length / 2} fill="black" radius={width / 3} />
        <Circle x={xp + width / 2} y={yp + length} fill="black" radius={width / 3} />
      </>
    );
  };

  const axes = (xp: number, yp: number, aSize: number) => {
    return (
      <>
        <Arrow
          points={[xp, -yp, xp + aSize, -yp]}
          stroke="black"
          strokeWidth={aSize / 10}
          pointerLength={aSize / 5}
          pointerWidth={aSize / 5}
          fillAfterStrokeEnabled
        />
        <Arrow
          points={[xp, -yp, xp, -yp + aSize]}
          stroke="black"
          strokeWidth={aSize / 10}
          pointerLength={aSize / 5}
          pointerWidth={aSize / 5}
          fillAfterStrokeEnabled
        />
        <Circle x={xp} y={-yp} radius={aSize / 10} fill="black" />
        <Text x={xp + aSize} y={-yp} text={"x"} fontSize={aSize / 2} />
        <Text x={xp + aSize / 5} y={-yp + aSize - aSize / 5} text={"y"} fontSize={aSize / 2} />
      </>
    );
  };

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
        {axes(0, frameHeight / fscale - 5 * nodeSize - border, 5 * nodeSize)}

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
                stroke={member.color && memberForcesSummary ? member.color : "blue"}
                strokeWidth={nodeSize}
                fill={"red"}
                width={nodeSize}
                fillEnabled
                fillAfterStrokeEnabled
              />
              {showMemberLabels &&
                memberLabel(points.x1, -points.y1, points.x2, -points.y2, iMember, nodeSize)}
            </>
          );
        })}

        {Object.entries(trussGeometry.nodes).map(([iNode, node]) => {
          const thisNodeForce = showForceArrows && nodeForces && nodeForces[iNode];
          return (
            <>
              {node.fixity === "pin" && pinMarker(node.x, node.y - nodeSize / 2, nodeSize)}
              {node.fixity === "roller" && rollerMarker(node.x, node.y - nodeSize, nodeSize)}
              {thisNodeForce &&
                forceArrows(node.x, -node.y, thisNodeForce.fx, -thisNodeForce.fy, 4 * nodeSize)}
              <Circle x={node.x} y={-node.y} fill="black" radius={nodeSize} key={"node-" + iNode} />
              {showNodeLabels && nodeLabel(node.x, -1 * node.y, iNode, nodeSize)}
            </>
          );
        })}
        {memberForcesSummary &&
          forceScale(
            trussWidth + 1 * nodeSize,
            -(0.8 * frameHeight) / fscale,
            (0.6 * frameHeight) / fscale,
            memberForcesSummary.min,
            memberForcesSummary.max
          )}
      </Layer>
    </Stage>
  );
}
