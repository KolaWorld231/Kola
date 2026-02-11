"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroWithMascotProps {
  userName?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export function HeroWithMascot({ userName }: HeroWithMascotProps) {
  return (
    <motion.section
      className="relative overflow-hidden py-20 lg:py-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-kola-cream via-kola-accent/20 to-kola-primary/10"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text */}
          <motion.div className="space-y-8" variants={itemVariants}>
            <div className="space-y-4">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-kola-deep leading-tight"
                variants={itemVariants}
              >
                The free, fun, and effective way to learn Liberian languages!
              </motion.h1>

              <motion.p
                className="text-xl text-kola-bronze leading-relaxed"
                variants={itemVariants}
              >
                Learning with Kola is fun, and{" "}
                <strong className="text-kola-accent">research shows that it works!</strong> With
                quick, bite-sized lessons, you&apos;ll earn points and unlock new levels while
                gaining real-world communication skills.
              </motion.p>
            </div>

            <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={itemVariants}>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-kola-primary hover:bg-opacity-80 text-white font-semibold transition-all"
                >
                  GET STARTED
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  I ALREADY HAVE AN ACCOUNT
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side - Mascot Video */}
          <motion.div className="flex items-center justify-center" variants={itemVariants}>
            <div className="relative w-full max-w-md">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-lg shadow-2xl"
                style={{
                  aspectRatio: "1/1",
                  objectFit: "cover",
                }}
              >
                <source src="/Assets%20for%20UI/Kola%20design%20assets/Kola%20mascot%201.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-8 -right-8 text-4xl"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🎓
              </motion.div>

              <motion.div
                className="absolute -bottom-8 -left-8 text-4xl"
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                ✨
              </motion.div>

              <motion.div
                className="absolute top-1/2 -right-16 text-3xl"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔥
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
