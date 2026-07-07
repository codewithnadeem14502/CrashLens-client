import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiRefreshCw, FiShield } from "react-icons/fi";
import { registerOrganization } from "../api/authService";
import { getApiError } from "../../../shared/api/errors";
import { useAuth } from "../../../shared/auth/useAuth";
import { useToast } from "../../../shared/components/useToast";
import { FormField } from "../../../shared/ui/FormField";
import { PasswordField } from "../../../shared/ui/PasswordField";

const initialRegister = {
  organizationName: "",
  name: "",
  email: "",
  password: "",
};

export function RegisterForm() {
  const [form, setForm] = useState(initialRegister);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { persistSession } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = await registerOrganization(form);
      persistSession(payload);
      notify({
        title: "Organization created",
        description: "Admin session saved. You can now add members.",
        tone: "success",
      });
      navigate("/workspace/projects");
    } catch (error) {
      notify({
        title: "Registration failed",
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
        label="Organization name"
        value={form.organizationName}
        onChange={update("organizationName")}
        placeholder="Organization name"
        required
      />
      <FormField
        label="Admin name"
        value={form.name}
        onChange={update("name")}
        placeholder="Admin name"
        required
      />
      <FormField
        label="Admin email"
        type="email"
        value={form.email}
        onChange={update("email")}
        placeholder="admin@company.com"
        required
      />
      <PasswordField
        label="Admin password"
        value={form.password}
        onChange={update("password")}
        placeholder="At least 8 characters"
        required
      />
      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <FiRefreshCw className="spin" /> : <FiShield />}
        Create workspace
        <FiArrowRight />
      </button>
    </form>
  );
}
