import { useEffect } from "react";
import { Arrow, Circle, Label, Layer, Line, Rect, Stage, Tag, Text } from "react-konva";
import "./style.css";

import { GLOBAL_THEME } from "../../App";
import { MemberForcesSummary } from "../../Types/ApiForces";
import { Members, Nodes } from "../../Types/ApiGeometry";
import { dataToColorScale } from "../Utilities/DataToColorscale";

// force the truss to start at (0, 0)
function getPositionCorrectedNodes(nodes: Nodes): Nodes {
  const [minX, minY] = Object.values(nodes).reduce(
    (prev, cur) => [Math.min(prev[0], cur.x), Math.min(prev[1], cur.y)],
    [nodes["0"].x, nodes["0"].y]
  );

  const xCorrection = 0 - minX;
  const yCorrection = 0 - minY;

  return Object.keys(nodes).reduce((acc, key) => {
    const originalNode = nodes[key];

    const correctedX = originalNode.x + xCorrection;
    const correctedY = originalNode.y + yCorrection;

    acc[key] = { ...originalNode, x: correctedX, y: correctedY };

    return acc;
  }, {} as Nodes);
}

export interface GeometryProps {
  trussHeight: number;
  trussWidth: number;
  nodes: Nodes;
  members: Members;
  frameHeight: number;
  frameWidth: number;
  showNodeLabels: boolean;
  showMemberLabels: boolean;
  showForceArrows: boolean;
  showAxes?: boolean;
  nodeForces?: number[][];
  memberForcesSummary?: MemberForcesSummary;
  keySeed?: string;
  onRender?: () => void;
}

// Graph canvas to display truss
export default function TrussGraph({
  trussHeight,
  trussWidth,
  nodes,
  members,
  frameHeight,
  frameWidth,
  showNodeLabels,
  showMemberLabels,
  showForceArrows,
  showAxes = true,
  nodeForces,
  memberForcesSummary,
  keySeed = "0",
  onRender,
}: GeometryProps) {
  const correctedNodes = getPositionCorrectedNodes(nodes);

  const nodeSize = Math.max(trussHeight * 3, trussWidth) / 100;
  const border = nodeSize * 5;
  const borderBot = nodeSize * 6;
  const sceneHeight = trussHeight + border + borderBot;
  const sceneWidth = trussWidth + 2 * border;
  const fscale = Math.min(frameHeight / sceneHeight, frameWidth / sceneWidth);
  const nodeSizeScaled = nodeSize * fscale;

  const forceArrows = (xp: number, yp: number, fx: number, fy: number, aSize: number) => {
    const xdir = fx < 0 ? -1 : 1;
    const ydir = fy < 0 ? -1 : 1;
    return (
      <>
        {fx !== 0 && (
          <Arrow
            key={`${keySeed}-fAx-${xp},${yp}`}
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
            key={`${keySeed}-fAy-${xp},${yp}`}
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
    let mid = (max + min) / 2;
    mid = Math.abs(mid) < 0.01 && Math.abs(mid) < Math.abs(max) / 100 ? 0 : mid;
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
          key={`${keySeed}-pin1-${xp},${yp}`}
          points={[xp - 3 * pSize, -1 * yp + 3 * pSize, xp + 3 * pSize, -1 * yp + 3 * pSize]}
          stroke={GLOBAL_THEME.palette.secondary.main}
          strokeWidth={pSize}
          fillAfterStrokeEnabled
        />
        <Line
          key={`${keySeed}-pin2-${xp},${yp}`}
          points={[
            xp - pLength * pSize,
            -1 * yp + pHeight * pLength * pSize,
            xp,
            -1 * yp,
            xp + pLength * pSize,
            -1 * yp + pHeight * pLength * pSize,
          ]}
          stroke={GLOBAL_THEME.palette.secondary.main}
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
          key={`${keySeed}-roll1-${xp},${yp}`}
          points={[xp - 3 * rSize, -1 * yp + 3 * rSize, xp + 3 * rSize, -1 * yp + 3 * rSize]}
          stroke={GLOBAL_THEME.palette.secondary.main}
          strokeWidth={rSize}
          fillAfterStrokeEnabled
        />
        <Circle
          key={`${keySeed}-roll2-${xp},${yp}`}
          x={xp}
          y={-1 * yp + rSize}
          radius={rSize * 1.25}
          stroke={GLOBAL_THEME.palette.secondary.main}
          strokeWidth={rSize}
        />
      </>
    );
  };

  const yRollerMarker = (xp: number, yp: number, rSize: number) => {
    return (
      <>
        <Line
          key={`${keySeed}-yroll1-${xp},${yp}`}
          points={[xp + 3 * rSize, -1 * yp - 3 * rSize, xp + 3 * rSize, -1 * yp + 3 * rSize]}
          stroke={GLOBAL_THEME.palette.secondary.main}
          strokeWidth={rSize}
          fillAfterStrokeEnabled
        />
        <Circle
          key={`${keySeed}-yroll2-${xp},${yp}`}
          x={xp + rSize}
          y={-1 * yp}
          radius={rSize * 1.25}
          stroke={GLOBAL_THEME.palette.secondary.main}
          strokeWidth={rSize}
        />
      </>
    );
  };

  const nodeLabel = (x: number, y: number, i: string, offSet: number) => {
    const yOffset = y === 0 && !(x === 0 || x === trussWidth * fscale) ? offSet * -1 : offSet * 4;
    return (
      <Text
        x={x - offSet / 2 - offSet * (i.length - 1)}
        y={y - yOffset}
        text={i}
        fontSize={offSet * 3}
        key={`${keySeed}-nLabel-${x},${y}`}
      />
    );
  };

  const memberLabel = (x1: number, y1: number, x2: number, y2: number, i: string, size: number) => {
    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;
    return (
      <Label x={x - 0.75 * size * i.length} y={y - size} opacity={1.0} key={`mLabel-${i}`}>
        <Tag fill="white" cornerRadius={size} key={`mLabelg-${i}`} />
        <Text
          text={i}
          fontSize={size * 2}
          fill={GLOBAL_THEME.palette.primary.main}
          padding={size / 4}
          key={`${keySeed}-mLabelx-${i}`}
        />
      </Label>
    );
  };

  useEffect(() => {
    if (onRender) onRender();
  }, [onRender]);

  return (
    <Stage width={frameWidth} height={frameHeight} x={(frameWidth - sceneWidth * fscale) / 2}>
      <Layer x={border * fscale} y={frameHeight - borderBot * fscale}>
        {showAxes &&
          axes(0, frameHeight - 5 * nodeSizeScaled - border * fscale, 5 * nodeSizeScaled)}

        {Object.entries(members).map(([iMember, member]) => {
          const points = {
            x1: correctedNodes[member.start].x * fscale,
            y1: correctedNodes[member.start].y * fscale,
            x2: correctedNodes[member.end].x * fscale,
            y2: correctedNodes[member.end].y * fscale,
          };
          return (
            <>
              <Line
                key={`${keySeed}-member-${iMember}`}
                points={[points.x1, -1 * points.y1, points.x2, -1 * points.y2]}
                stroke={
                  member.color && memberForcesSummary
                    ? member.color
                    : GLOBAL_THEME.palette.primary.main
                }
                strokeWidth={nodeSizeScaled}
                fill={"red"}
                width={nodeSizeScaled}
                fillEnabled
                fillAfterStrokeEnabled
              />
              {showMemberLabels &&
                memberLabel(points.x1, -points.y1, points.x2, -points.y2, iMember, nodeSizeScaled)}
            </>
          );
        })}

        {Object.entries(correctedNodes).map(([iNode, node]) => {
          const thisNodeForce = showForceArrows && nodeForces && nodeForces[+iNode];
          const nodeX = node.x * fscale;
          const nodeY = node.y * fscale;
          return (
            <>
              {node.fixity === "pin" &&
                pinMarker(nodeX, nodeY - nodeSizeScaled / 2, nodeSizeScaled)}
              {node.fixity === "roller" &&
                rollerMarker(nodeX, nodeY - nodeSizeScaled, nodeSizeScaled)}
              {node.fixity === "yroller" &&
                yRollerMarker(nodeX + nodeSizeScaled, nodeY, nodeSizeScaled)}
              {thisNodeForce &&
                forceArrows(nodeX, -nodeY, thisNodeForce[1], thisNodeForce[2], 4 * nodeSizeScaled)}
              <Circle
                x={nodeX}
                y={-nodeY}
                fill="black"
                radius={nodeSizeScaled}
                key={`${keySeed}-node-${iNode}`}
              />
              {showNodeLabels && nodeLabel(nodeX, -1 * nodeY, iNode, nodeSizeScaled)}
            </>
          );
        })}

        {memberForcesSummary &&
          forceScale(
            trussWidth * fscale + 1 * nodeSizeScaled,
            -(0.8 * frameHeight),
            0.6 * frameHeight,
            memberForcesSummary.min,
            memberForcesSummary.max
          )}
      </Layer>
    </Stage>
  );
}
