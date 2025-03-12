import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Shield, Upload, User, FileText, Briefcase, Car, GraduationCap, Heart } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DraggableCard from '@/components/ui/DraggableCard';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <User className="h-6 w-6 text-primary" />,
    title: "Personal Information",
    description: "Store and organize all your personal details in one secure location."
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-primary" />,
    title: "Educational Qualifications",
    description: "Track your academic history, degrees, certifications, and achievements."
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: "Medical Records",
    description: "Keep your medical history, prescriptions, and health information organized."
  },
  {
    icon: <Briefcase className="h-6 w-6 text-primary" />,
    title: "Employment History",
    description: "Document your career journey with detailed employment records."
  },
  {
    icon: <Car className="h-6 w-6 text-primary" />,
    title: "Vehicle Information",
    description: "Store details about your vehicles, including maintenance records."
  },
  {
    icon: <Upload className="h-6 w-6 text-primary" />,
    title: "Document Storage",
    description: "Upload and securely store important documents with easy access."
  },
];

const Home = () => {
  const [showCards, setShowCards] = useState(false);
  
  const demoCards = [
    { id: "personal", title: "Personal Information", content: "Name: Sanjay VVV\nAge: 16\nEmail: fresher@opal.com\nContact: (949) 564 1983" },
    { id: "education", title: "Education", content: "Bachelor of Minors\nComputer Science\nGraduation: 2032 (w/o supplie)\nGPA: 0.1/4.0" },
    { id: "medical", title: "Medical Records", content: "Blood Type: B-\nAllergies: Dust\nLast Checkup: January 16, 2005\nVaccinations: Up to date" },
    { id: "employment", title: "Employment", content: "Company: Lolan s Inc.\nPosition: Under Sanjay\nStart Date: tomorrow\nSalary: ₹69.420" },
    { id: "vehicle", title: "Vehicle Information", content: "Make: Tesla\nModel: Cybertruck\nYear: 1992\nLicense: KL47-6969\nLast Service: 11/03/2025" },
  ];

  // Calculate initial positions in a grid-like pattern
  const calculateInitialPositions = () => {
    const positions: Record<string, {x: number, y: number}> = {};
    const screenWidth = window.innerWidth;
    const isSmallScreen = screenWidth < 768;
    
    // For small screens, distribute cards around the top
    if (isSmallScreen) {
      const centerX = screenWidth / 2;
      
      demoCards.forEach((card, index) => {
        const angle = (index / demoCards.length) * Math.PI * 2;
        const radius = 150;
        const x = centerX + Math.cos(angle) * radius - 140;
        const y = 120 + Math.sin(angle) * radius;
        
        positions[card.id] = { x, y };
      });
    } else {
      // For larger screens, position cards on both sides
      // Left side cards
      positions["personal"] = { x: screenWidth * 0.05, y: 180 };
      positions["education"] = { x: screenWidth * 0.08, y: 340 };
      positions["medical"] = { x: screenWidth * 0.03, y: 500 };
      
      // Right side cards
      positions["employment"] = { x: screenWidth * 0.85, y: 220 };
      positions["vehicle"] = { x: screenWidth * 0.82, y: 380 };
    }
    
    return positions;
  };

  const [cardPositions] = useState(calculateInitialPositions());

  useEffect(() => {
    // Show cards after a delay
    const timer = setTimeout(() => {
      setShowCards(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-28 md:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20 -z-10" />

          {/* Interactive Demo Area - Draggable Cards */}
          <div className="absolute top-0 left-0 w-full h-full overflow-visible" style={{ zIndex: 20 }}>
            {showCards && demoCards.map((card) => (
              <div key={card.id} className="pointer-events-auto">
                <DraggableCard
                  id={card.id}
                  title={card.title}
                  initialPosition={cardPositions[card.id]}
                  className="w-[260px] bg-card/60 backdrop-blur-sm animate-fade-in shadow-xl border-primary/5 border"
                >
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {card.content}
                  </pre>
                </DraggableCard>
              </div>
            ))}
          </div>

          <div className="container mx-auto px-4 relative pt-10 pointer-events-auto">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold tracking-tight relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ zIndex: 30 }}
              >
                Your Personal Information,
                <span className="block text-primary"> Organized & Secure</span>
              </motion.h1>
              <motion.p 
                className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ zIndex: 10 }}
              >
                Fresherman provides a secure, intuitive system to organize all your personal information,
                documents, and records in one place with seamless access and control.
              </motion.p>
              <motion.div 
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/features">Learn More</Link>
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center z-30">
            <p className="text-muted-foreground text-sm bg-background/70 backdrop-blur-sm inline-block px-6 py-3 rounded-full shadow-sm border border-border/30">
              <span className="animate-pulse text-primary">✨</span> Grab and drag these floating information cards <span className="animate-pulse text-primary">✨</span>
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need in One Place
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive platform offers all the tools necessary to securely manage your personal information.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-border/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Your Security is Our Priority
                </h2>
                <p className="text-muted-foreground mb-6">
                  We implement industry-leading security measures to ensure your personal information remains private and protected at all times.
                </p>
                
                <ul className="space-y-4">
                  {[
                    "End-to-end encryption for all data",
                    "Multi-factor authentication support",
                    "Regular security audits and updates",
                    "Compliant with data protection regulations",
                    "Complete control over your information"
                  ].map((item, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <div className="mr-3 mt-1 bg-primary/20 rounded-full p-1">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-24 w-24 md:h-32 md:w-32 text-primary animate-pulse" />
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent opacity-50 rounded-full animate-floating" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Get Started with Fresherman?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust our platform for managing their personal information and documents.
              </p>
              <Button size="lg" className="px-8" asChild>
                <Link to="/signup">Create Your Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
