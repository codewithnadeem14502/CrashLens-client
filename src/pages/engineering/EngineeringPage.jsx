import { useAuth } from "../../shared/auth/useAuth";
import { WorkspaceLayout } from "../../shared/layouts/WorkspaceLayout";
import { IntroSection } from "../../features/engineering/components/IntroSection";
import { FeatureOverview } from "../../features/engineering/components/FeatureOverview";
import { WorkflowDiagram } from "../../features/engineering/components/WorkflowDiagram";
import { PackagesSection } from "../../features/engineering/components/PackagesSection";
import { TechStackSection } from "../../features/engineering/components/TechStackSection";
import { CodeSampleSection } from "../../features/engineering/components/CodeSampleSection";

// Public reference page - deliberately not behind ProtectedRoute. It documents
// the product for engineers and doesn't read or write any account data, so it
// doesn't need a session.
export function EngineeringPage() {
  const { signOut } = useAuth();

  return (
    <WorkspaceLayout onSignOut={signOut}>
      <main className="engineering-page">
        <header className="issues-header">
          <div>
            <p className="eyebrow">Engineering</p>
            <h1>How CrashLens works</h1>
            <p className="muted">
              Features, the workflow, the stack, and how to send us your first
              error.
            </p>
          </div>
        </header>

        <IntroSection />
        <FeatureOverview />
        <WorkflowDiagram />
        <PackagesSection />
        <TechStackSection />
        <CodeSampleSection />
      </main>
    </WorkspaceLayout>
  );
}

export default EngineeringPage;
