import * as Tabs from "@radix-ui/react-tabs";
import { LoginForm } from "../../features/auth/components/LoginForm";
import { RegisterForm } from "../../features/auth/components/RegisterForm";
import { AuthLayout } from "../../shared/layouts/AuthLayout";

export function AuthPage() {
  return (
    <AuthLayout>
      <Tabs.Root defaultValue="login" className="tabs-root">
        <div className="auth-card-heading">
          <span className="auth-card-kicker">Your CrashLens workspace</span>
          <h2>Welcome to clearer debugging</h2>
          <p>Sign in or create an organization to start monitoring.</p>
        </div>
        <Tabs.List className="tabs-list" aria-label="Authentication mode">
          <Tabs.Trigger className="tabs-trigger" value="login">
            Login
          </Tabs.Trigger>
          <Tabs.Trigger className="tabs-trigger" value="register">
            Register
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="login">
          <LoginForm />
        </Tabs.Content>
        <Tabs.Content value="register">
          <RegisterForm />
        </Tabs.Content>
      </Tabs.Root>
    </AuthLayout>
  );
}
