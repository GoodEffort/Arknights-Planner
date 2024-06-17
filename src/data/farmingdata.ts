// https://docs.google.com/spreadsheets/d/12X0uBQaN7MuuMWWDTiUjIni_MOP015GnulggmBJgBaQ/

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
    "3301",  // Skill Summarry - 1
    "3302",  // Skill Summarry - 2
    "3303",  // Skill Summarry - 3
    "4001",  // LMD
    "4006",  // Purchase Certificates
];

// ignore these crafting recipes in efficiency calc because they'll cause an infinite loop as they craft into each other
const farmingChips = [
    "3211", // Vanguard Chip
    "3221", // Guard Chip
    "3231", // Defender Chip
    "3241", // Sniper Chip
    "3251", // Caster Chip
    "3261", // Medic Chip
    "3271", // Supporter Chip
    "3281"  // Specialist Chip
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

export { efficientToFarmItemIds, chipIds };