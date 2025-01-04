export const dataToColorScale = (value: number, max: number, min: number) => {
  const rangeData = max - min;
  const rangeColor = 200;
  const minColor = 125 - rangeColor / 2;

  return `rgb(${minColor + rangeColor - (rangeColor / rangeData) * (value - min)}, 190, ${
    (rangeColor / rangeData) * (value - min) + minColor
  })`;
};

export const getColorFromId = (id: number): string => {
  const colors = [
    "#004AAD",
    "#AD00A1",
    "#00AD0D",
    "#AD6300",
    "#5A00FF",
    "#FF0026",
    "#A5FF00",
    "#00FFD9",
  ];
  // Round and wrap the id to ensure it's within valid bounds
  const i = Math.round(Math.abs(id)) % colors.length;

  return colors[i];
};

// rgb(92, 119, 124)
