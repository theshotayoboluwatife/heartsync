import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "Heart", label: "Accueil" },
    { path: "/achievements", icon: "Trophy", label: "Succès" },
    { path: "/messages", icon: "MessageCircle", label: "Messages" },
    { path: "/premium", icon: "Crown", label: "Premium" },
    { path: "/profile", icon: "User", label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons];
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center py-2 px-4 transition-colors ${
                    isActive 
                      ? 'text-pink-600' 
                      : 'text-gray-400 hover:text-pink-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
