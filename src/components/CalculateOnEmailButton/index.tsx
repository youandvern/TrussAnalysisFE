import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grow,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { TransitionProps } from "@mui/material/transitions";
import React, { useState } from "react";
import { CheckboxElement, FieldValues, FormContainer, TextFieldElement } from "react-hook-form-mui";
import { API_URL } from "../FetchGeometry";
import { emailConfirmed, incrementCalculationRun, userNeedsToSaveEmail } from "./userLogic";

const defaultValues = {
  email: "",
  firstName: "",
  lastName: "",
};

async function apiSaveEmail(data: FieldValues): Promise<string> {
  const response = await fetch(`${API_URL}/api/truss-analysis/email/`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return Promise.reject(`Failed to save email: ${response.status} - ${response.statusText}`);
  }
}

const SuccessType = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  padding: "1em",
  textAlign: "center",
}));

type SubmitStatusT = "success" | "pending" | "failed" | "initial";

const shouldRenderPlaceholder = (status: SubmitStatusT) =>
  status === "success" || status === "pending";

const PlaceHolder = (status: SubmitStatusT) => {
  return status === "success" ? (
    <SuccessType>Success! Enjoy unlimited truss analysis calculations!</SuccessType>
  ) : (
    <Box display={"flex"} justifyContent="center" alignItems="center" marginY={"5rem"}>
      <CircularProgress />
    </Box>
  );
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Grow ref={ref} {...props} />;
});

const privacyPolicyLink = (
  <a
    href="https://www.termsfeed.com/live/25011e35-e02b-44bf-ae6a-069bea029eb0"
    target="_blank"
    rel="noopener noreferrer"
  >
    Privacy Policy
  </a>
);

const PrivacyStatement = () => (
  <span>
    I have read and agree to the {privacyPolicyLink}. I also agree that in no event will the website
    owner or affiliates be held liable for any damages resulting from using the website. I take
    responsibility for confirming any calculations that this website provides.
  </span>
);

type PropsT = {
  updateForces: () => void;
  filled?: boolean;
};

export default function CalculateOnEmailButton({ updateForces, filled }: PropsT) {
  const [openAlert, setOpenAlert] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatusT>("initial");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCalculate = () => {
    const requireEmailSubmission = userNeedsToSaveEmail();
    incrementCalculationRun();
    if (requireEmailSubmission) {
      setErrorMessage("");
      setOpenAlert(true);
    } else {
      updateForces();
    }
  };

  // const handleClickOpen = () => {
  //   setOpenAlert(true);
  //   updateForces();
  // };

  const handleSubmitEmail = (data: FieldValues) => {
    setSubmitStatus("pending");
    apiSaveEmail(data)
      .then(() => {
        setErrorMessage("");
        setSubmitStatus("success");
        updateForces();
        emailConfirmed();
        setTimeout(() => {
          handleClose();
          setTimeout(() => {
            setSubmitStatus("initial");
          }, 100);
        }, 3000);
      })
      .catch((err) => {
        setSubmitStatus("failed");
        setErrorMessage(`${err}`);
      });
  };

  const handleClose = () => {
    setOpenAlert(false);
  };

  return (
    <>
      <Dialog
        open={openAlert}
        onClose={handleClose}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Unlock Unlimited Free Calculations!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Please enter your name and email address to unlock unlimited free calculations. <br />
            <br />
            At Encomp, we take your personal information very seriously. We will never sell or give
            away your email address to third parties. We may occasionally send you emails about
            relevant new features and tools, but we promise to keep these communications to a
            minimum. Your privacy is important to us, and we appreciate your trust in us.
          </DialogContentText>
          <br />
          <Typography color={(theme) => theme.palette.error.dark}>{errorMessage}</Typography>
          {shouldRenderPlaceholder(submitStatus) ? (
            PlaceHolder(submitStatus)
          ) : (
            <FormContainer defaultValues={defaultValues} onSuccess={handleSubmitEmail}>
              <Stack spacing={2}>
                <TextFieldElement required type="text" name="firstName" label="First Name" />
                <TextFieldElement required type="text" name="lastName" label="Last Name" />
                <TextFieldElement required type="email" name="email" label="Email Address" />
                <CheckboxElement required name="confirmedPrivacy" label={PrivacyStatement()} />
                <Stack direction="row" justifyContent="end" spacing={2}>
                  <Button type="button" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    Submit
                  </Button>
                </Stack>
              </Stack>
            </FormContainer>
          )}
        </DialogContent>
      </Dialog>
      <Button
        variant={filled ? "contained" : "outlined"}
        fullWidth
        color="primary"
        onClick={handleCalculate}
      >
        Calculate Forces
      </Button>
    </>
  );
}
