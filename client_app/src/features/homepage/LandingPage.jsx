import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaClock,
  FaChartLine,
  FaBars,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs for sections
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const contactRef = useRef(null);

  // Smooth scroll function
  const scrollToSection = (elementRef) => {
    setIsMenuOpen(false); // Close mobile menu if open
    elementRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white/95 backdrop-blur-sm shadow-md fixed w-full z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-40 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                <img src={"/LOGO_LOGO.jpeg"} alt="logo" className="w-30 h-16" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-primary transition-colors duration-300 font-medium"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection(aboutRef)}
                className="hover:text-primary transition-colors duration-300 font-medium"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection(servicesRef)}
                className="hover:text-primary transition-colors duration-300 font-medium"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection(contactRef)}
                className="hover:text-primary transition-colors duration-300 font-medium"
              >
                Contact
              </button>
              <Link
                to="/login"
                className="btn btn-outline bg-blue-950 text-white hover:scale-105 transition-transform duration-300"
              >
                Login
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 space-y-4 animate-fadeIn">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection(aboutRef)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection(servicesRef)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection(contactRef)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Contact
              </button>
              <Link
                to="/login"
                className="block btn btn-outline bg-blue-950 text-white w-full mb-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section with animations */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://media.istockphoto.com/id/1153659981/photo/young-boys-and-a-mother-at-a-philippine-neighborhood-store.jpg?s=2048x2048&w=is&k=20&c=XZ09hrG2IHgJpVNLOHsM0TaFxCMXNtUkWd2rs4PAqv8=')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 to-blue-950/40"></div>
        </div>

        {/* Animated Content */}
        <motion.div
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="max-w-3xl text-center md:text-left"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              variants={fadeInUp}
            >
              Accessible Financial Solutions
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-200 mb-8"
              variants={fadeInUp}
            >
              We empower Filipinos by providing accessible, affordable, and
              personalized financial solutions that support individuals,
              families, and businesses in achieving their financial goals.
            </motion.p>
            <motion.div
              className="flex flex-col md:flex-row gap-4 justify-center md:justify-start"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* <Link to="/register" className="btn btn-primary btn-lg text-lg px-8 bg-blue-950 text-white border-2 border-white">
                  Apply Now
                </Link> */}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="btn btn-outline btn-lg border-2 border-white text-white hover:bg-white hover:text-blue-950 transition-all duration-300 text-lg px-8">
                  Learn More
                </button>
              </motion.div>
            </motion.div>

            {/* Animated Trust Indicators */}
            <motion.div
              className="mt-16 grid grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                { number: "1000+", text: "Businesses Helped" },
                { number: "₱50M+", text: "Loans Disbursed" },
                { number: "98%", text: "Success Rate" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {stat.number}
                  </h3>
                  <p className="text-gray-300">{stat.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Us Section with modern cards */}
      <section ref={aboutRef} className="py-16 bg-base-100 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">
              About RAZV Lending Corporation
            </h2>
            <p className="mb-6 text-lg text-gray-600">
              RAZV Lending Corporation is a trusted and innovative financial
              services provider committed to empowering individuals, families,
              and businesses by offering flexible lending solutions. With a
              strong foundation in customer service and financial expertise, we
              strive to meet the diverse needs of our clients with speed,
              reliability, and care.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="card bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <FaShieldAlt className="text-primary text-xl" />
                  </div>
                  <h3 className="card-title text-xl mb-4 justify-center">
                    Our Mission
                  </h3>
                  <p className="text-gray-600">
                    Our mission is to offer accessible and affordable financial
                    solutions that make a positive impact on the lives of our
                    customers. We aim to create lasting relationships with our
                    clients by providing personalized services that cater to
                    their unique financial needs.
                  </p>
                </div>
              </div>
              <div className="card bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="card-body">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <FaChartLine className="text-secondary text-xl" />
                  </div>
                  <h3 className="card-title text-xl mb-4 justify-center">
                    Our Vision
                  </h3>
                  <p className="text-gray-600">
                    To be the leading lending partner in the industry by
                    continuously adapting to the changing needs of our
                    customers, while maintaining the highest standards of
                    professionalism, integrity, and customer care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with modern cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Apply Online",
                icon: "📝",
                desc: "Fill out our simple online application form",
                color: "bg-blue-50",
                borderColor: "border-blue-200",
              },
              {
                title: "Get Approved",
                icon: "✅",
                desc: "Quick approval process with minimal documentation",
                color: "bg-green-50",
                borderColor: "border-green-200",
              },
              {
                title: "Receive Funds",
                icon: "💰",
                desc: "Get funds directly in your bank account",
                color: "bg-yellow-50",
                borderColor: "border-yellow-200",
              },
            ].map((step, index) => (
              <div
                key={index}
                className={`card ${step.color} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border ${step.borderColor}`}
              >
                <div className="card-body items-center text-center p-8">
                  <div className="text-4xl mb-6 transform hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <h3 className="card-title text-xl mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-white text-lg max-w-2xl mx-auto">
              Experience the difference with our innovative lending solutions
              designed with you in mind
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <FaShieldAlt className="text-2xl" />,
                title: "Secure Process",
                description:
                  "Security protocols to protect your data and transactions",
                color: "from-blue-500 to-blue-50",
                lightColor: "bg-blue-50",
                iconColor: "text-blue-500",
                image:
                  "https://img.freepik.com/free-vector/flat-background-safer-internet-day_23-2151127503.jpg?t=st=1740972756~exp=1740976356~hmac=77b5ec385d1b14f5b6e8d8bc1c03037d6909b572beb7e86abb13a179aa25ac13&w=1380",
                imageAlt: "Secure lending process illustration",
              },
              {
                icon: <FaClock className="text-2xl" />,
                title: "Fast Approval",
                description: "Get your loan approved in minutes, not days",
                color: "from-green-500 to-green-50",
                lightColor: "bg-green-50",
                iconColor: "text-green-500",
                image:
                  "https://img.freepik.com/free-vector/speed-test-concept-illustration_114360-3267.jpg?t=st=1740972884~exp=1740976484~hmac=13caab3dec14f511f538ff557fb5fd100aeb8c73f26478da5192eb61fbc9f272&w=900",
                imageAlt: "Quick approval process",
              },
              {
                icon: <FaChartLine className="text-2xl" />,
                title: "Flexible Terms",
                description: "Customizable payment plans that fit your budget",
                color: "from-purple-500 to-purple-100",
                lightColor: "bg-purple-50",
                iconColor: "text-purple-500",
                image:
                  "https://img.freepik.com/free-vector/businessman-meditates-harmony-wellbeing_88138-507.jpg?t=st=1740972942~exp=1740976542~hmac=894cedae1ed6753e89e35f847e129a4ee43169e8562534496e0a8978a17fcf3e&w=1380",
                imageAlt: "Flexible payment terms",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative group"
              >
                <motion.div
                  className="card bg-white shadow-lg hover:shadow-2xl transition-all duration-500 
                             transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        feature.image || "https://via.placeholder.com/400x300"
                      }
                      alt={feature.imageAlt}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${feature.color} 
                                    opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
                    />
                    {/* Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`w-16 h-16 ${feature.lightColor} rounded-full flex items-center 
                                      justify-center transform group-hover:rotate-6 transition-all duration-300
                                      backdrop-blur-sm`}
                      >
                        <div className={`${feature.iconColor} text-3xl`}>
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="card-body p-6">
                    <h3
                      className="card-title text-xl font-bold text-center justify-center mb-3
                                 group-hover:text-blue-950 transition-colors duration-300 text-blue-950"
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-center text-gray-600 group-hover:text-gray-700 
                                transition-colors duration-300"
                    >
                      {feature.description}
                    </p>

                    {/* Animated Learn More Link */}
                    <motion.div
                      className="mt-4 text-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        to="#"
                        className="inline-flex items-center text-blue-950 font-bold hover:text-primary-dark 
                                 transition-colors duration-300 font-medium"
                      >
                        <span>Learn More</span>
                        <svg
                          className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Trust Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Trusted by Thousands</h2>
          <div className="flex justify-center items-center space-x-8">
            <div className="badge badge-lg">SSL Secure</div>
            <div className="badge badge-lg">256-bit Encryption</div>
            <div className="badge badge-lg">24/7 Support</div>
          </div>
        </div>
      </section>

      {/* Service Cards with Scroll Animation */}
      <motion.section
        ref={servicesRef}
        className="py-16 bg-gray-50 scroll-mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Services
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Personal Loans",
                desc: "Quick and easy personal financing solutions",
              },
              {
                title: "Business Loans",
                desc: "Flexible financing for your business growth",
              },
              {
                title: "Microfinancing",
                desc: "Small loans with big impact for micro-entrepreneurs",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                className="card bg-white hover:shadow-xl transition-all duration-300 border border-gray-100"
                variants={fadeInUp}
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="card-body p-6">
                  <h3 className="card-title text-xl font-semibold text-center mb-4">
                    {service.title}
                  </h3>
                  <p className="text-center text-gray-600">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Form with Animation */}
      <motion.section
        ref={contactRef}
        className="py-16 bg-white scroll-mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Contact Us
          </motion.h2>
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Your Name"
                  className="input input-bordered w-full"
                />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  placeholder="Your Email"
                  className="input input-bordered w-full"
                />
              </div>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                placeholder="Your Message"
                className="textarea textarea-bordered w-full h-32"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="btn bg-blue-950 text-white w-full md:w-auto"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer p-10 bg-neutral text-neutral-content">
        <div>
          <span className="footer-title">Company</span>
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Privacy Policy</a>
        </div>
        <div>
          <span className="footer-title">Support</span>
          <a className="link link-hover">Help Center</a>
          <a className="link link-hover">Terms of use</a>
          <a className="link link-hover">FAQs</a>
        </div>
        <div>
          <span className="footer-title">Contact</span>
          <p>Email: support@example.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
