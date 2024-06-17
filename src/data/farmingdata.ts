// https://docs.google.com/spreadsheets/d/12X0uBQaN7MuuMWWDTiUjIni_MOP015GnulggmBJgBaQ/
// https://gamepress.gg/arknights/news/arknights-material-farming-efficiency-best-stages-farm

// this was going to be a super cool api call using a library but then I realized I had to use a secret key and this is only front end so fuck that

// aim to use these mats to craft if possible
const efficientToFarmItemIds = [
    "30012", // Orirock Cube
    "30043", // Oriron Cluster
    "30063", // Integrated Device
    "30033", // Polyester Pack
    "30023", // Sugar Pack
    "30053", // Aketon
    "30103", // RMA70-12
    "30083", // Manganese Ore
    "30093", // Grindstone
    "30073", // Loxic Kohl
    "31013", // Coagulating Gel
    "31023", // Incandescent Alloy
    "31033", // Crystalline Component
    "31043", // Semi-Synthetic Solvent
    "31053", // Compound Cutting Fluid
    "31063", // Transmuted Salt
    "31073", // Fuscous Fiber
    "31083", // Aggregate Cyclicene
    "3301",  // Skill Summarry - 1
    "3302",  // Skill Summarry - 2
    "3303",  // Skill Summarry - 3
    "4001",  // LMD
    "4006",  // Purchase Certificates
];

const stages: { [key: string]: string } = {
    "30012": "1-7",             // Orirock Cube
    "30062": "10-4",            // Device
    "30063": "11-7",            // Integrated Device
    "30031": "S2-7",            // Ester
    "30032": "10-16",           // Polyester
    "30033": "7-4",             // Polyester Pack
    "30021": "S2-6",            // Sugar Substitute
    "30022": "11-2",            // Sugar
    "30023": "10-10",           // Sugar Pack
    "30041": "S2-8",            // Oriron Shard
    "30042": "M8-7",            // Oriron
    "30043": "10-11",           // Oriron Cluster
    "30051": "S2-9",            // Diketon
    "30052": "6-16",            // Polyketon
    "30053": "JT8-3",           // Aketon
    "30103": "4-9",             // RMA70-12
    "30083": "10-7",            // Manganese Ore
    "30093": "10-12",           // Grindstone
    "30073": "13-19 / 11-13",   // Loxic Kohl
    "31013": "10-3",            // Coagulating Gel
    "31023": "13-18 / 11-14",   // Incandescent Alloy
    "31033": "R8-11",           // Crystalline Component
    "31043": "12-10",           // Semi-Synthetic Solvent
    "31053": "12-17",           // Compound Cutting Fluid
    "31063": "11-15",           // Transmuted Salt
    "31073": "13-5",            // Fuscous Fiber
    "31083": "13-15",           // Aggregate Cyclicene
};

// ignore these crafting recipes in efficiency calc because they'll cause an infinite loop as they craft into each other
const farmingChips = [
    "3211", // Vanguard Chip
    "3212", // Vanguard Chip Pack
    "3221", // Guard Chip
    "3222", // Guard Chip Pack
    "3231", // Defender Chip
    "3232", // Defender Chip Pack
    "3241", // Sniper Chip
    "3242", // Sniper Chip Pack
    "3251", // Caster Chip
    "3252", // Caster Chip Pack
    "3261", // Medic Chip
    "3262", // Medic Chip Pack
    "3271", // Supporter Chip
    "3272", // Supporter Chip Pack
    "3281", // Specialist Chip
    "3282", // Specialist Chip Pack
];

const dualchips = [ 
    "3213", // Vanguard Dualchip
    "3223", // Guard Dualchip
    "3233", // Defender Dualchip
    "3243", // Sniper Dualchip
    "3253", // Caster Dualchip
    "3263", // Medic Dualchip
    "3273", // Supporter Dualchip
    "3283"  // Specialist Dualchip
];

const chipIds = farmingChips.concat(dualchips);
efficientToFarmItemIds.push(...chipIds);

export { efficientToFarmItemIds, dualchips, stages };