"use client";

import { trpc } from "@/utils/trpc";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  legal: [
    { name: "Términos y Condiciones", href: "/legal/terms" },
    { name: "Política de Privacidad", href: "/legal/privacy" },
    { name: "Política de Cookies", href: "/legal/cookies" },
    { name: "Libro de Reclamaciones", href: "/legal/complaints" },
  ],
  support: [
    { name: "Centro de Ayuda", href: "/help" },
    { name: "Documentación", href: "/docs" },
    { name: "API", href: "/api-docs" },
  ],
};

export function Footer() {
  const { data: companyInfo } = trpc.companyInfo.get.useQuery();

  // Default values if no company info is available
  const defaultInfo = {
    name: "MyApp",
    displayName: "My Application Platform",
    description:
      "La plataforma líder para gestión de usuarios y autenticación.",
    email: null,
    phone: null,
    address: null,
    city: null,
    country: null,
    website: null,
    facebookUrl: null,
    twitterUrl: null,
    instagramUrl: null,
    linkedinUrl: null,
    youtubeUrl: null,
    foundedYear: null,
    logoUrl: null,
    faviconUrl: null,
    metaTitle: "MyApp - Modern Platform",
    metaDescription: "Plataforma moderna y escalable",
    metaKeywords: "gestión, usuarios, plataforma, moderno, escalable",
    termsUrl: "/legal/terms",
    privacyUrl: "/legal/privacy",
    cookiesUrl: "/legal/cookies",
    complaintsUrl: "/legal/complaints",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const info = companyInfo || defaultInfo;

  const socialLinks = [
    { name: "Facebook", href: info.facebookUrl, icon: Facebook },
    { name: "Twitter", href: info.twitterUrl, icon: Twitter },
    { name: "Instagram", href: info.instagramUrl, icon: Instagram },
    { name: "LinkedIn", href: info.linkedinUrl, icon: Linkedin },
    { name: "YouTube", href: info.youtubeUrl, icon: Youtube },
  ].filter((link) => link.href);

  return (
    <footer className="bg-[#131B2F] border-t border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {info.displayName}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {info.description}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              {info.email && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="h-4 w-4 text-primary/60" />
                  <a
                    href={`mailto:${info.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {info.email}
                  </a>
                </div>
              )}
              {info.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="h-4 w-4 text-primary/60" />
                  <a
                    href={`tel:${info.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {info.phone}
                  </a>
                </div>
              )}
              {info.address && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="h-4 w-4 text-primary/70" />
                  <span className="hover:text-primary transition-colors cursor-default">
                    {info.address}
                  </span>
                </div>
              )}
            </div>

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-700 hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg transition-all duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4 text-gray-300 hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Soporte</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()}{" "}
              <span className="text-primary font-medium">{info.name}</span>.
              Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link
                href="/legal/terms"
                className="hover:text-primary transition-colors"
              >
                Términos
              </Link>
              <Link
                href="/legal/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacidad
              </Link>
              <Link
                href="/legal/cookies"
                className="hover:text-primary transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
