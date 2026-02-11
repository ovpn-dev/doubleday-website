import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Award, Users, Briefcase, Phone, Mail, MapPin, CheckCircle, Target, Eye, Heart } from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'projects', 'clients', 'team', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const services = [
    {
      title: 'ISO Management Systems',
      description: 'ISO 9001 QMS, ISO 14001 EMS, ISO 27001 ISMS, ISO 45001 OH&SMS implementation, training, and third-party audits.',
      icon: Award
    },
    {
      title: 'Health, Safety & Environment',
      description: 'HSE audits, occupational health services, emergency response planning, and environmental management solutions.',
      icon: CheckCircle
    },
    {
      title: 'Information Security & Cybersecurity',
      description: 'ISO 27001, PCI DSS, penetration testing, vulnerability assessments, and cybersecurity management.',
      icon: Target
    },
    {
      title: 'Management Consulting',
      description: 'Business planning, supply chain management, risk assessment, industrial relations, and corporate development.',
      icon: Briefcase
    },
    {
      title: 'Environmental Impact Assessment',
      description: 'EIA, environmental monitoring, remediation studies, and sustainable community development.',
      icon: Eye
    },
    {
      title: 'Training & Development',
      description: 'Professional training programs for QHSE, project management, quality assurance, and industry best practices.',
      icon: Users
    }
  ];

  const stats = [
    { number: '30+', label: 'Years of Excellence' },
    { number: '3,500+', label: 'Employees Trained' },
    { number: '50+', label: 'ISO Audits Conducted' },
    { number: '100+', label: 'Projects Executed' }
  ];

const clients = [
  {
    name: 'Shell Petroleum Dev. Company',
    logo: 'https://www.shell.com.ng/_jcr_content/root/main/section/item.shellimg.jpeg/1747586814687/shell-pectan.jpeg', // Shell logo PNG found online :contentReference[oaicite:0]{index=0}
    alt: 'Shell Petroleum Development Company Logo'
  },
  {
    name: 'Chevron Nigeria Limited',
    logo: 'https://www.trcp.org/wp-content/uploads/2024/10/Chevron-logo-use.png', // Chevron logo PNG (generic, widely used) 
    alt: 'Chevron Nigeria Limited Logo'
  },
  {
    name: 'Total Nigeria Plc',
    logo: 'https://cdn.punchng.com/wp-content/uploads/2016/07/22021004/TOTAL.jpg', // TotalEnergies logo (official) – generic company mark
    alt: 'Total Nigeria Plc Logo'
  },
  {
    name: 'Zenith Bank',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqqiNkUYBHMvcuQOdcqjRImtCJcA4Tl3_7Bg&s', // Zenith Bank logo PNG found online :contentReference[oaicite:2]{index=2}
    alt: 'Zenith Bank Logo'
  },
  {
    name: 'United Bank for Africa',
    logo: 'https://www.ubagroup.com/wp-content/uploads/2025/03/UBA-38567.jpg', // UBA logo PNG found online 
    alt: 'United Bank for Africa Logo'
  },
  {
    name: 'NNPC',
    logo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian_National_Petroleum_Company_logo.svg', // NNPC official logo from Wikimedia Commons :contentReference[oaicite:4]{index=4}
    alt: 'Nigerian National Petroleum Corporation Logo'
  },
  {
    name: 'NPDC Benin',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiSB8VT4uiaJyTxNvyq0CeHajxLLbAmYiuZg&s', // NPDC brand assets available via brandfetch :contentReference[oaicite:5]{index=5}
    alt: 'Nigerian Petroleum Development Company Logo'
  },
  {
    name: 'Schlumberger Nigeria',
    logo: 'https://commons.wikimedia.org/wiki/Special:FilePath/SLB_Logo_2022.svg', // SLB (Schlumberger) official logo SVG 
    alt: 'Schlumberger Nigeria Logo'
  },
  {
    name: 'Lagos State Safety Commission',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBfIiZkt36KkhV79ofbhGVThaUknCM-5fzeg&s', // No official transparent logo found online — placeholder
    alt: 'Lagos State Safety Commission Logo'
  },
  {
    name: 'Nigerian Upstream Petroleum Regulatory Commission (NUPRC)',
    logo: 'https://www.nuprc.gov.ng/wp-content/uploads/2023/01/NUPRC-LOGO.jpg', // No official transparent logo found online — placeholder
    alt: 'Nigerian Upstream Petroleum Regulatory Commission Logo'
  },
  {
    name: 'NAMPAK Nigeria Limited',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX_jih5kjgA6YHGYKREREGHpIK_yekCkgycQ&s', // NAMPAK logo from public vector resource
    alt: 'NAMPAK Nigeria Limited Logo'
  },
  {
    name: 'Mobil Producing Nigeria',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw1itVVgDddauXae2jeFfj_WSvnqlVt70x9g&s', // ExxonMobil logo used for Mobil Producing Nigeria as part of parent branding
    alt: 'Mobil Producing Nigeria Logo'
  }
];


  const team = [
    {
      name: 'Mazi Colman Obasi',
      role: 'Lead Consultant & CEO',
      description: 'ISO Management Systems Practitioner with over 30 years of experience in the oil and gas industry.'
    },
    {
      name: 'Dr. Elijah Ogbuokiri',
      role: 'Development Management Specialist',
      description: 'Business Plan and Feasibility Study Specialist with extensive industry expertise.'
    },
    {
      name: 'Mr. Miracle Chukwudebe',
      role: 'Information Security Specialist',
      description: 'ISO 27001 and Cybersecurity Specialist with proven track record in financial sectors.'
    },
    {
      name: 'Dr. Nicholas Okere',
      role: 'Occupational Health Practitioner',
      description: 'ILO Accredited Occupational Health Practitioner ensuring workplace safety excellence.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags are in index.html */}
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo - Left */}
            <button
              onClick={() => scrollToSection("home")}
              className="flex items-center"
            >
              <img
                src="/delogo.png"
                alt="Doubleday Expressions Logo"
                className="h-10 md:h-10 w-auto"
              />
            </button>

            {/* Desktop Menu - Right */}
            <div className="hidden md:flex space-x-8">
              {['Home', 'About', 'Services', 'Projects', 'Clients', 'Team', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.toLowerCase()
                      ? 'text-blue-900 border-b-2 border-blue-900'
                      : 'text-gray-700 hover:text-blue-900'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button - Right */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              {['Home', 'About', 'Services', 'Projects', 'Clients', 'Team', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item.toLowerCase())
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>


      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Excellence in<br />Management Consulting
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Setting standards beyond regulatory requirements since 1992
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-sm font-medium">ISO Certified</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-sm font-medium">SON Registered</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-sm font-medium">30+ Years Experience</span>
              </div>
            </div>
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Get Started
              <ChevronRight className="inline ml-2" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Doubleday Expressions</h2>
            <div className="w-24 h-1 bg-blue-900 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Doubleday Expressions Limited was incorporated in February 1992 as a wholly Nigerian company (RC 188535). We started operations in 1993 as a Management Consulting firm in the oil and gas industry, specializing in health, safety, environment, and industrial relations practices.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                In 2004, we were registered by the Standard Organisation of Nigeria (SON) as Management Systems Practitioners in ISO 9001 QMS and ISO 14001 EMS to train, document, implement, and audit for Management Systems International Standards requirements.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Our business is focused on our customers, quality best practices, and striving to continually exceed customer expectations across petroleum, telecommunications, industrial, medical, logistics, maritime, educational, technology, and transportation sectors.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <Target className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Our Vision</h3>
                    <p className="text-gray-700">To be first in industry and professionalism</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <Eye className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Our Mission</h3>
                    <p className="text-gray-700">To provide timeless creativity and continually set standards beyond regulatory requirements in promoting our clients' business</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <Heart className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Our Philosophy</h3>
                    <p className="text-gray-700">Our client business success is our business. No task is impossible. Courage, honesty, and integrity.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-6">Key Accomplishments</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="mr-3 flex-shrink-0 mt-1" size={20} />
                  <span>Implemented ISO 9001:2000, 2008, 2015, ISO 27001, and ISO 45001 for multiple clients</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 flex-shrink-0 mt-1" size={20} />
                  <span>Trained over 3,500 employees across different companies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 flex-shrink-0 mt-1" size={20} />
                  <span>Participated in Nigeria-Sao Tome & Principe JDZ Environmental Baseline Studies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 flex-shrink-0 mt-1" size={20} />
                  <span>Developed Sustainable Community Development Manual for NPDC</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 flex-shrink-0 mt-1" size={20} />
                  <span>Conducted over 50 ISO 45001 OH&SMS Audits for Lagos Safety Commission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-blue-900 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive management consulting solutions tailored to your industry needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="text-blue-900" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Notable Projects</h2>
            <div className="w-24 h-1 bg-blue-900 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Environmental & Oil and Gas</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <ChevronRight className="mr-2 text-blue-900 flex-shrink-0 mt-1" size={18} />
                  <span>Nigeria-Sao Tome & Principe JDZ Environmental Baseline Studies (2006)</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="mr-2 text-blue-900 flex-shrink-0 mt-1" size={18} />
                  <span>Sustainable Community Development Manual for NPDC Benin</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="mr-2 text-blue-900 flex-shrink-0 mt-1" size={18} />
                  <span>Comparative Bio-remediation Assessment (NAOC)</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="mr-2 text-blue-900 flex-shrink-0 mt-1" size={18} />
                  <span>Multiple EIA projects for SPDC, Chevron, and Elf</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-4">ISO & Information Security</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <ChevronRight className="mr-2 text-blue-900 flex-shrink-0 mt-1" size={18} />
                  <span>ISO 27001, 22301, 20000 for Zenith Bank Data Centers</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="mr-2 text-blue-900 flex-shrink-0 mt-1" size={18} />
                  <span>Security Operation Center Design and Management</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="mr-2 text-blue-900 flex-shrink-0 mt-1" size={18} />
                  <span>Penetration Testing and Vulnerability Assessments</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="mr-2 text-blue-900 flex-shrink-0 mt-1" size={18} />
                  <span>COBIT 5.0 Implementation for United Bank of Africa</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section id="clients" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Clients</h2>
            <div className="w-24 h-1 bg-blue-900 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Trusted by leading organizations across multiple industries</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {clients.map((client, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100 flex flex-col items-center justify-center"
              >
                <div className="w-full h-20 flex items-center justify-center mb-3">
                  <img 
                    src={client.logo} 
                    alt={client.alt}
                    className="max-w-full max-h-full object-contain hover:grayscale-0 transition-all"
                    loading="lazy"
                  />
                </div>
                <p className="text-gray-700 font-medium text-sm text-center">{client.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <div className="w-24 h-1 bg-blue-900 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Expert consultants with decades of industry experience</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{member.name}</h3>
                <p className="text-blue-900 font-semibold text-center mb-3 text-sm">{member.role}</p>
                <p className="text-gray-600 text-sm text-center leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
            <p className="text-xl text-blue-100">Let's discuss how we can help elevate your business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="bg-white/20 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Address</h3>
              <p className="text-blue-100">
                4B Irewole Close, Peace Estate, Aseese,<br />
                Lagos Ibadan Expressway,<br />
                Ogun State, Nigeria
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="bg-white/20 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Phone</h3>
              <p className="text-blue-100">
                <a href="tel:+2348033353229" className="hover:text-white transition-colors">
                  +234 803 335 3229
                </a>
              </p>
              <p className="text-blue-100">
                <a href="tel:+2348135322430" className="hover:text-white transition-colors">
                  +234 813 532 2430
                </a>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="bg-white/20 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Email</h3>
              <p className="text-blue-100">
                <a href="mailto:doubledayexpressions@gmail.com" className="hover:text-white transition-colors block mb-2">
                  doubledayexpressions@gmail.com
                </a>
                <a href="mailto:mazicolmanobasi@gmail.com" className="hover:text-white transition-colors block mb-2">
                  mazicolmanobasi@gmail.com
                </a>
                <a href="mailto:vobasi15@gmail.com" className="hover:text-white transition-colors block">
                  vobasi15@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Doubleday Expressions Limited</h3>
              <p className="text-gray-400 mb-4">
                Setting standards beyond regulatory requirements since 1992
              </p>
              <p className="text-gray-400 text-sm">
                RC 188535 | Registered in Nigeria
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Certifications</h3>
              <ul className="space-y-2 text-gray-400">
                <li>ISO 9001 QMS Certified</li>
                <li>ISO 14001 EMS Certified</li>
                <li>SON Registered</li>
                <li>PECB Partner</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {['About', 'Services', 'Projects', 'Contact'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Doubleday Expressions Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;