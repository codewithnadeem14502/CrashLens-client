import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { ForgotPasswordForm } from "../../features/auth/components/ForgotPasswordForm";
import { AuthLayout } from "../../shared/layouts/AuthLayout";

export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <div className="tabs-root">
        <p className="eyebrow">Reset password</p>
        <h2>Update your password</h2>
        <p className="muted">
          Enter the email on your account and choose a new password.
        </p>
        <ForgotPasswordForm />
        <Link className="text-button" to="/auth">
          <FiArrowLeft />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
