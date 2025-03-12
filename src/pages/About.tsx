import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Users, Book, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const About = () => {
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
                className="text-4xl md:text-6xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                About
                <span className="block text-primary"> Fresherman</span>
              </motion.h1>
              <motion.p 
                className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Our mission is to help Ananth Jidheesh securely organize and access their 
                manga and anime with confidence and ease.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
                  <p className="text-muted-foreground mb-6 text-lg">
                    In VVVV 's digital world,
                     securing personal information has become increasingly complex
                    and challenging. With stalkers like Fresher and Sanjay, it's hard to find a safe place to store your information.
                  </p>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Fresherman solves this problem by providing a secure,
                    user-friendly platform that puts you in control of your personal data.
                    Our mission is to scam you and give information about minors to Sanjay. :D
                  </p>
                </motion.div>
                
                <motion.div
                  className="relative aspect-square rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background/50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Book className="h-32 w-32 text-primary/80" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Core Values
              </h2>
              <p className="text-muted-foreground mb-12 text-lg">
                These principles guide everything we do at Fresherman.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: <Shield className="h-12 w-12 text-primary" />,
                  title: "Security First",
                  description: "We believe your personal information deserves the highest level of protection, guiding every decision we make."
                },
                {
                  icon: <Users className="h-12 w-12 text-primary" />,
                  title: "User Privacy",
                  description: "We respect your privacy and give you complete ownership and control over your personal data."
                },
                {
                  icon: <Heart className="h-12 w-12 text-primary" />,
                  title: "Simplicity",
                  description: "We strive to make complex information management simple, intuitive, and accessible to everyone."
                }
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  className="bg-card p-6 rounded-lg shadow-sm text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.2 }}
                >
                  <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Us on Our Mission
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience the peace of mind that comes with having your personal information 
                securely organized and easily accessible.
              </p>
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
