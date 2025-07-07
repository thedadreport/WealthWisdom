import { Link, useLocation } from "wouter";
import {
  Home,
  PieChart,
  TrendingUp,
  Target,
  GraduationCap,
} from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Budget", href: "/budget", icon: PieChart },
    { name: "Cash Flow", href: "/cash-flow", icon: TrendingUp },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Learn", href: "/learn", icon: GraduationCap },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
                  isActive ? "text-primary" : "text-neutral-400"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
