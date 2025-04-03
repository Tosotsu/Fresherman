import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Shield, Upload, User, FileText, Briefcase, Car, GraduationCap, Heart, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const FeatureCard = ({ icon, title, description, delay = 0 }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-border/50"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const Features = () => {
  const mainFeatures = [
    {
      icon: <User className="h-6 w-6 text-primary" />,
      title: "Personal Information",
      description: "Securely store your personal details, contacts, and important identifiers in one organized location."
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      title: "Educational Records",
      description: "Keep track of your degrees, certifications, transcripts, and academic achievements with ease."
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Medical Information",
      description: "Organize your medical history, prescriptions, vaccinations, and health insurance details."
    },
    {
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      title: "Employment History",
      description: "Document your career path with detailed employment records, references, and accomplishments."
    },
    {
      icon: <Car className="h-6 w-6 text-primary" />,
      title: "Vehicle Information",
      description: "Store details about your vehicles, including registration, insurance, maintenance records, and more."
    },
    {
      icon: <Upload className="h-6 w-6 text-primary" />,
      title: "Document Storage",
      description: "Upload and organize important documents like passports, licenses, certificates, and contracts."
    },
  ];

  const securityFeatures = [
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "End-to-End Encryption",
      description: "All your data is encrypted before it leaves your device and can only be decrypted by you."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Strong Authentication",
      description: "Multi-factor authentication options to ensure only you can access your information."
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Data Ownership",
      description: "You retain complete ownership of your data with granular control over what's stored."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20 -z-10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Features & Benefits
              </motion.h1>
              <motion.p 
                className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Discover how Fresherman helps you organize, secure, and access all your personal information
                in one seamless platform.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fresherman organizes your personal data into intuitive categories for easy management and access.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainFeatures.map((feature, index) => (
                <FeatureCard 
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Security & Privacy</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your data security and privacy are our top priorities. Fresherman implements robust measures to keep your information safe.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {securityFeatures.map((feature, index) => (
                <FeatureCard 
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Workflow/Usage Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get started with Fresherman in just a few simple steps.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Create Account",
                    description: "Sign up and set up your secure account with strong authentication."
                  },
                  {
                    step: "02",
                    title: "Add Information",
                    description: "Input your personal information or upload documents to appropriate categories."
                  },
                  {
                    step: "03",
                    title: "Access Anywhere",
                    description: "Securely access your information when and where you need it."
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={item.step}
                    className="text-center p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Unique Selling Points */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                  Why Choose Fresherman?
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      title: "All-In-One Solution",
                      description: "No more juggling between different apps and systems for different types of information."
                    },
                    {
                      title: "User-Friendly Interface",
                      description: "Intuitive design that makes managing your information simple and efficient."
                    },
                    {
                      title: "Privacy by Design",
                      description: "Built from the ground up with privacy and security as core principles."
                    },
                    {
                      title: "Accessible Anywhere",
                      description: "Access your important information from any device with secure authentication."
                    }
                  ].map((point, index) => (
                    <motion.div 
                      key={point.title}
                      className="flex gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    >
                      <div className="mt-1 p-1 bg-primary/20 rounded-full h-fit">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">{point.title}</h3>
                        <p className="text-muted-foreground">{point.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                className="relative h-[400px] md:h-[500px] flex items-center justify-center bg-secondary/50 rounded-2xl overflow-hidden"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="relative z-10 p-8 text-center">
                  <div className="mb-6">
                    <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Personal Information Vault</h3>
                    <p className="text-muted-foreground">Your secure digital storage for all important information</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {["Documents", "Contacts", "Accounts", "Records"].map((item, i) => (
                      <motion.div 
                        key={item}
                        className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + (i * 0.1) }}
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Organize Your Personal Information?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get started with Fresherman today and take control of your personal data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">Learn More About Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Features;
