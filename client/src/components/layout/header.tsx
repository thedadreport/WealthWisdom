import { Link, useLocation } from "wouter";
import { Bell, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Budget', href: '/budget' },
    { name: 'Cash Flow', href: '/cash-flow' },
    { name: 'Goals', href: '/goals' },
    { name: 'Learn', href: '/learn' },
  ];

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <TrendingUp className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-neutral-900">FlowBudget</h1>
            </div>
          </div>
          
          {!isMobile && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a className={`px-1 pb-4 text-sm font-medium transition-colors ${
                    location === item.href 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}>
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-500">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-white text-sm font-medium">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
