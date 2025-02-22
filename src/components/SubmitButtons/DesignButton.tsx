import { Button } from "@mui/material";

type PropsT = {
  onDesign: () => void;
  filled?: boolean;
};

export default function CalculateOnEmailButton({ onDesign, filled }: PropsT) {
  const handleSubmit = () => {
    onDesign();
  };

  return (
    <>
      <Button
        variant={filled ? "contained" : "outlined"}
        fullWidth
        color="primary"
        onClick={handleSubmit}
      >
        Design Members
      </Button>
    </>
  );
}
