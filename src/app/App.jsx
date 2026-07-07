import { AppProviders } from "./providers/AppProviders";
import { AppRoutes } from "../routes/AppRoutes";
import "../styles/app.css";

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
