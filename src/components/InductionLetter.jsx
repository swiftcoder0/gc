import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * InductionLetter: Official formal induction document presented to new studio members.
 * Features:
 * - Acknowledgment protocol
 * - Downloadable high-resolution PDF with typography and parchment formatting
 * - Personalized admin special message
 */
export default function InductionLetter() {
  const { user, acknowledgeWelcome, returnToProfile } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const letterRef = useRef(null);

  // PDF Generation function
  const handleDownloadPDF = async () => {
    if (!letterRef.current || downloading) return;
    setDownloading(true);

    try {
      const element = letterRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#F8F5EE',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(`Gotham-Collage-Induction-Letter-${user?.member_id || 'Member'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Unable to generate PDF induction letter. You can use your browser print dialog as an alternative.');
    } finally {
      setDownloading(false);
    }
  };

  const handleAcknowledge = async () => {
    setAcknowledged(true);
    if (user?.has_acknowledged_welcome) {
      returnToProfile();
    } else {
      await acknowledgeWelcome();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-6 sm:py-12 px-3 sm:px-6 w-full">
      {/* Action Toolbar */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 sm:mb-6 animate-fade-in">
        <span className="text-[10px] sm:text-[11px] font-mono text-[#8C90A2] uppercase tracking-wider text-center sm:text-left">
          Official Induction Document
        </span>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-[#3E382A] hover:border-amber-400/50 bg-[#16140F] hover:bg-[#201D15] text-amber-200 text-xs font-mono tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50 min-h-[42px]"
        >
          <Download className="w-3.5 h-3.5 text-amber-300" />
          <span>{downloading ? 'Generating PDF...' : 'DOWNLOAD INDUCTION LETTER'}</span>
        </button>
      </div>

      {/* The Induction Letter Document (Personal Invitation / Formal Letter) */}
      <div className="w-full max-w-2xl animate-fade-in">
        <div
          ref={letterRef}
          className="parchment-sheet rounded-lg p-5 sm:p-10 md:p-14 text-[#1E1C1A] relative shadow-2xl transition-all"
          style={{ minHeight: '580px' }}
        >
          {/* Subtle interior hairline border */}
          <div className="absolute inset-2.5 sm:inset-5 border border-[#C5A880]/40 rounded pointer-events-none" />

          {/* Top Letterhead */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between pb-5 sm:pb-7 border-b border-[#D5C29D] gap-3 text-center sm:text-left">
            <div className="flex items-center space-x-3.5">
              {/* Gotham Collage Logo */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-black border border-[#C5A880] p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                <img
                  src="/assets/images/gotham-logo.jpg"
                  alt="Gotham Collage"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/assets/gotham-logo.jpg'; }}
                />
              </div>

              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold tracking-widest text-[#1E1C1A] uppercase">
                  Gotham Collage
                </h2>
                <p className="font-mono text-[9px] sm:text-[10px] tracking-wider text-[#685D4B] uppercase font-medium">
                  Building What's Next.
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right text-[10px] sm:text-[11px] font-mono text-[#685D4B]">
              <p className="font-bold text-[#2A2620] tracking-wider uppercase">OFFICIAL INDUCTION</p>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="my-5 sm:my-7 relative z-10 text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#14120F]">
              Dear {user?.full_name},
            </h3>
          </div>

          {/* Letter Body */}
          <div className="relative z-10 space-y-4 sm:space-y-5 font-serif text-xs sm:text-[15px] leading-relaxed text-[#2C2720] text-justify">
            <p>
              It is our privilege to formally induct you into <strong>Gotham Collage</strong>. 
              Our studio exists at the convergence of technology, minimal craft, and scalable venture building.
            </p>

            {/* Special Message from Admin - Designed Dark with Warm Golden Accents */}
            <div className="my-5 sm:my-6 p-4 sm:p-5 rounded-lg bg-[#141311] border border-[#3A3225] border-l-4 border-l-[#C5A880] shadow-md space-y-2 text-left">
              <h4 className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#D5BF9A]">
                A Special Message from Admin
              </h4>
              <p className="text-[#EDE8DE] italic font-serif text-xs sm:text-sm leading-relaxed">
                "{user?.induction_message || "Welcome to Gotham Collage. We look forward to seeing your vision shape what is next."}"
              </p>
            </div>
          </div>

          {/* Letter Footer - Simple Gotham Collage in the bottom left corner */}
          <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#D5C29D] relative z-10 text-left">
            <div className="font-serif text-base sm:text-lg font-bold tracking-wider text-[#1E1913] uppercase">
              Gotham Collage
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgment Bar */}
      <div className="w-full max-w-2xl mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-[#262836] bg-[#0E0F14] animate-fade-in">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#8C90A2]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">Induction protocol</span>
        </div>

        <button
          onClick={handleAcknowledge}
          disabled={acknowledged}
          className="w-full sm:w-auto px-5 py-2.5 rounded font-mono text-xs uppercase tracking-wider font-bold bg-white hover:bg-zinc-200 text-black transition-all flex items-center justify-center space-x-1.5 shrink-0 min-h-[42px]"
        >
          <span>Continue to Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
