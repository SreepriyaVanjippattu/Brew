export class Permission {
    id: string;
    name: string;
    permissionValue: number;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    category: string;

    constructor() {
        this.id = "";
        this.name = "";
        this.permissionValue = 0;
        this.isActive = false;
    }
}

export class Role {
    id: string;
    name: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    category: string;
    permissions: Permission[];

    constructor() {
        this.id = "";
        this.name = "";
        this.isActive = false;
        this.permissions = [];
    }
}