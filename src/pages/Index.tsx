import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, ArrowRight, BarChart3, Upload, Calculator, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Leaf className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="hero-gradient text-primary-foreground">
        <div className="container py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Carbon Cruncher System</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
              Track your carbon.<br />Earn credits.<br />Save the planet.
            </h1>
            <p className="text-lg opacity-90 mb-8 max-w-lg">
              Upload bills for automatic OCR extraction or enter activities manually. One page, zero hassle, full impact.
            </p>
            <div className="flex gap-3">
              {user ? (
                <Link to="/calculator">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2 font-semibold">
                    Go to Calculator <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2 font-semibold">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="container py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Upload, title: "OCR Upload", desc: "Upload electricity bills, fuel receipts, and tickets. Values extracted automatically." },
            { icon: Calculator, title: "Manual Input", desc: "Enter food, waste, water, and custom activities with dropdown categories." },
            { icon: Award, title: "Carbon Credits", desc: "Stay under 480 kg/month and earn credits. 1 kg saved = 1 credit." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border card-shadow text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl eco-gradient mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
