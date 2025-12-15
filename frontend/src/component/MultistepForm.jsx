import { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    avatar: null,
    otp: ""
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

 const handleOnSubmit = (e) => {
  e.preventDefault();
  console.log(formData);
};

  return (
    <>
      {step === 1 && (
        <StepOne data={formData} onChange={handleChange} next={next} />
      )}
      {step === 2 && (
        <StepTwo data={formData} onChange={handleChange} next={next} back={back} />
      )}
      {step === 3 && (
        <StepThree data={formData} onChange={handleChange} back={back} submit={handleOnSubmit} />
      )}
    </>
  );
}
