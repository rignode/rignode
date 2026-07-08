import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { WalletProvider } from "@/contexts/wallet";
import { Layout } from "./components/layout";
import { Home } from "./pages/home";
import { Dashboard } from "./pages/dashboard";
import { Nodes } from "./pages/nodes";
import { NodeDetail } from "./pages/node-detail";
import { Jobs } from "./pages/jobs";
import { Earnings } from "./pages/earnings";
import { Calculator } from "./pages/calculator";
import { About } from "./pages/about";
import { Architecture } from "./pages/architecture";
import { HowItWorks } from "./pages/how-it-works";
import { Thesis } from "./pages/thesis";
import { Vision } from "./pages/vision";
import { Network } from "./pages/network";
import { Whitepaper } from "./pages/whitepaper";
import { GpuMarket } from "./pages/gpu-market";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/nodes" component={Nodes} />
      <Route path="/nodes/:id" component={NodeDetail} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/earnings" component={Earnings} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/about" component={About} />
      <Route path="/architecture" component={Architecture} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/thesis" component={Thesis} />
      <Route path="/vision" component={Vision} />
      <Route path="/network" component={Network} />
      <Route path="/whitepaper" component={Whitepaper} />
      <Route path="/gpu-market" component={GpuMarket} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Layout>
                <Router />
              </Layout>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </WalletProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
