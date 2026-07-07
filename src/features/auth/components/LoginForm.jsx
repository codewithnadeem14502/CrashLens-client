import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiLock, FiRefreshCw } from "react-icons/fi";
import { login } from "../api/authService";
import { getApiError } from "../../../shared/api/errors";
import { useAuth } from "../../../shared/auth/useAuth";
import { useToast } from "../../../shared/components/useToast";
import { FormField } from "../../../shared/ui/FormField";
import { PasswordField } from "../../../shared/ui/PasswordField";

const initialLogin = {
  email: "",
  password: "",
  organizationSlug: "",
};

export function LoginForm() {
  const [form, setForm] = useState(initialLogin);
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
      const payload = await login(form);
      persistSession(payload);
      notify({
        title: "Welcome back",
        description: "Your CrashLens workspace is ready.",
        tone: "success",
      });
      navigate("/workspace/projects");
    } catch (error) {
      notify({
        title: "Login failed",
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
        label="Password"
        value={form.password}
        onChange={update("password")}
        placeholder="Password"
        required
      />
      <FormField
        label="Organization slug"
        value={form.organizationSlug}
        onChange={update("organizationSlug")}
        placeholder="Organization-slug"
        required
      />
      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <FiRefreshCw className="spin" /> : <FiLock />}
        Sign in
        <FiArrowRight />
      </button>
    </form>
  );
}
