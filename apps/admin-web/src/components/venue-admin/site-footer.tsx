import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Our Team", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
  {
    title: "Services",
    links: [
      { name: "Facilities", href: "#" },
      { name: "Memberships", href: "#" },
      { name: "Events", href: "#" },
      { name: "Training", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", href: "#" },
      { name: "News", href: "#" },
      { name: "FAQs", href: "#" },
      { name: "Support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Disclaimer", href: "#" },
    ],
  },
]

const socialLinks = [
  { icon: Facebook, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Youtube, href: "#" },
]

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#000314] py-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1032B9]/10 via-transparent to-transparent" />

      <div className="container relative">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <span className="text-2xl font-bold text-white">React Sport Club</span>
            </Link>
            <p className="mb-4 max-w-sm text-sm text-gray-400">
              Empowering athletes and sports enthusiasts with top-notch facilities, expert coaching, and a vibrant
              community. Join us in the pursuit of excellence.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-[#1032B9]/20"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="mb-4 text-lg font-semibold text-white">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-[#1032B9]">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 sm:flex-row">
          <p className="mb-4 text-sm text-gray-400 sm:mb-0">
            © {new Date().getFullYear()} React Sport Club. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-sm text-gray-400 hover:text-[#1032B9]">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-[#1032B9]">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-[#1032B9]">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

