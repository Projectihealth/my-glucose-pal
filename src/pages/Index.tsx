import { Hero } from "@/components/Hero";
import { ChatInterface } from "@/components/ChatInterface";
import { GlucoseChart } from "@/components/GlucoseChart";
import { Dashboard } from "@/components/Dashboard";
import { Features } from "@/components/Features";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <GlucoseChart />
      <ChatInterface />
      <Dashboard />
    </div>
  );
};

export default Index;
