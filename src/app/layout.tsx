import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export const metadata: Metadata = {
  title: 'LoveStory - Nền Tảng Thiệp Cưới & Sự Kiện Điện Ảnh Độc Bản',
  description: 'Tạo thiệp cưới online tương tác, scrollytelling điện ảnh, đĩa than phát nhạc, mã VietQR mừng cưới và xác nhận tham dự RSVP.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="antialiased" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Alex+Brush&family=Allura&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Bodoni+Moda:ital,wght@0,400;0,600;1,400&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Dancing+Script:wght@500;700&family=Ephesis&family=Great+Vibes&family=Italianno&family=Lovers+Quarrel&family=Marck+Script&family=MonteCarlo&family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Parisienne&family=Pinyon+Script&family=Prata&family=Rouge+Script&family=Sacramento&family=WindSong:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#faf8f5] text-stone-900 font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
