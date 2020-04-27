import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS_SUPER_USER: NbMenuItem[] = [
  {
    title: 'Client Directory',
    icon: 'client-ico',
    link: '/app/clients',
  },
  {
    title: 'Reports',
    icon: 'report-ico',
    link: '/app/reports-admin',
  },
  {
    title: 'User Directory',
    icon: 'dir-ico',
    link: '/app/user-directory-admin',
  },
  {
    title: 'Settings',
    icon: 'settings-ico',
    link: '/app/settings',
  },
  {
    title: 'Profile',
    icon: 'user-ico',
    link: '/app/profile-wt-admin',
  },
  {
    title: 'Role Privileges',
    icon: 'role-ico',
    link: '/app/role-privileges',
  },
  {
    title: "Yeast Manager",
    icon: "yeast-ico",
    link: "/app/yeast-strains",
  },
];

export const MENU_ITEMS_ORGANIZATION: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'dashboard-ico',
    link: '/app/dashboard',
  },
  {
    title: 'Reports',
    icon: 'rep-ico',
    link: '/app/reports',
  },
  {
    title: 'Recipes',
    icon: 'recipe-ico',
    link: '/app/recipes',
  },
  {
    title: "Yeast Manager",
    icon: "yeast-ico",
    link: "/app/yeast-strains",
  },
  {
    title: 'Users',
    icon: 'user-ico',
    link: '/app/user-directory',
  },
  {
    title: 'Role Privileges',
    icon: 'role-ico',
    link: '/app/user-directory/org-previleges',
  },
  {
    title: 'Preferences',
    icon: 'preference-ico',
    link: '/app/preferences',
  },
  {
    title: 'Profile',
    icon: 'profile-ico',
    link: '/app/profile-organization',
  }
];
