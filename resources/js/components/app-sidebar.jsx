import * as React from "react"
import {
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  UsersIcon,
  ChartNoAxesCombined,
  ArrowRightLeft,
  ChartBarStacked,
  Tag,
  Target,
  CreditCard,
  Briefcase,
  ChevronDown,
  CalendarClock,
  User,
  PieChart,
  TrendingUp,
  BarChart3,
  LineChart,
  DollarSign,
  PiggyBank,
} from "lucide-react"

import { NotificationBell } from "@/components/NotificationBell"
import TransactionsPdfDialog from "@/components/Reports/TransactionsPdfDialog"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Link } from "@inertiajs/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { usePage } from "@inertiajs/react"
import { cn } from "@/lib/utils"

function AppSidebar({
  ...props
}) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const hasAdminRole = user?.roles?.some(role => role.name === 'admin');
  const currentRouteName = route().current();
  const [expandedMenus, setExpandedMenus] = React.useState({});
  const [showTransactionsPdfDialog, setShowTransactionsPdfDialog] = React.useState(false);
  
  // Get sidebar visibility settings
  const settings = usePage().props.settings || {};
  const sidebarItems = settings.sidebarItems || {
    dashboard: true,
    analyticsAndIncome: true,
    categories: true,
    transactions: true,
    budgets: true,
    goals: true,
    savings: true,
    debtManagement: true,
    investments: true,
    reports: true,
    adminPanel: true
  };
  
  // Statistics sub-items
  const statisticsItems = [
    {
      title: "Dashboard",
      url: route('statistics.index'),
      current: currentRouteName === 'statistics.index'
    },
    {
      title: "Income Analysis",
      url: route('statistics.income-analysis'),
      current: currentRouteName === 'statistics.income-analysis'
    },
    {
      title: "Payment Methods",
      url: route('statistics.payment-methods'),
      current: currentRouteName === 'statistics.payment-methods'
    }
  ];

  // Admin Analytics sub-items (only shown for admins)
  const adminAnalyticsItems = hasAdminRole ? [
    {
      title: "Categories Analytics",
      url: route('admin.analytics.categories'),
      current: currentRouteName === 'admin.analytics.categories',
      icon: PieChart
    },
    {
      title: "Budget Analytics",
      url: route('admin.analytics.budgets'),
      current: currentRouteName === 'admin.analytics.budgets',
      icon: TrendingUp
    },
    {
      title: "Goals Analytics",
      url: route('admin.analytics.goals'),
      current: currentRouteName === 'admin.analytics.goals',
      icon: Target
    },
    {
      title: "Debt Analytics",
      url: route('admin.analytics.debts'),
      current: currentRouteName === 'admin.analytics.debts',
      icon: CreditCard
    },
    {
      title: "Investment Analytics",
      url: route('admin.analytics.investments'),
      current: currentRouteName === 'admin.analytics.investments',
      icon: LineChart
    }
  ] : [];
  
  // Dynamic navigation based on user roles and current route
  const navItems = [
    {
      id: 'dashboard',
      title: "Dashboard",
      url: route('dashboard'),
      icon: LayoutDashboardIcon,
      current: currentRouteName === 'dashboard'
    },
    {
      id: 'analyticsAndIncome',
      title: "Statistics",
      icon: ChartNoAxesCombined,
      current: currentRouteName?.startsWith('statistics.') || currentRouteName === 'income-analysis',
      children: statisticsItems
    },
    {
      id: 'categories',
      title: "Categories",
      url: route('categories.index'),
      icon: ChartBarStacked,
      current: currentRouteName?.startsWith('categories.')
    },
    {
      id: 'transactions',
      title: "Transactions",
      icon: ArrowRightLeft,
      current: currentRouteName?.startsWith('transactions.') || currentRouteName?.startsWith('payment-schedules.'),
      children: [
        {
          title: "Dashboard",
          url: route('transactions.index'),
          current: currentRouteName === 'transactions.index'
        },
        {
          title: "Payment Schedules",
          url: route('payment-schedules.index'),
          current: currentRouteName === 'payment-schedules.index'
        }
      ]
    },
    {
      id: 'budgets',
      title: "Budgets",
      url: route('budgets.index'),
      icon: Tag,
      current: currentRouteName?.startsWith('budgets.')
    },
    {
      id: 'goals',
      title: "Goals",
      url: route('goals.index'),
      icon: Target,
      current: currentRouteName?.startsWith('goals.')
    },
    {
      id: 'savings',
      title: "Savings",
      url: route('savings.index'),
      icon: PiggyBank,
      current: currentRouteName?.startsWith('savings.')
    },
    {
      id: 'debtManagement',
      title: "Debt Management",
      url: route('creditors.index'),
      icon: CreditCard,
      current: currentRouteName?.startsWith('creditors.')
    },
    {
      id: 'investments',
      title: "Investments",
      url: route('investments.index'),
      icon: Briefcase,
      current: currentRouteName?.startsWith('investments.')
    },
    {
      id: 'reports',
      title: "Reports",
      icon: ChartBarStacked,
      current: currentRouteName?.startsWith('reports.'),
      children: [
        {
          title: "Transactions",
          onClick: () => setShowTransactionsPdfDialog(true),
          current: false
        }
      ]
    }
  ];
  
  const toggleMenu = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Add admin panel with analytics for admin users
  if (hasAdminRole) {
    navItems.push({
      id: 'adminPanel',
      title: "Admin Panel",
      icon: UsersIcon,
      url: route('admin.index'),
      current: currentRouteName?.startsWith('admin.')
    });
  }
  
  // Set up user data for the sidebar
  const userData = {
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  };

  // Team data
  const teams = [
    {
      name: "Budget Buddy",
      logo: GalleryVerticalEnd,
      plan: "Finance Manager",
    },
  ];

  // Filter out menu items based on settings
  const visibleNavItems = navItems.filter(item => 
    sidebarItems[item.id] !== false // Only filter out items explicitly set to false
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {visibleNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.children ? (
                  <>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      isActive={item.current}
                      onClick={() => toggleMenu(item.title)}
                    >
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      <span className="text-base">{item.title}</span>
                      <ChevronDown 
                        className={cn(
                          "ml-auto h-4 w-4 transition-transform duration-200",
                          expandedMenus[item.title] ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </SidebarMenuButton>
                    {expandedMenus[item.title] && (
                      <SidebarMenuSub>
                        {item.children.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            {subItem.children ? (
                              // Nested submenu (for Analytics under Admin Panel)
                              <>
                                <SidebarMenuSubButton
                                  isActive={subItem.current}
                                  onClick={() => toggleMenu(`${item.title}-${subItem.title}`)}
                                  className="cursor-pointer"
                                >
                                  {subItem.icon && <subItem.icon className="mr-2 h-3 w-3" />}
                                  <span>{subItem.title}</span>
                                  <ChevronDown 
                                    className={cn(
                                      "ml-auto h-3 w-3 transition-transform duration-200",
                                      expandedMenus[`${item.title}-${subItem.title}`] ? "rotate-0" : "-rotate-90"
                                    )}
                                  />
                                </SidebarMenuSubButton>
                                {expandedMenus[`${item.title}-${subItem.title}`] && (
                                  <div className="ml-4 space-y-1">
                                    {subItem.children.map((nestedItem) => (
                                      <SidebarMenuSubButton
                                        key={nestedItem.title}
                                        asChild
                                        isActive={nestedItem.current}
                                        className="text-xs"
                                      >
                                        <Link href={nestedItem.url}>
                                          {nestedItem.icon && <nestedItem.icon className="mr-2 h-3 w-3" />}
                                          <span>{nestedItem.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              // Regular submenu item
                              <SidebarMenuSubButton
                                asChild={subItem.url ? true : false}
                                isActive={subItem.current}
                                onClick={subItem.onClick}
                                className={subItem.onClick && !subItem.url ? "cursor-pointer" : ""}
                              >
                                {subItem.url ? (
                                  <Link href={subItem.url}>
                                    {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                ) : (
                                  <button type="button" className="w-full text-left">
                                    {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                                    {subItem.title}
                                  </button>
                                )}
                              </SidebarMenuSubButton>
                            )}
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title} 
                    isActive={item.current}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="mb-2">
            <NotificationBell />
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
      
      {/* Transaction PDF Dialog */}
      <TransactionsPdfDialog 
        open={showTransactionsPdfDialog}
        onClose={() => setShowTransactionsPdfDialog(false)}
      />
    </Sidebar>
  );
}

export { AppSidebar }
export default AppSidebar;
