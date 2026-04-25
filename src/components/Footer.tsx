import React from 'react';
import Link from 'next/link';
import { Mail, Instagram, MessageCircle, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-navy text-white/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Abhimanyu Learning Space</h3>
            <p className="text-sm leading-relaxed">
              A focused academic environment for CUSAT students featuring a professional digital library.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/library" className="hover:text-crimson transition">Professional Library</Link></li>
              <li><Link href="/upload" className="hover:text-crimson transition">Upload Resources</Link></li>
              <li><a href="#" className="hover:text-crimson transition">Contribution Guidelines</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-white mb-4">Connect With Us</h4>
            <div className="space-y-3">
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald transition"
              >
                <MessageCircle size={18} /> WhatsApp Channel
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-pink-400 transition"
              >
                <Instagram size={18} /> Instagram
              </a>
              <a
                href="mailto:sfiimscsubcommittee25@gmail.com"
                className="flex items-center gap-2 hover:text-crimson transition"
              >
                <Mail size={18} /> sfiimscsubcommittee25@gmail.com
              </a>
            </div>
          </div>

          {/* Managed By */}
          <div>
            <h4 className="font-semibold text-white mb-4">Managed By</h4>
            <p className="text-sm">SFI IMSC Sub-Committee</p>
            <p className="text-sm mt-2">Cochin University of Science and Technology</p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-sm">
            &copy; {currentYear} Abhimanyu Learning Space. Made with <Heart size={14} className="inline text-crimson" /> by Students, for Students.
          </p>
          <p className="text-xs mt-2 text-white/50">Knowledge is a Weapon, Education is Liberation.</p>
        </div>
      </div>
    </footer>
  );
}
