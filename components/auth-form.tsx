

interface FormType {
  formType: "sign-in" | "sign-up";
}

const AuthForm = ({ formType }: FormType) => {
  return (
    <div className=""> Auth form - {formType}</div>
  )
}

export { AuthForm };