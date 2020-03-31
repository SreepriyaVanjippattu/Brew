import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Role, Permission } from '../../../../models/permission';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'organization-previleges',
  templateUrl: './organization-previleges.component.html',
  styleUrls: ['./organization-previleges.component.scss']
})
export class OrganizationPrevilegesComponent implements OnInit {
  labelHeading: any = [];
  rolePermisson: any = [];
  rolePrevilegeContent;
  rolePermissionContent = [];
  saveeditRolePermission: any;
  uncheckedsRole: any = [];
  count: number = 0;
  allPermissions: Permission[];
  allAvailableRoles: Role[];
  allCategories: string[];
  editRolePermission: Permission[];
  editRolePermissionStatus: boolean = false;
  isChecked: boolean;
  params: string;
  allAvailableRolesSorted: any = [];
  constructor(
    private apiService: ApiProviderService,
    private toastrService: NbToastrService,
    private router: Router,


  ) { }

  ngOnInit() {
    this.isChecked = false;
    this.getAllRolePrevileges();
    this.getRolePrevilegesDetails();
  }

  getAllRolePrevileges() {
    const output = [];
    this.apiService.getData(this.apiService.getAllActiveRoles).subscribe(response => {
      this.allAvailableRoles = response['body'];
      this.allAvailableRoles.forEach(element => {
        if (element.Id != '81db4ad1-863b-4310-a0be-04042d2b30e0' && element.Id != '2e4606ca-7700-4578-94bd-cda3728d22ac')
          this.allAvailableRolesSorted.push(element)
      });
    }, error => {
      console.error(error);
    });
  }

  getRolePrevilegesDetails() {
    const output = [];
    this.apiService.getData(this.apiService.getAllPermissions).subscribe(response => {
      this.allPermissions = response['body'];
      this.allCategories = this.allPermissions.map(item => item.Category)
        .filter((value, index, self) => self.indexOf(value) === index && value != null);
    }, error => {
      console.error(error);
    });
  }

  shouldCheckThisItem(sRole: Role, aPerm: Permission): boolean {

    let retVal = false;
    if (sRole.Permissions.length > 0) {
      const theActualPermissions = sRole.Permissions.filter(x => x.Id == aPerm.Id);
      if (theActualPermissions.length > 0) {
        retVal = true;
      }
    }
    return retVal;
  }

  getPermissionsInCategory(category: string): Permission[] {
    return this.allPermissions.filter(x => x.Category === category);
  }


  addRemovePermission(sRole: Role, aPerm: Permission, e): void {


    if (e.target.checked == false) {
      this.uncheckedsRole.push(sRole);
    }
    let posToRemove = -1;
    sRole.Permissions.forEach((permission: Permission, index: number) => {

      if (permission.Id == aPerm.Id) {
        posToRemove = index;
      }
    });

    if (posToRemove >= 0) {
      sRole.Permissions.splice(posToRemove, 1);
    } else {
      sRole.Permissions.push(aPerm);
      this.rolePermisson.push(sRole);
    }


    this.saveeditRolePermission = this.rolePermisson;
    this.editRolePermissionStatus = true;


  }


  saveRolePriviledge() {

    this.saveeditRolePermission.forEach(elementroleperm => {
      this.uncheckedsRole.forEach((elementsrole, indexsrole) => {
        if (elementsrole.Id == elementroleperm.Id) {
          let posToRemove = indexsrole;
          this.uncheckedsRole.splice(posToRemove, 1)
        }
      });
    });


    let final = [];

    // To remove duplite objects in the array
    var obj = {};

    for (var i = 0, len = this.rolePermisson.length; i < len; i++)
      obj[this.rolePermisson[i]['Id']] = this.rolePermisson[i];

    this.rolePermisson = new Array();
    for (var key in obj)
      this.rolePermisson.push(obj[key]);
    // To remove duplite objects in the array

    final.push(this.uncheckedsRole)
    final.push(this.rolePermisson)


    final.forEach(element => {
      this.apiService.putData(this.apiService.editRoles, JSON.stringify(element)).subscribe((response: any) => {
        if (response.status === 200) {


        }
      });
    });


    this.toastrService.show('Role Previlege Saved', 'Success');
    this.router.navigate(['app/role-privileges']);

  }

  toastr() {
    this.toastrService.show('Role Previlege Saved', 'Success');
    this.router.navigate(['app/role-privileges']);
  }
  cancelRolePriviledge() {
    this.ngOnInit();
  }
}
