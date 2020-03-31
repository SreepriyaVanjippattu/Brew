export class Permission {
    Id: string;
    Name: string;
    PermissionValue: number;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    Category: string;

    constructor() {
        this.Id = "";
        this.Name = "";
        this.PermissionValue = 0;
        this.IsActive = false;
    }
}

export class Role {
    Id: string;
    Name: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    Category: string;
    Permissions: Permission[];

    constructor() {
        this.Id = "";
        this.Name = "";
        this.IsActive = false;

        this.Permissions = [];
    }
}