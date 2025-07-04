import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, MessageCircle, PlusCircle, Star, Lock, Rocket, MessageSquare } from 'lucide-react';
import BannerImg from '../assets/about/Banner.jpg';
import StoryImg from '../assets/about/2 nd image.jpg';
import FinalImg from '../assets/about/3 rd image.jpg';

const cardData = [
  {
    icon: <Users className="w-8 h-8 text-orange-500 mb-2" />,
    title: 'Join Groups',
    desc: 'Find and join groups that match your interests and passions.'
  },
  {
    icon: <Calendar className="w-8 h-8 text-orange-500 mb-2" />,
    title: 'Attend Events',
    desc: 'Participate in events, meetups, and activities both online and offline.'
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-orange-500 mb-2" />,
    title: 'Start Conversations',
    desc: 'Chat with like-minded people and build real connections.'
  },
  {
    icon: <PlusCircle className="w-8 h-8 text-orange-500 mb-2" />,
    title: 'Host & Create Communities',
    desc: 'Launch your own group or event and grow your community.'
  },
];

const whyData = [
  { icon: <Star className="w-5 h-5 text-orange-500 mr-2" />, text: 'Meaningful Connections' },
  { icon: <Lock className="w-5 h-5 text-orange-500 mr-2" />, text: 'Safe & Respectful Spaces' },
  { icon: <Rocket className="w-5 h-5 text-orange-500 mr-2" />, text: 'Tools to Help You Grow' },
  { icon: <MessageSquare className="w-5 h-5 text-orange-500 mr-2" />, text: 'Authentic, Real-Life Chats' },
];

const careersData = [
  {
    title: 'Community Manager',
    desc: 'Engage with users, grow local communities, and organize in-person events.',
  },
  {
    title: 'Frontend Developer',
    desc: 'Build engaging, responsive interfaces with React and Tailwind.',
  },
  {
    title: 'Content Strategist',
    desc: 'Create compelling stories and manage our blog and social channels.',
  },
  {
    title: 'Product Designer',
    desc: 'Design seamless user experiences with a focus on community-building.',
  },
];

const blogPosts = [
  {
    title: 'How Coffee Chat Started',
    desc: 'The story behind the movement and how it all began in a neighborhood café.',
  },
  {
    title: 'Top 5 Tips for Hosting Events',
    desc: 'Make your meetups more meaningful and successful with these expert tips.',
  },
  {
    title: 'Why Real Conversations Matter',
    desc: "In a world of scrolling, here's why face-to-face chats still win.",
  },
  {
    title: 'From Online to In-Person',
    desc: 'Bridging digital communities to real-world meetups.',
  },
];

export default function About() {
  return (
    <div className="bg-[#f8f5f1] min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={BannerImg}
            alt="Cafe background"
            className="w-full h-full object-cover object-center filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 py-20 w-full max-w-2xl mx-auto"
        >
          <h1
            className="font-serif text-4xl md:text-5xl font-bold mb-4"
            style={{ color: '#FFAB36', textShadow: '0 2px 16px #0008' }}
          >
            Real Conversations, Genuine Connections.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 font-light">
            Coffee Chat brings people together over shared interests—whether in person or online. Join a circle of warmth, curiosity, and conversation.
          </p>
          <Link to="/groups">
            <button className="bg-[#FFAB36] hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg text-lg transition-all duration-200">
              Explore Communities
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1"
          >
            <img
              src={StoryImg}
              alt="Diverse meetup"
              className="rounded-3xl shadow-lg w-full object-cover max-h-96"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif text-[#FFAB36]">
              Our Story
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Coffee Chat was born from a simple wish—to bring back meaningful conversation. We started in a cozy neighborhood café and dreamed of a community beyond digital feeds.
            </p>
            <p className="text-base text-gray-600">
              Today, we're a thriving global community. From book clubs to startup brainstorms, we're built on the belief that real connections begin with a single conversation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-[#f8f5f1]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-10 text-center font-serif text-[#FFAB36]"
          >
            How it Works
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {cardData.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-200"
              >
                {card.icon}
                <h3 className="text-xl font-semibold mb-2 text-gray-900 font-serif">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-base">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Coffee Chat */}
      <section className="py-20 bg-[#f3e7d8]" id="why-people-choose-us">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif text-[#FFAB36]"
          >
            Why People Choose Us
          </motion.h2>
          <ul className="space-y-4 text-lg md:text-xl text-gray-800 max-w-2xl mx-auto">
            {whyData.map((item, i) => (
              <motion.li
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center bg-white rounded-xl shadow p-4"
              >
                {item.icon}
                <span>{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="py-20 bg-[#f8f5f1]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-10 text-center font-serif text-[#FFAB36]"
          >
            Careers
          </motion.h2>
          <p className="text-base text-gray-700 mb-8 text-center">
            Join our team and help us shape the future of Coffee Chat.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {careersData.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col text-left hover:shadow-2xl transition-all duration-200"
              >
                <h3 className="text-xl font-semibold mb-2 text-[#FFAB36] font-serif">{job.title}</h3>
                <p className="text-gray-600 text-base">{job.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 bg-[#f3e7d8]">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif text-[#FFAB36]"
          >
            Blog
          </motion.h2>
          <p className="text-base text-gray-800 mb-8 text-center">
            Read our latest articles and insights on Coffee Chat.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-200"
              >
                <h3 className="text-xl font-semibold mb-2 text-[#FFAB36] font-serif">{post.title}</h3>
                <p className="text-gray-600 text-base">{post.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 font-serif text-[#FFAB36]"
          >
            Become Part of the Movement
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-gray-700 mb-8"
          >
            Coffee Chat isn't just a platform—it's a movement to bring real human connection into a digital world.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/groups">
              <button className="bg-[#FFAB36] hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg text-lg transition-all duration-200">
                Explore Groups
              </button>
            </Link>
            <Link to="/events/create">
              <button className="bg-white border-2 border-[#FFAB36] text-[#FFAB36] hover:bg-orange-50 font-semibold px-8 py-4 rounded-full shadow text-lg transition-all duration-200">
                Create an Event
              </button>
            </Link>
          </div>
          <img
            src={FinalImg}
            alt="Coffee Chat closing"
            className="mx-auto rounded-2xl shadow-lg w-full max-w-lg max-h-64 md:max-h-80 object-cover"
          />
        </div>
      </section>
    </div>
  );
}
