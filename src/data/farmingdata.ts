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
];

const chipIds = [ // ignore these because they'll cause an infinite loop as they craft into each other
    "3211", // Vanguard Chip
    "3213", // Vanguard Dualchip
    "3221", // Guard Chip
    "3223", // Guard Dualchip
    "3231", // Defender Chip
    "3233", // Defender Dualchip
    "3241", // Sniper Chip
    "3243", // Sniper Dualchip
    "3251", // Caster Chip
    "3253", // Caster Dualchip
    "3261", // Medic Chip
    "3263", // Medic Dualchip
    "3271", // Supporter Chip
    "3273", // Supporter Dualchip
    "3281", // Specialist Chip
    "3283", // Specialist Dualchip
];

export { efficientToFarmItemIds, chipIds };