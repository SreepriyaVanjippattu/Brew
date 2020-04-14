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

export class BrewRunLog{
    id: string;
    brewRunId: string;
    tenantId: string;
    recipeId :string;
    recipeName : string;
    userId : string;
    userName : string;
    tankId:string;
    tankName:string;
    hopesDetails: HopesDetail[];
    adjunctsDetails: AdjunctsDetail[];
    vorlauf: Vorlauf[];
    spargeDetails: SpargeDetail[];
    firstRunnings: FirstRunning[];
    lastRunnings: LastRunning[];
    kettleDataEntryDetails: KettleDataEntryDetail[];
    postBoilData: PostBoilData[];
    whirlPoolDataEntry: WhirlPoolDataEntry[];
    postWhirlpoolDetails: PostWhirlpoolDetail[];
    coolingKnockouDetails: CoolingKnockouDetail[];
    brewLogDetailsNotes: BrewLogDetailsNote[];
}

export class BrewRunFermentation{
    id: string;
    brewRunId: string;
    tenantId: string;
    recipeId :string;
    recipeName : string;
    userId : string;
    userName : string;
    tankId:string;
    tankName:string;
    hopesDetails: HopesDetail[];
    adjunctsDetails: AdjunctsDetail[];
    fermentationDataEntry: FermentationDataEntry[];
    yeastDataDetails: YeastDataDetail[];
    diacetylRestDataDetails: DiacetylRestDataDetail[];
    agingDetails: AgingDetail[];
    enterFermentationData: EnterFermentationData[];
    fermentationDetailsNotes: FermentationDetailsNote[];
}

export class BrewRunConditioning{
    id: string;
    brewRunId: string;
    tenantId: string;
    recipeId :string;
    recipeName : string;
    userId : string;
    userName : string;
    tankId:string;
    tankName:string;
    status: string;

    
    conditioningDetails: ConditioningDetail[];
    filterationDetails: FilterationDetail[];
    carbonationDetails: CarbonationDetail[];
    conditioningDetailsNotes: ConditioningDetailsNote[];
    crewRunCompletionDetails: BrewRunCompletionDetail[]
}



export class MaltGrainBillDetail {
    id: string;
    brewId: string;
    recipeId: string;
    maltGrainNameId: string;
    maltGrainTypeId: string;
    countryId: string;
    supplierId: string;
    quantity: number;
    quantityUnitId: string;
    percentage: number;
    srm: number;
    potential: number;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;
    maltGrainType: string;
    country : string;
    supplier: string;
    quantityUnit: string;
    completedUserId: string;
    maltGrainBillDetail: string;
    completedUserName:string;

    constructor() {
        this.id = Guid.raw();
        this.brewId = "";
        this.recipeId = "";
        this.maltGrainNameId = "";
        this.maltGrainTypeId = "";
        this.countryId = "";
        this.supplierId = "";
        this.quantity = null;
        this.quantityUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.percentage = null;
        this.srm = null;
        this.potential = null;
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}




export class BrewRun {
    id: string;
    brewRunId: string;
    startTime: Date;
    endTime: Date;
    recipeId: string;
    tankId: string;
    userId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    status: string;
    recipeName: string;
    tankName: string;
    userName: string;

    maltGrainBillDetails: MaltGrainBillDetail[];
    waterAdditionDetails: WaterAdditionDetail[];
    mashingTargetDetails: MashingTargetDetail[];
    startchTest: StartchTest[];
    mashinDetailsNotes: MashinDetailsNote[];

    vorlauf: Vorlauf[];
    spargeDetails: SpargeDetail[];
    firstRunnings: FirstRunning[];
    lastRunnings: LastRunning[];
    kettleDataEntryDetails: KettleDataEntryDetail[];
    hopesDetails: HopesDetail[];
    adjunctsDetails: AdjunctsDetail[];
    postBoilData: PostBoilData[];
    whirlPoolDataEntry: WhirlPoolDataEntry[];
    postWhirlpoolDetails: PostWhirlpoolDetail[];
    coolingKnockouDetails: CoolingKnockouDetail[];
    brewLogDetailsNotes: BrewLogDetailsNote[];

    fermentationDataEntry: FermentationDataEntry[];
    yeastDataDetails: YeastDataDetail[];
    diacetylRestDataDetails: DiacetylRestDataDetail[];
    agingDetails: AgingDetail[];
    enterFermentationData: EnterFermentationData[];
    fermentationDetailsNotes: FermentationDetailsNote[];

    conditioningDetails: ConditioningDetail[];
    filterationDetails: FilterationDetail[];
    carbonationDetails: CarbonationDetail[];
    conditioningDetailsNotes: ConditioningDetailsNote[];
    brewRunCompletionDetails: BrewRunCompletionDetail[]

    constructor() {
        this.id = Guid.raw();
        this.createdDate = new Date();
    }
}



export class WaterAdditionDetail {
    id: string;
    brewId: string;
    recipeId: string;
    cacl2: number;
    cacl2unitId: string;
    gypsum: number;
    gypsumUnitId: string;
    tableSalt: number;
    tableSaltUnitId: string;
    epsomSalt: number;
    epsomSaltUnitId: string;
    caCo3: number;
    caCo3unitId: string;
    bakingSodaName: string;
    bakingSoda: number;
    bakingSodaUnitId: string;
    h3po4: number;
    h3po4unitId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;
    completedUserId: string;
    completedUserName: string;
    cacl2unit : string;
    gypsumUnit: string;
    tableSaltUnit: string;
    epsomSaltUnit: string;
    caCo3unit: string;
    bakingSodaUnit: string;
    h3po4unit : string;

    constructor() {
        this.id = Guid.raw();
        this.brewId = "";
        this.recipeId = "";
        this.cacl2 = null;
        this.cacl2unitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.gypsum = null;
        this.gypsumUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.tableSalt = null;
        this.tableSaltUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.epsomSalt = null;
        this.epsomSaltUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.caCo3 = null;
        this.bakingSodaName = null;
        this.caCo3unitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.bakingSoda = null;
        this.bakingSodaUnitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.h3po4 = null;
        this.h3po4unitId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class MashingTargetDetail {
    id: string;
    brewId: string;
    recipeId: string;
    strikeWaterVolume: number;
    strikeWaterUnitTypeId: string;
    strikeWaterTemperature: number;
    strikeWaterTemperatureUnitTypeId: string;
    MashpH: number;
    liquortogristratio: string;
    temperature: boolean;
    startTime: string;
    endTime: Date;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;
    mashingTargetDetailsTemperature: MashingTargetDetailsTemperature[];
    completedUserId: string;
    completedUserName: string;
    strikeWaterUnitType: string;
    strikeWaterTemperatureUnitType: string;

    constructor() {
        this.id = Guid.raw();
        this.brewId = "";
        this.recipeId = "";
        this.strikeWaterVolume = null;
        this.strikeWaterUnitTypeId = '58c07c47-a13e-4464-bec8-628fe11f027a';
        this.strikeWaterTemperature = null;
        this.strikeWaterTemperatureUnitTypeId = "";
        this.liquortogristratio = "";
        this.temperature = false;
        this.MashpH = null;
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;


    }
}

export class MashingTargetDetailsTemperature {
    id: string;
    brewId: string;
    recipeId: string;
    mashingTargeDetailstId: string;
    temperature: number;
    temperatureUnitTypeId: string;
    startTime: string;
    endTime: Date;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    temperatureUnitType :string;

    constructor() {
        this.id = Guid.raw();
        this.brewId = "";
        this.recipeId = "";
        this.temperature = null;
        this.mashingTargeDetailstId = "";
        this.temperatureUnitTypeId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
    }
}

export class StartchTest {
    id: string;
    brewId: string;
    recipeId: string;
    PassStatus: boolean;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;
    starchTestResultList: StarchTestResultList[];
    completedUserId: string;
    completedUserName: string;

    constructor() {
        this.id = Guid.raw();
        this.PassStatus = false;
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
        this.starchTestResultList = [];
    }
}

export class StarchTestResultList {
    id: string;
    brewId: string;
    recipeId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    starchTestId: string;
    testName: string;
    timeStamp: any;
    testResult: string;

    constructor() {
        this.id = Guid.raw();
        this.testName = null;
        this.timeStamp = new Date();
        this.testResult = null;
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = new Date();
        this.tenantId = '';
    }
}

export class MashinDetailsNote {
    id: string;
    brewId: string;
    recipeId: string;
    notes: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;

    constructor() {
        this.id = Guid.raw();
        this.notes = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
    }
}

export class Vorlauf {
    id: string;
    brewId: string;
    recipeId: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();

        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class SpargeDetail {
    id: string;
    brewId: string;
    recipeId: string;
    spargeWaterTemperature: number;
    spargeWaterTemperatureUnitId: string;
    spargeTotalVolume: number;
    spargeTotalVolumeUnitId: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.spargeWaterTemperature = null;
        this.spargeWaterTemperatureUnitId = "";
        this.spargeTotalVolume = null;
        this.spargeTotalVolumeUnitId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class FirstRunning {
    id: string;
    brewId: string;
    recipeId: string;
    platoGravity: number;
    platoGravityUnitId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.platoGravity = null;
        this.platoGravityUnitId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class LastRunning {
    id: string;
    brewId: string;
    recipeId: string;
    platoGravity: number;
    platoGravityUnitId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.platoGravity = null;

        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class KettleDataEntryDetail {
    id: string;
    brewId: string;
    recipeId: string;
    startTime: string;
    endTime: string;
    boilLength: number;
    boilLengthUnitId: string;
    volumePreBoil: number;
    volumePreBoilUnitId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.boilLength = null;
        this.boilLengthUnitId = "";
        this.volumePreBoil = null;
        this.volumePreBoilUnitId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class HopesDetail {
    id: string;
    brewId: string;
    recipeId: string;
    startTime: any;
    endTime: Date;
    Name: string;
    countryId: string;
    supplierId: string;
    alpha: number;
    quantity: number;
    quantityUnitTypeId: string;
    addInId: string;
    additionalHopesStatus: boolean;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.Name = "";
        this.startTime = new Date();
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
        this.quantityUnitTypeId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
    }
}

export class AdjunctsDetail {
    id: string;
    brewId: string;
    recipeId: string;
    Name: string;
    countryId: string;
    supplierId: string;
    quantity: number;
    quantityOptionId: string;
    addInId: string;
    startTime: any;
    additionalAdjunctsStatus: boolean;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;
    quantityUnitTypeId: string;

    constructor() {
        this.id = Guid.raw();
        this.Name = "";
        this.countryId = "";
        this.supplierId = "";
        this.quantity = null;
        this.quantityOptionId = "";
        this.addInId = null;
        this.additionalAdjunctsStatus = false;
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
        this.quantityUnitTypeId = 'a6190eaa-8dc5-400c-a5f6-b72468fa3d5c';
    }
}

export class PostBoilData {
    id: string;
    brewId: string;
    recipeId: string;
    volumePostBoil: number;
    volumePostBoilOptionId: string;
    plato: number;
    ph: number;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.volumePostBoil = null;
        this.volumePostBoilOptionId = "";
        this.plato = null;
        this.ph = null;
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class WhirlPoolDataEntry {
    id: string;
    brewId: string;
    recipeId: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();

        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class PostWhirlpoolDetail {
    id: string;
    brewId: string;
    recipeId: string;
    volumeOut: number;
    volumeOutOptionId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();

        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class CoolingKnockouDetail {
    id: string;
    brewId: string;
    recipeId: string;
    volumeInFermentation: number;
    volumeInFermentationOptionId: string;
    actualTemperature: number;
    actualTemperatureUnitId: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();

        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class BrewLogDetailsNote {
    id: string;
    brewId: string;
    recipeId: string;
    notes: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;

    constructor() {
        this.id = Guid.raw();

        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
    }
}

export class FermentationDataEntry {
    id: string;
    brewId: string;
    recipeId: string;
    volumeIn: number;
    VolumeInUnitId: string;
    actualTemperature: number;
    actualTemperatureUnitId: string;
    actualpressure: number;
    ActualpressureUnitId: string;
    ActualPh: number;
    ActualPlatoGravity: string;
    ActualPlatoGravityUnitId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.volumeIn = null;
        this.VolumeInUnitId = '58c07c47-a13e-4464-bec8-628fe11f027a';
        this.actualTemperature = null;
        this.actualTemperatureUnitId = "";
        this.actualpressure = null;
        this.ActualpressureUnitId = 'e05e1543-9b78-413a-bbd5-2621901ba3b9';
        this.ActualPh = null;
        this.ActualPlatoGravity = null;
        this.ActualPlatoGravityUnitId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class YeastDataDetail {
    id: string;
    brewId: string;
    recipeId: string;
    YeastStrainId: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    Generation: string;
    CellCount: string;
    Viability: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.YeastStrainId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.Generation = null;
        this.CellCount = null;
        this.Viability = null;
        this.isCompleted = false;
    }
}

export class DiacetylRestDataDetail {
    id: string;
    brewId: string;
    recipeId: string;
    ActualTemperatureIn: number;
    ActualTemperatureInUnitId: string;
    PlatoGravityValue: number;
    platoGravityUnitId: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.ActualTemperatureIn = null;
        this.ActualTemperatureInUnitId = "";
        this.PlatoGravityValue = null;
        this.platoGravityUnitId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class AgingDetail {
    id: string;
    brewId: string;
    recipeId: string;
    ActualTemperatureIn: number;
    ActualTemperatureInUnitId: string;
    TimeDuration: number;
    TimeDurationUnitId: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.ActualTemperatureIn = null;
        this.ActualTemperatureInUnitId = "";
        this.TimeDuration = null;
        this.TimeDurationUnitId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class EnterFermentationData {
    id: string;
    brewId: string;
    recipeId: string;
    dateAndTime: any;
    plato: number;
    temperature: number;
    temperatureUnitId: string;
    ph: number;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.dateAndTime = new Date();
        this.plato = null;
        this.temperature = null;
        this.temperatureUnitId = "";
        this.ph = null;
        this.plato = null;
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;

    }
}

export class FermentationDetailsNote {
    id: string;
    brewId: string;
    recipeId: string;
    notes: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;

    constructor() {
        this.id = Guid.raw();
        this.notes = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
    }
}

export class ConditioningDetail {
    id: string;
    brewId: string;
    recipeId: string;
    volumeIn: number;
    volumeInOptionId: string;
    temperatureIn: number;
    temperatureUnitId: string;
    actualpressure: number;
    actualPressurUnitId: string;
    ph: number;
    actualPlato: number;
    Co2: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.volumeIn = null;
        this.volumeInOptionId = '58c07c47-a13e-4464-bec8-628fe11f027a';
        this.temperatureIn = null;
        this.temperatureUnitId = "";
        this.actualpressure = null;
        this.actualPressurUnitId = "";
        this.ph = null;
        this.actualPlato = null;
        this.Co2 = null;
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class FilterationDetail {
    id: string;
    brewId: string;
    recipeId: string;
    temperatureIn: number;
    temperatureUnitId: string;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.temperatureIn = null;
        this.temperatureUnitId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.isCompleted = false;
    }
}

export class CarbonationDetail {
    id: string;
    brewId: string;
    recipeId: string;
    temperature: number;
    temperatureUnitId: string;
    pressure: number;
    pressureUnitId: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;
    platoUnitId: string;
    isCompleted: boolean;

    constructor() {
        this.id = Guid.raw();
        this.temperature = null;
        this.temperatureUnitId = "";
        this.pressure = null;
        this.pressureUnitId = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
        this.platoUnitId = null;
        this.isCompleted = false;
    }
}

export class ConditioningDetailsNote {
    id: string;
    brewId: string;
    recipeId: string;
    notes: string;
    isActive: boolean;
    createdDate: Date;
    modifiedDate: Date;
    tenantId: string;

    constructor() {
        this.id = Guid.raw();
        this.notes = "";
        this.isActive = true;
        this.createdDate = new Date();
        this.modifiedDate = null;
        this.tenantId = "";
    }
}

export class BrewRunCompletionDetail {

    id: string;
    brewRunId: string;
    section: string;
    isCompleted: boolean;
    CompletedDateTime: Date;
    createdBy: string;
    createdDateTimeString: string;


    constructor() {
        this.id = Guid.raw();
        this.brewRunId = "";
        this.section = "";
        this.isCompleted = false;
        this.CompletedDateTime = null;
        this.createdBy = "";
        this.createdDateTimeString = "";
    }
}
