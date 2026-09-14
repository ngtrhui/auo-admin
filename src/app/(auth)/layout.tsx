import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TooltipProvider } from '@/components/ui/Tooltip';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider delayDuration={200}>
      <main className="flex h-dvh overflow-hidden w-full">
        <Sidebar />
        {/* min-h-0: flex item được phép co nhỏ hơn nội dung → overflow-y-auto mới scroll */}
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto scrollbar bg-second-gray">
          <Header />
          <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-4 xl:p-6">{children}</div>
        </div>
      </main>
    </TooltipProvider>
  );
};

export default AuthLayout;
