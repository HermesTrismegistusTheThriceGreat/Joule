import type { ReactNode } from 'react';
import Header from './Header';
import AlertBanner from './AlertBanner';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AlertBanner />
      <main className="flex-1 p-6 pt-4">
        <div className="max-w-[1800px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
