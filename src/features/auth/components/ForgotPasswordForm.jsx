import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck, FiRefreshCw } from "react-icons/fi";
import { updatePassword } from "../api/authService";
import { getApiError } from "../../../shared/api/errors";
import { useToast } from "../../../shared/components/useToast";
import { FormField } from "../../../shared/ui/FormField";
import { PasswordField } from "../../../shared/ui/PasswordField";

const initialForm = {
  email: "",
  newPassword: "",
  confirmPassword: "",
};

export function ForgotPasswordForm() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useToast();
  const navigate = useNavigate();

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      notify({
        title: "Passwords don't match",
        description: "Re-enter the new password in both fields.",
        tone: "danger",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword({
        email: form.email,
        newPassword: form.newPassword,
      });
      notify({
        title: "Password updated",
        description: "Sign in with your new password.",
        tone: "success",
      });
      navigate("/auth");
    } catch (error) {
      notify({
        title: "Couldn't update password",
        description: getApiError(error),
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField
        label="Email"
        type="email"
        value={form.email}
        onChange={update("email")}
        placeholder="admin@company.com"
        required
      />
      <PasswordField
        label="New password"
        value={form.newPassword}
        onChange={update("newPassword")}
        placeholder="At least 8 characters"
        required
      />
      <PasswordField
        label="Confirm new password"
        value={form.confirmPassword}
        onChange={update("confirmPassword")}
        placeholder="Re-enter new password"
        required
      />
      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <FiRefreshCw className="spin" /> : <FiCheck />}
        Update password
        <FiArrowRight />
      </button>
    </form>
  );
}
