type LevelingCost = {
    level: number;
    exp: number;
    lmd: number;
}

const elite1Costs: LevelingCost[] = [
    { level: 1, exp: 0, lmd: 0 },
    { level: 2, exp: 100, lmd: 30 },
    { level: 3, exp: 117, lmd: 36 },
    { level: 4, exp: 134, lmd: 43 },
    { level: 5, exp: 151, lmd: 50 },
    { level: 6, exp: 168, lmd: 57 },
    { level: 7, exp: 185, lmd: 65 },
    { level: 8, exp: 202, lmd: 73 },
    { level: 9, exp: 219, lmd: 81 },
    { level: 10, exp: 236, lmd: 90 },
    { level: 11, exp: 253, lmd: 99 },
    { level: 12, exp: 270, lmd: 108 },
    { level: 13, exp: 287, lmd: 118 },
    { level: 14, exp: 304, lmd: 128 },
    { level: 15, exp: 321, lmd: 138 },
    { level: 16, exp: 338, lmd: 149 },
    { level: 17, exp: 355, lmd: 160 },
    { level: 18, exp: 371, lmd: 182 },
    { level: 19, exp: 389, lmd: 206 },
    { level: 20, exp: 406, lmd: 231 },
    { level: 21, exp: 423, lmd: 258 },
    { level: 22, exp: 440, lmd: 286 },
    { level: 23, exp: 457, lmd: 315 },
    { level: 24, exp: 474, lmd: 346 },
    { level: 25, exp: 491, lmd: 378 },
    { level: 26, exp: 508, lmd: 411 },
    { level: 27, exp: 525, lmd: 446 },
    { level: 28, exp: 542, lmd: 482 },
    { level: 29, exp: 559, lmd: 520 },
    { level: 30, exp: 574, lmd: 557 },
    { level: 31, exp: 589, lmd: 595 },
    { level: 32, exp: 605, lmd: 635 },
    { level: 33, exp: 621, lmd: 677 },
    { level: 34, exp: 637, lmd: 720 },
    { level: 35, exp: 653, lmd: 764 },
    { level: 36, exp: 669, lmd: 809 },
    { level: 37, exp: 685, lmd: 856 },
    { level: 38, exp: 701, lmd: 904 },
    { level: 39, exp: 716, lmd: 952 },
    { level: 40, exp: 724, lmd: 992 },
    { level: 41, exp: 739, lmd: 1042 },
    { level: 42, exp: 749, lmd: 1086 },
    { level: 43, exp: 759, lmd: 1131 },
    { level: 44, exp: 770, lmd: 1178 },
    { level: 45, exp: 783, lmd: 1229 },
    { level: 46, exp: 804, lmd: 1294 },
    { level: 47, exp: 820, lmd: 1353 },
    { level: 48, exp: 836, lmd: 1413 },
    { level: 49, exp: 852, lmd: 1474 },
    { level: 50, exp: 888, lmd: 1572 }
];

const elite2Costs: LevelingCost[] = [
    { level: 1, exp: 0, lmd: 0 },
    { level: 2, exp: 120, lmd: 48 },
    { level: 3, exp: 172, lmd: 71 },
    { level: 4, exp: 224, lmd: 95 },
    { level: 5, exp: 276, lmd: 120 },
    { level: 6, exp: 328, lmd: 146 },
    { level: 7, exp: 380, lmd: 173 },
    { level: 8, exp: 432, lmd: 201 },
    { level: 9, exp: 484, lmd: 231 },
    { level: 10, exp: 536, lmd: 262 },
    { level: 11, exp: 588, lmd: 293 },
    { level: 12, exp: 640, lmd: 326 },
    { level: 13, exp: 692, lmd: 361 },
    { level: 14, exp: 744, lmd: 396 },
    { level: 15, exp: 796, lmd: 432 },
    { level: 16, exp: 848, lmd: 470 },
    { level: 17, exp: 900, lmd: 508 },
    { level: 18, exp: 952, lmd: 548 },
    { level: 19, exp: 1004, lmd: 589 },
    { level: 20, exp: 1056, lmd: 631 },
    { level: 21, exp: 1108, lmd: 675 },
    { level: 22, exp: 1160, lmd: 719 },
    { level: 23, exp: 1212, lmd: 765 },
    { level: 24, exp: 1264, lmd: 811 },
    { level: 25, exp: 1316, lmd: 859 },
    { level: 26, exp: 1368, lmd: 908 },
    { level: 27, exp: 1420, lmd: 958 },
    { level: 28, exp: 1472, lmd: 1010 },
    { level: 29, exp: 1524, lmd: 1062 },
    { level: 30, exp: 1576, lmd: 1116 },
    { level: 31, exp: 1628, lmd: 1171 },
    { level: 32, exp: 1706, lmd: 1245 },
    { level: 33, exp: 1784, lmd: 1322 },
    { level: 34, exp: 1862, lmd: 1400 },
    { level: 35, exp: 1940, lmd: 1480 },
    { level: 36, exp: 2018, lmd: 1562 },
    { level: 37, exp: 2096, lmd: 1645 },
    { level: 38, exp: 2174, lmd: 1731 },
    { level: 39, exp: 2252, lmd: 1817 },
    { level: 40, exp: 2330, lmd: 1906 },
    { level: 41, exp: 2408, lmd: 1996 },
    { level: 42, exp: 2584, lmd: 2171 },
    { level: 43, exp: 2760, lmd: 2349 },
    { level: 44, exp: 2936, lmd: 2531 },
    { level: 45, exp: 3112, lmd: 2717 },
    { level: 46, exp: 3288, lmd: 2907 },
    { level: 47, exp: 3464, lmd: 3100 },
    { level: 48, exp: 3640, lmd: 3298 },
    { level: 49, exp: 3816, lmd: 3499 },
    { level: 50, exp: 3992, lmd: 3705 },
    { level: 51, exp: 4168, lmd: 3914 },
    { level: 52, exp: 4344, lmd: 4127 },
    { level: 53, exp: 4520, lmd: 4344 },
    { level: 54, exp: 4696, lmd: 4565 },
    { level: 55, exp: 4890, lmd: 4807 },
    { level: 56, exp: 5326, lmd: 5294 },
    { level: 57, exp: 6019, lmd: 6049 },
    { level: 58, exp: 6312, lmd: 6413 },
    { level: 59, exp: 6505, lmd: 6681 },
    { level: 60, exp: 6838, lmd: 7098 },
    { level: 61, exp: 7391, lmd: 7753 },
    { level: 62, exp: 7657, lmd: 8116 },
    { level: 63, exp: 7823, lmd: 8378 },
    { level: 64, exp: 8089, lmd: 8752 },
    { level: 65, exp: 8355, lmd: 9132 },
    { level: 66, exp: 8621, lmd: 9518 },
    { level: 67, exp: 8887, lmd: 9909 },
    { level: 68, exp: 9153, lmd: 10306 },
    { level: 69, exp: 9419, lmd: 10709 },
    { level: 70, exp: 9605, lmd: 11027 },
    { level: 71, exp: 9951, lmd: 11533 },
    { level: 72, exp: 10448, lmd: 12224 },
    { level: 73, exp: 10945, lmd: 12926 },
    { level: 74, exp: 11442, lmd: 13639 },
    { level: 75, exp: 11939, lmd: 14363 },
    { level: 76, exp: 12436, lmd: 15097 },
    { level: 77, exp: 12933, lmd: 15843 },
    { level: 78, exp: 13430, lmd: 16599 },
    { level: 79, exp: 13927, lmd: 17367 },
    { level: 80, exp: 14549, lmd: 18303 }
];

const elite3Costs: LevelingCost[] = [
    { level: 1, exp: 0, lmd: 0 },
    { level: 2, exp: 191, lmd: 76 },
    { level: 3, exp: 303, lmd: 124 },
    { level: 4, exp: 415, lmd: 173 },
    { level: 5, exp: 527, lmd: 225 },
    { level: 6, exp: 639, lmd: 279 },
    { level: 7, exp: 751, lmd: 334 },
    { level: 8, exp: 863, lmd: 392 },
    { level: 9, exp: 975, lmd: 451 },
    { level: 10, exp: 1087, lmd: 513 },
    { level: 11, exp: 1199, lmd: 577 },
    { level: 12, exp: 1311, lmd: 642 },
    { level: 13, exp: 1423, lmd: 710 },
    { level: 14, exp: 1535, lmd: 780 },
    { level: 15, exp: 1647, lmd: 851 },
    { level: 16, exp: 1759, lmd: 925 },
    { level: 17, exp: 1871, lmd: 1001 },
    { level: 18, exp: 1983, lmd: 1079 },
    { level: 19, exp: 2095, lmd: 1159 },
    { level: 20, exp: 2207, lmd: 1240 },
    { level: 21, exp: 2319, lmd: 1324 },
    { level: 22, exp: 2431, lmd: 1410 },
    { level: 23, exp: 2543, lmd: 1498 },
    { level: 24, exp: 2655, lmd: 1588 },
    { level: 25, exp: 2767, lmd: 1680 },
    { level: 26, exp: 2879, lmd: 1773 },
    { level: 27, exp: 2991, lmd: 1869 },
    { level: 28, exp: 3103, lmd: 1967 },
    { level: 29, exp: 3215, lmd: 2067 },
    { level: 30, exp: 3327, lmd: 2169 },
    { level: 31, exp: 3439, lmd: 2273 },
    { level: 32, exp: 3602, lmd: 2413 },
    { level: 33, exp: 3765, lmd: 2556 },
    { level: 34, exp: 3928, lmd: 2702 },
    { level: 35, exp: 4091, lmd: 2851 },
    { level: 36, exp: 4254, lmd: 3003 },
    { level: 37, exp: 4417, lmd: 3158 },
    { level: 38, exp: 4580, lmd: 3316 },
    { level: 39, exp: 4743, lmd: 3477 },
    { level: 40, exp: 4906, lmd: 3640 },
    { level: 41, exp: 5069, lmd: 3807 },
    { level: 42, exp: 5232, lmd: 3976 },
    { level: 43, exp: 5395, lmd: 4149 },
    { level: 44, exp: 5558, lmd: 4324 },
    { level: 45, exp: 5721, lmd: 4502 },
    { level: 46, exp: 5884, lmd: 4684 },
    { level: 47, exp: 6047, lmd: 4868 },
    { level: 48, exp: 6210, lmd: 5055 },
    { level: 49, exp: 6373, lmd: 5245 },
    { level: 50, exp: 6536, lmd: 5438 },
    { level: 51, exp: 6699, lmd: 5634 },
    { level: 52, exp: 6902, lmd: 5867 },
    { level: 53, exp: 7105, lmd: 6103 },
    { level: 54, exp: 7308, lmd: 6343 },
    { level: 55, exp: 7511, lmd: 6587 },
    { level: 56, exp: 7714, lmd: 6835 },
    { level: 57, exp: 7917, lmd: 7086 },
    { level: 58, exp: 8120, lmd: 7340 },
    { level: 59, exp: 8323, lmd: 7599 },
    { level: 60, exp: 8526, lmd: 7861 },
    { level: 61, exp: 8729, lmd: 8127 },
    { level: 62, exp: 9163, lmd: 8613 },
    { level: 63, exp: 9597, lmd: 9108 },
    { level: 64, exp: 10031, lmd: 9610 },
    { level: 65, exp: 10465, lmd: 10120 },
    { level: 66, exp: 10899, lmd: 10637 },
    { level: 67, exp: 11333, lmd: 11163 },
    { level: 68, exp: 11767, lmd: 11696 },
    { level: 69, exp: 12201, lmd: 12238 },
    { level: 70, exp: 12729, lmd: 12882 },
    { level: 71, exp: 13069, lmd: 13343 },
    { level: 72, exp: 13747, lmd: 14159 },
    { level: 73, exp: 14425, lmd: 14988 },
    { level: 74, exp: 15103, lmd: 15828 },
    { level: 75, exp: 15781, lmd: 16681 },
    { level: 76, exp: 16459, lmd: 17545 },
    { level: 77, exp: 17137, lmd: 18422 },
    { level: 78, exp: 17815, lmd: 19311 },
    { level: 79, exp: 18493, lmd: 20213 },
    { level: 80, exp: 19171, lmd: 21126 },
    { level: 81, exp: 19849, lmd: 22092 },
    { level: 82, exp: 21105, lmd: 23722 },
    { level: 83, exp: 22361, lmd: 25380 },
    { level: 84, exp: 23617, lmd: 27065 },
    { level: 85, exp: 24873, lmd: 28778 },
    { level: 86, exp: 26129, lmd: 30519 },
    { level: 87, exp: 27385, lmd: 32287 },
    { level: 88, exp: 28641, lmd: 34083 },
    { level: 89, exp: 29897, lmd: 35906 },
    { level: 90, exp: 31143, lmd: 37745 }
];

export { elite1Costs, elite2Costs, elite3Costs };