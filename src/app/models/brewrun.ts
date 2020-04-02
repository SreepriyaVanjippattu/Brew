import { Guid } from 'guid-typescript';

export class BrewRunMashin {
    id: string;
    brewRunId: string;
    tenantId: string;
    recipeId :string;
    recipeName : string;
    userId : string;
    userName : string;
    tankId:string;
    tankName:string;

    maltGrainBillDetails: MaltGrainBillDetail[];
    waterAdditionDetails: WaterAdditionDetail[];
    mashingTargetDetails: MashingTargetDetail[];
    startchTest: StartchTest[];
    mashinDetailsNotes: MashinDetailsNote[];

}

export class BrewRun {
    Id: string;
    BrewRunId: string;
    StartTime: Date;
    EndTime: Date;
    RecipeId: string;
    TankId: string;
    UserId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    Status: string;
    RecipeName: string;
    TankName: string;
    UserName: string;

    MaltGrainBillDetails: MaltGrainBillDetail[];
    WaterAdditionDetails: WaterAdditionDetail[];
    MashingTargetDetails: MashingTargetDetail[];
    StartchTest: StartchTest[];
    MashinDetailsNotes: MashinDetailsNote[];

    Vorlauf: Vorlauf[];
    SpargeDetails: SpargeDetail[];
    FirstRunnings: FirstRunning[];
    LastRunnings: LastRunning[];
    KettleDataEntryDetails: KettleDataEntryDetail[];
    HopesDetails: HopesDetail[];
    AdjunctsDetails: AdjunctsDetail[];
    PostBoilData: PostBoilData[];
    WhirlPoolDataEntry: WhirlPoolDataEntry[];
    PostWhirlpoolDetails: PostWhirlpoolDetail[];
    CoolingKnockouDetails: CoolingKnockouDetail[];
    BrewLogDetailsNotes: BrewLogDetailsNote[];

    FermentationDataEntry: FermentationDataEntry[];
    YeastDataDetails: YeastDataDetail[];
    DiacetylRestDataDetails: DiacetylRestDataDetail[];
    AgingDetails: AgingDetail[];
    EnterFermentationData: EnterFermentationData[];
    FermentationDetailsNotes: FermentationDetailsNote[];

    ConditioningDetails: ConditioningDetail[];
    FilterationDetails: FilterationDetail[];
    CarbonationDetails: CarbonationDetail[];
    ConditioningDetailsNotes: ConditioningDetailsNote[];
    BrewRunCompletionDetails: BrewRunCompletionDetail[]

    constructor() {
        this.Id = Guid.raw();
        this.CreatedDate = new Date();
    }
}

export class MaltGrainBillDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    MaltGrainNameId: string;
    Type: string;
    CountryId: string;
    SupplierId: string;
    Quantity: number;
    QuantityUnitTypeId: string;
    Percentage: number;
    Srm: number;
    Potential: number;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.BrewId = "";
        this.RecipeId = "";
        this.MaltGrainNameId = "";
        this.Type = "";
        this.CountryId = "";
        this.SupplierId = "";
        this.Quantity = null;
        this.QuantityUnitTypeId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.Percentage = null;
        this.Srm = null;
        this.Potential = null;
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class WaterAdditionDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    Cacl2: number;
    Cacl2UnitId: string;
    Gypsum: number;
    GypsumUnitId: string;
    TableSalt: number;
    TableSaltUnitId: string;
    EpsomSalt: number;
    EpsomSaltUnitId: string;
    CaCo3: number;
    CaCo3unitId: string;
    BakingSodaName: string;
    BakingSoda: number;
    BakingSodaUnitId: string;
    H3po4: number;
    H3po4unitId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.BrewId = "";
        this.RecipeId = "";
        this.Cacl2 = null;
        this.Cacl2UnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.Gypsum = null;
        this.GypsumUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.TableSalt = null;
        this.TableSaltUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.EpsomSalt = null;
        this.EpsomSaltUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.CaCo3 = null;
        this.BakingSodaName = null;
        this.CaCo3unitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.BakingSoda = null;
        this.BakingSodaUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.H3po4 = null;
        this.H3po4unitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class MashingTargetDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    StrikeWaterVolume: number;
    StrikeWaterUnitTypeId: string;
    StrikeWaterTemperature: number;
    StrikeWaterTemperatureUnitTypeId: string;
    MashpH: number;
    Liquortogristratio: string;
    Temperature: boolean;
    StartTime: string;
    EndTime: Date;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;
    MashingTargetDetailsTemperature: MashingTargetDetailsTemperature[];

    constructor() {
        this.Id = Guid.raw();
        this.BrewId = "";
        this.RecipeId = "";
        this.StrikeWaterVolume = null;
        this.StrikeWaterUnitTypeId = '58c07c47-a13e-4464-bec8-628fe11f027a';
        this.StrikeWaterTemperature = null;
        this.StrikeWaterTemperatureUnitTypeId = "";
        this.Liquortogristratio = "";
        this.Temperature = false;
        this.MashpH = null;
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;


    }
}

export class MashingTargetDetailsTemperature {
    Id: string;
    BrewId: string;
    RecipeId: string;
    MashingTargeDetailstId: string;
    Temperature: number;
    TemperatureUnitTypeId: string;
    StartTime: string;
    EndTime: Date;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;

    constructor() {
        this.Id = Guid.raw();
        this.BrewId = "";
        this.RecipeId = "";
        this.Temperature = null;
        this.MashingTargeDetailstId = "";
        this.TemperatureUnitTypeId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
    }
}

export class StartchTest {
    Id: string;
    BrewId: string;
    RecipeId: string;
    PassStatus: boolean;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;
    StarchTestResultList: StarchTestResultList[];

    constructor() {
        this.Id = Guid.raw();
        this.PassStatus = false;
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
        this.StarchTestResultList = [];
    }
}

export class StarchTestResultList {
    Id: string;
    BrewId: string;
    RecipeId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    StarchTestId: string;
    TestName: string;
    TimeStamp: any;
    TestResult: string;

    constructor() {
        this.Id = Guid.raw();
        this.TestName = null;
        this.TimeStamp = new Date();
        this.TestResult = null;
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = new Date();
        this.TenantId = '';
    }
}

export class MashinDetailsNote {
    Id: string;
    BrewId: string;
    RecipeId: string;
    Notes: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;

    constructor() {
        this.Id = Guid.raw();
        this.Notes = "";

        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
    }
}

export class Vorlauf {
    Id: string;
    BrewId: string;
    RecipeId: string;
    StartTime: string;
    EndTime: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();

        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class SpargeDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    SpargeWaterTemperature: number;
    SpargeWaterTemperatureUnitId: string;
    SpargeTotalVolume: number;
    SpargeTotalVolumeUnitId: string;
    StartTime: string;
    EndTime: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.SpargeWaterTemperature = null;
        this.SpargeWaterTemperatureUnitId = "";
        this.SpargeTotalVolume = null;
        this.SpargeTotalVolumeUnitId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class FirstRunning {
    Id: string;
    BrewId: string;
    RecipeId: string;
    PlatoGravity: number;
    PlatoGravityUnitId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.PlatoGravity = null;
        this.PlatoGravityUnitId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class LastRunning {
    Id: string;
    BrewId: string;
    RecipeId: string;
    PlatoGravity: number;
    PlatoGravityUnitId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.PlatoGravity = null;

        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class KettleDataEntryDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    StartTime: string;
    EndTime: string;
    BoilLength: number;
    BoilLengthUnitId: string;
    VolumePreBoil: number;
    VolumePreBoilUnitId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.BoilLength = null;
        this.BoilLengthUnitId = "";
        this.VolumePreBoil = null;
        this.VolumePreBoilUnitId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class HopesDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    StartTime: any;
    EndTime: Date;
    Name: string;
    CountryId: string;
    SupplierId: string;
    Alpha: number;
    Quantity: number;
    QuantityUnitTypeId: string;
    AddInId: string;
    AdditionalHopesStatus: boolean;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.Name = "";
        this.StartTime = new Date();
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
        this.QuantityUnitTypeId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
    }
}

export class AdjunctsDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    Name: string;
    CountryId: string;
    SupplierId: string;
    Quantity: number;
    QuantityOptionId: string;
    AddInId: string;
    StartTime: any;
    AdditionalAdjunctsStatus: boolean;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;
    QuantityUnitTypeId: string;

    constructor() {
        this.Id = Guid.raw();
        this.Name = "";
        this.CountryId = "";
        this.SupplierId = "";
        this.Quantity = null;
        this.QuantityOptionId = "";
        this.AddInId = null;
        this.AdditionalAdjunctsStatus = false;
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
        this.QuantityUnitTypeId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
    }
}

export class PostBoilData {
    Id: string;
    BrewId: string;
    RecipeId: string;
    VolumePostBoil: number;
    VolumePostBoilOptionId: string;
    Plato: number;
    Ph: number;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.VolumePostBoil = null;
        this.VolumePostBoilOptionId = "";
        this.Plato = null;
        this.Ph = null;
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class WhirlPoolDataEntry {
    Id: string;
    BrewId: string;
    RecipeId: string;
    StartTime: string;
    EndTime: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();

        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class PostWhirlpoolDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    VolumeOut: number;
    VolumeOutOptionId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();

        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class CoolingKnockouDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    VolumeInFermentation: number;
    VolumeInFermentationOptionId: string;
    ActualTemperature: number;
    ActualTemperatureUnitId: string;
    StartTime: string;
    EndTime: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();

        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class BrewLogDetailsNote {
    Id: string;
    BrewId: string;
    RecipeId: string;
    Notes: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;

    constructor() {
        this.Id = Guid.raw();

        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
    }
}

export class FermentationDataEntry {
    Id: string;
    BrewId: string;
    RecipeId: string;
    VolumeIn: number;
    VolumeInUnitId: string;
    ActualTemperature: number;
    ActualTemperatureUnitId: string;
    ActualPressure: number;
    ActualPressureUnitId: string;
    ActualPh: number;
    ActualPlatoGravity: string;
    ActualPlatoGravityUnitId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.VolumeIn = null;
        this.VolumeInUnitId = '58c07c47-a13e-4464-bec8-628fe11f027a';
        this.ActualTemperature = null;
        this.ActualTemperatureUnitId = "";
        this.ActualPressure = null;
        this.ActualPressureUnitId = 'e05e1543-9b78-413a-bbd5-2621901ba3b9';
        this.ActualPh = null;
        this.ActualPlatoGravity = null;
        this.ActualPlatoGravityUnitId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class YeastDataDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    YeastStrainId: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    Generation: string;
    CellCount: string;
    Viability: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.YeastStrainId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.Generation = null;
        this.CellCount = null;
        this.Viability = null;
        this.IsCompleted = false;
    }
}

export class DiacetylRestDataDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    ActualTemperatureIn: number;
    ActualTemperatureInUnitId: string;
    PlatoGravityValue: number;
    PlatoGravityUnitId: string;
    StartTime: string;
    EndTime: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.ActualTemperatureIn = null;
        this.ActualTemperatureInUnitId = "";
        this.PlatoGravityValue = null;
        this.PlatoGravityUnitId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class AgingDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    ActualTemperatureIn: number;
    ActualTemperatureInUnitId: string;
    TimeDuration: number;
    TimeDurationUnitId: string;
    StartTime: string;
    EndTime: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.ActualTemperatureIn = null;
        this.ActualTemperatureInUnitId = "";
        this.TimeDuration = null;
        this.TimeDurationUnitId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class EnterFermentationData {
    Id: string;
    BrewId: string;
    RecipeId: string;
    DateAndTime: any;
    Plato: number;
    Temperature: number;
    TemperatureUnitId: string;
    Ph: number;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.DateAndTime = new Date();
        this.Plato = null;
        this.Temperature = null;
        this.TemperatureUnitId = "";
        this.Ph = null;
        this.Plato = null;
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;

    }
}

export class FermentationDetailsNote {
    Id: string;
    BrewId: string;
    RecipeId: string;
    Notes: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;

    constructor() {
        this.Id = Guid.raw();
        this.Notes = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
    }
}

export class ConditioningDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    VolumeIn: number;
    VolumeInOptionId: string;
    TemperatureIn: number;
    TemperatureUnitId: string;
    ActualPressure: number;
    ActualPressurUnitId: string;
    Ph: number;
    ActualPlato: number;
    Co2: number;
    StartTime: string;
    EndTime: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.VolumeIn = null;
        this.VolumeInOptionId = '58c07c47-a13e-4464-bec8-628fe11f027a';
        this.TemperatureIn = null;
        this.TemperatureUnitId = "";
        this.ActualPressure = null;
        this.ActualPressurUnitId = "";
        this.Ph = null;
        this.ActualPlato = null;
        this.Co2 = null;
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class FilterationDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    TemperatureIn: number;
    TemperatureUnitId: string;
    StartTime: Date;
    EndTime: Date;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.TemperatureIn = null;
        this.TemperatureUnitId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.IsCompleted = false;
    }
}

export class CarbonationDetail {
    Id: string;
    BrewId: string;
    RecipeId: string;
    Temperature: number;
    TemperatureUnitId: string;
    Pressure: number;
    PressureUnitId: string;
    StartTime: string;
    EndTime: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;
    PlatoUnitId: string;
    IsCompleted: boolean;

    constructor() {
        this.Id = Guid.raw();
        this.Temperature = null;
        this.TemperatureUnitId = "";
        this.Pressure = null;
        this.PressureUnitId = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
        this.PlatoUnitId = null;
        this.IsCompleted = false;
    }
}

export class ConditioningDetailsNote {
    Id: string;
    BrewId: string;
    RecipeId: string;
    Notes: string;
    IsActive: boolean;
    CreatedDate: Date;
    ModifiedDate: Date;
    TenantId: string;

    constructor() {
        this.Id = Guid.raw();
        this.Notes = "";
        this.IsActive = true;
        this.CreatedDate = new Date();
        this.ModifiedDate = null;
        this.TenantId = "";
    }
}

export class BrewRunCompletionDetail {

    Id: string;
    BrewRunId: string;
    Section: string;
    IsCompleted: boolean;
    CompletedDateTime: Date;
    CreatedBy: string;
    CreatedDateTimeString: string;


    constructor() {
        this.Id = Guid.raw();
        this.BrewRunId = "";
        this.Section = "";
        this.IsCompleted = false;
        this.CompletedDateTime = null;
        this.CreatedBy = "";
        this.CreatedDateTimeString = "";
    }
}
