export const dataToColorScale = (value: number, max: number, min: number) => {
  const rangeData = max - min;
  const rangeColor = 200;
  const minColor = 125 - rangeColor / 2;

  return `rgb(${minColor + rangeColor - (rangeColor / rangeData) * (value - min)}, 190, ${
    (rangeColor / rangeData) * (value - min) + minColor
  })`;
};

// rgb(92, 119, 124)
