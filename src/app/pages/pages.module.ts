import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PagesComponent } from './pages.component';
import { AuthGaurdService } from '../core/guards/auth-gaurd.service';
import { PermissionGaurdService } from '../core/guards/permission-gaurd.service';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { RoleGaurdService } from '../core/guards/role-gaurd.service';
import {RoleName} from '../models/roleName';

const roleName = RoleName;
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
     /** wt-admin routes */
     {
      path: 'clients',
      loadChildren: () => import('../pages/wt-admin/clients/clients.module')
        .then(m => m.ClientsModule),

      canActivateChild: [RoleGaurdService, AuthGaurdService],
      canActivate: [RoleGaurdService, AuthGaurdService],
      data: {
        expectedRole: [roleName.Superadmin],
        expectedPermission: ['Delete Organization'],
      },

    },
    {
      path: 'reports-admin',
      loadChildren: () => import('../pages/wt-admin/reports-admin/reports-admin.module')
        .then(m => m.ReportsAdminModule),
      canActivate: [RoleGaurdService, AuthGaurdService],
      data: {
        expectedRole: [roleName.Superadmin],
      },
    },
    {
      path: 'user-directory-admin',
      loadChildren: () => import('../pages/wt-admin/user-directory/user-directory.module')
        .then(m => m.UserDirectoryModule),
      canActivate: [RoleGaurdService, AuthGaurdService],
      data: {
        expectedRole: [roleName.Superadmin],
      },
    },
    {
      path: 'settings',
      loadChildren: () => import('../pages/wt-admin/settings/settings.module')
        .then(m => m.SettingsModule),
      canActivate: [RoleGaurdService, AuthGaurdService],
      data: {
        expectedRole: [roleName.Superadmin],
      },
    },
    {
      path: 'profile-wt-admin',
      loadChildren: () => import('../pages/wt-admin/profile-super-admin/profile-super-admin.module')
        .then(m => m.ProfileSuperAdminModule),
      canActivate: [RoleGaurdService, AuthGaurdService],
      data: {
        expectedRole: [roleName.Superadmin],
      },
    },
    {
      path: 'role-privileges',
      loadChildren: () => import('../pages/wt-admin/role-privileges-super-admin/role-privileges-super-admin.module')
        .then(m => m.RolePrivilegesSuperAdminModule),
      canActivate: [RoleGaurdService, AuthGaurdService],
      data: {
        expectedRole: [roleName.Superadmin],
      },
    },
    /** wt-admin routes */
    {
      path: 'dashboard',
      loadChildren: () => import('../pages/organization-users/dashboard/dashboard.module')
        .then(m => m.DashboardModule),
      canActivate: [PermissionGaurdService, AuthGaurdService],
      data: {
        expectedPermissions: [
          'ba50d935-84af-4830-b30e-e9aa597f1ded',
          'bbb081dc-9b51-4e57-bef4-ffaac228cb30',
          '73e43a11-7360-42e2-a135-d38346904dec',
          '568f1a5d-a0a7-496c-a899-01bd74834744',
          '89ed4257-9940-4bfb-95a4-1adad0afb3f5',
          '97408e7c-3d69-4f64-b889-54443b98528d',
          'b287425f-f643-498c-8a62-9bcdaccce846'
        ],
      },
    },
    {
      path: 'reports',
      loadChildren: () => import('../pages/organization-users/reports-organization/reports-organization.module')
        .then(m => m.ReportsOrganizationModule),
      canActivate: [PermissionGaurdService, AuthGaurdService],
      data: {
        expectedPermissions: [
          'B287425F-F643-498C-8A62-9BCDACCCE846',
          '6121e088-ff3d-46c5-b63e-75ae2f9b5928'
        ],
      },
    },
    {
      path: 'recipes',
      loadChildren: () => import('../pages/organization-users/recipe-directory/recipe-directory.module')
        .then(m => m.RecipeDirectoryModule),
      canActivate: [PermissionGaurdService, AuthGaurdService],
      data: {
        expectedPermissions: [
          '83dbac5f-c1e5-45bc-9989-d0e993a07761',
          'b93f32df-b9b8-44d7-a15b-5b9df2c5a435',
          '658858d3-5b17-4335-b4db-9ff58fb7e7e0',
          'fa0939a1-8188-4c35-8e96-3590b3f92e93',
          '6121e088-ff3d-46c5-b63e-75ae2f9b5928'
        ],
      },
    },
    {
      path: 'yeast-strains',
      loadChildren: () => import('../pages/organization-users/yeast-strains/yeast-strains.module')
        .then(m => m.YeastStrainsModule),
      canActivate: [PermissionGaurdService, AuthGaurdService],
      data: {
        expectedPermissions: [
          '8b31ba09-b429-4bab-8aa2-1d598b7e2139',
          '19e10be9-12f1-4e92-a963-28c0c53654eb',
          'f3a53daa-6bf6-4242-ba8c-53d1a1c3b337'
        ],
      },
    },
    {
      path: 'user-directory',
      loadChildren: () => import('../pages/organization-users/user-directory-organization/user-directory-organization.module')
        .then(m => m.UserDirectoryOrganizationModule),
      canActivate: [PermissionGaurdService, AuthGaurdService],
      data: {
        expectedPermissions: [
          '8b31ba09-b429-4bab-8aa2-1d598b7e2139',
          '19e10be9-12f1-4e92-a963-28c0c53654eb',
          'f3a53daa-6bf6-4242-ba8c-53d1a1c3b337'
        ],
      },
    },
    {
      path: 'preferences',
      loadChildren: () => import('../pages/organization-users/preferences/preferences.module')
        .then(m => m.PreferencesModule),
      canActivate: [PermissionGaurdService, AuthGaurdService],
      data: {
        expectedPermissions: [
          '8b31ba09-b429-4bab-8aa2-1d598b7e2139',
          '19e10be9-12f1-4e92-a963-28c0c53654eb',
          'f3a53daa-6bf6-4242-ba8c-53d1a1c3b337'
        ],
      },
    },
    {
      path: 'profile-organization',
      loadChildren: () => import('../pages/organization-users/profile-organization/profile-organization.module')
        .then(m => m.ProfileOrganizationModule),
      canActivate: [PermissionGaurdService, AuthGaurdService],
      data: {
        expectedPermissions: [
          '8b31ba09-b429-4bab-8aa2-1d598b7e2139',
          '19e10be9-12f1-4e92-a963-28c0c53654eb',
          'f3a53daa-6bf6-4242-ba8c-53d1a1c3b337'
        ],
      },
    }

  ],
}];

@NgModule({
  imports: [
    SharedModule,
    NbMenuModule,
    NgIdleKeepaliveModule.forRoot(),
    RouterModule.forChild(routes)
  ],
  declarations: [
    PagesComponent,
    ScrollTopComponent,
  ],
  exports: [RouterModule]
})
export class PagesModule {
  
}
