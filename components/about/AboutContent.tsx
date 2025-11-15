"use client";

import Link from "next/link";
import Image from "next/image";
import InfiniteMenu from "./InfiniteMenu";
import Waves from "./Waves";
import BlurText from "./BlurText";
import ScrollFloat from "./ScrollFloat";
import ShinyText from "./ShinyText";
import TrueFocus from "./TrueFocus";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const teamMembers = [
  {
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    link: "/about/team/jacob-jones",
    title: "Jacob Jones",
    description:
      "CEO - Leading Synkora's vision for AI-powered collaboration",
  },
  {
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    link: "/about/team/kristin-watson",
    title: "Kristin Watson",
    description: "Marketing - Driving growth and connecting teams worldwide",
  },
  {
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    link: "/about/team/darlene-robertson",
    title: "Darlene Robertson",
    description: "Engineer - Building the future of collaborative workspaces",
  },
  {
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    link: "/about/team/cameron-williamson",
    title: "Cameron Williamson",
    description: "Designer - Crafting intuitive experiences for modern teams",
  },
];

export default function AboutContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark" || theme === undefined;

  return (
    <>
      {/* Hero Section with Waves Background */}
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
        {/* Waves Background */}
        <Waves
          lineColor={isDark ? "#fff" : "#000"}
          backgroundColor={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-8 py-20">
          <TrueFocus
            sentence="About Us"
            manualMode={false}
            blurAmount={5}
            borderColor="#84cc16"
            glowColor="rgba(132, 204, 22, 0.6)"
            animationDuration={2}
            pauseBetweenAnimations={1}
          />
          <nav className={`${isDark ? 'text-white/80' : 'text-black/80'} text-sm md:text-base mt-4`}>
            <span>Home</span> / <span>About Us</span>
          </nav>
        </div>
      </section>

      <br />
      <br />
      <br />
      <br />

      {/* ✨ Main Content Section with Scroll Reveal Animation */}
      <motion.section
        className={`relative ${isDark ? 'bg-black' : 'bg-white'} py-20 px-8`}
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Synkora Team"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/20' : 'from-white/20'} to-transparent`}></div>
              </div>
            </div>

            {/* Right Column - Text */}
            <div className="space-y-6">
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-[#FF6B9D]' : 'text-[#d946ef]'}`}>
                About Us
              </p>
              <div className="text-4xl md:text-5xl font-bold">
                <ShinyText
                  text="We Always Make The Best"
                  disabled={false}
                  speed={3}
                  className=""
                  style={{
                    color: '#84cc16',
                    backgroundImage: 'linear-gradient(120deg, rgba(132, 204, 22, 0) 40%, rgba(132, 204, 22, 1) 50%, rgba(132, 204, 22, 0) 60%)',
                  }}
                />
              </div>
              <p className={`${isDark ? 'text-white/70' : 'text-black/70'} text-lg leading-relaxed`}>
                <span className="italic text-[#84cc16]">Synkora</span> is your team's visual command center with AI. We resolve
                problems associated with disconnected workflows by bringing task
                management, live dashboards, and whiteboard collaboration into
                one powerful workspace.
              </p>
              <p className={`${isDark ? 'text-white/60' : 'text-black/60'} text-base leading-relaxed`}>
                You need a unified space to brainstorm, plan, and visualize — but
                juggling tools slows progress and breaks flow. That's when
                <span className="italic text-[#84cc16]"> Synkora</span> comes in. We know how teams thrive, and we're here to
                help you achieve more with less effort and greater creativity.
              </p>
              <Link
                href="/contact"
                className={`inline-block mt-6 px-8 py-3 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} font-semibold rounded-lg hover:opacity-90 transition-colors`}
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Meet the Team Section */}
      <section className={`relative ${isDark ? 'bg-black' : 'bg-white'} py-20 px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center">
              <ShinyText
                text="Team Synkora"
                disabled={false}
                speed={3}
                className="text-4xl md:text-5xl font-bold"
                style={{
                  color: '#84cc16',
                  backgroundImage: 'linear-gradient(120deg, rgba(132, 204, 22, 0) 40%, rgba(132, 204, 22, 1) 50%, rgba(132, 204, 22, 0) 60%)',
                }}
              />
            </div>
            <p className={`${isDark ? 'text-white/60' : 'text-black/60'} text-lg max-w-2xl mx-auto mt-4`}>
              Meet the talented individuals driving innovation and excellence at
              <span className="italic text-[#84cc16]"> Synkora</span>
            </p>
          </div>

          {/* InfiniteMenu Container (Full Screen) */}
          <div className="relative h-screen w-full">
            <InfiniteMenu items={teamMembers} />
          </div>
        </div>
      </section>
    </>
  );
}
