import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Menu, X, ChevronDown, ChevronRight, Edit2, Eye, Download, Save, FileText, Loader } from 'lucide-react';
import { generateDIFProposalPDF } from './pdfExport';
// DistrictMap is lazy-loaded only when user clicks "Load Interactive Map"
const LazyDistrictMap = React.lazy(() => import('./DistrictMap'));

// PARCEL DATA - Route 9 Southborough
const ROUTE9_PARCELS = [
  {id:"F_657826_2935490",addr:"0 BOSTON ROAD",totalVal:10300,bldgVal:0,landVal:10300,acres:2.08,useCode:"132",owner:"BEAR BLUFF-SOUTHBOROUGH LLC"},
  {id:"F_649797_2936512",addr:"1 BOSTON ROAD",totalVal:589500,bldgVal:331700,landVal:250900,acres:0.27,useCode:"325",owner:"CM LAMY LLC"},
  {id:"F_653676_2940530",addr:"142 BOSTON ROAD",totalVal:7821700,bldgVal:0,landVal:7821700,acres:1492,useCode:"915",owner:"DEPT OF CONSERVATION AND RECREATION"},
  {id:"F_654331_2935347",addr:"146 BOSTON ROAD",totalVal:792300,bldgVal:523400,landVal:250000,acres:1.32,useCode:"109",owner:"GOW, IAN A"},
  {id:"F_654725_2935287",addr:"154 BOSTON ROAD",totalVal:1131100,bldgVal:881500,landVal:249600,acres:1.29,useCode:"101",owner:"CASSIDY MATTHEW E"},
  {id:"F_650462_2935970",addr:"16 BOSTON ROAD",totalVal:632500,bldgVal:320600,landVal:295100,acres:0.35,useCode:"104",owner:"ZANIBONI SHARON A AND KATHLEEN"},
  {id:"F_650723_2936138",addr:"18 BOSTON ROAD",totalVal:2716700,bldgVal:1848400,landVal:792200,acres:3.97,useCode:"960",owner:"ROMAN CATHOLIC BISHOP OF WORCESTER"},
  {id:"F_650022_2936178",addr:"21 BOSTON ROAD",totalVal:350400,bldgVal:140600,landVal:205800,acres:0.46,useCode:"340",owner:"21 BOSTON ROAD LLC"},
  {id:"F_650997_2936411",addr:"24 A BOSTON ROAD",totalVal:768700,bldgVal:768700,landVal:0,acres:0,useCode:"102",owner:"FARLEY DANIEL AND SUZANNE"},
  {id:"F_658679_2935378",addr:"251 BOSTON ROAD",totalVal:1005100,bldgVal:704100,landVal:280100,acres:1,useCode:"316",owner:"GENZYME CORPORATION"},
  {id:"F_658324_2935239",addr:"252 BOSTON ROAD",totalVal:603900,bldgVal:366100,landVal:235600,acres:0.67,useCode:"101",owner:"HART DONALD L JR"},
  {id:"F_650201_2935980",addr:"29 BOSTON ROAD",totalVal:795700,bldgVal:108200,landVal:252600,acres:0.32,useCode:"334",owner:"29 BOSTON ROAD LLC"},
  {id:"F_651220_2936049",addr:"32 BOSTON ROAD",totalVal:560100,bldgVal:263400,landVal:296700,acres:0.39,useCode:"104",owner:"CORBETT KEVIN J"},
  {id:"F_650405_2935831",addr:"35 BOSTON ROAD",totalVal:577500,bldgVal:257000,landVal:300600,acres:0.49,useCode:"101",owner:"MAURO, JOHN D JR TRUSTEE"},
  {id:"F_651334_2936074",addr:"36 BOSTON ROAD",totalVal:565200,bldgVal:261400,landVal:303800,acres:0.57,useCode:"101",owner:"EASO FNU JEESO GEORGE AND"},
  {id:"F_650536_2935769",addr:"37 BOSTON ROAD",totalVal:494600,bldgVal:172300,landVal:301100,acres:0.5,useCode:"101",owner:"BANNON, MICHAEL D AND JEANNE L"},
  {id:"F_651504_2936161",addr:"38 BOSTON ROAD",totalVal:885300,bldgVal:536800,landVal:329100,acres:1.59,useCode:"101",owner:"ALFORD, JONATHAN L AND HILARY J"},
  {id:"F_650650_2935790",addr:"39 BOSTON ROAD",totalVal:464000,bldgVal:166000,landVal:295000,acres:0.34,useCode:"101",owner:"JOHNSON ALEX M AND KATHLEEN R"},
  {id:"F_650034_2936458",addr:"4 BOSTON ROAD",totalVal:628200,bldgVal:320000,landVal:294400,acres:0.33,useCode:"104",owner:"MISSAGGIA KENDAL & ALEC"},
  {id:"F_650750_2935806",addr:"41 BOSTON ROAD",totalVal:606200,bldgVal:305100,landVal:295100,acres:0.35,useCode:"101",owner:"CHENGAT ROGER AND JILU"},
  {id:"F_651644_2936080",addr:"42 BOSTON ROAD",totalVal:545700,bldgVal:243500,landVal:300000,acres:0.48,useCode:"101",owner:"ANDERSON, NED AND MAJA"},
  {id:"F_650879_2935848",addr:"43 BOSTON ROAD",totalVal:553300,bldgVal:238700,landVal:298900,acres:0.45,useCode:"101",owner:"ASAAD, SHAWKAT SHOKRY"},
  {id:"F_651007_2935871",addr:"45 BOSTON ROAD",totalVal:508800,bldgVal:216300,landVal:292500,acres:0.28,useCode:"101",owner:"OLEARY, MICHAEL J AND DIANE E"},
  {id:"F_651797_2936101",addr:"46 BOSTON ROAD",totalVal:663000,bldgVal:161200,landVal:462300,acres:1.59,useCode:"104",owner:"BORELLI, PRIMO III AND LAURA A"},
  {id:"F_651107_2935880",addr:"47 BOSTON ROAD",totalVal:758700,bldgVal:468100,landVal:290600,acres:0.23,useCode:"101",owner:"ALMASO JEHAD"},
  {id:"F_651035_2935620",addr:"49 BOSTON ROAD",totalVal:5225300,bldgVal:4137300,landVal:980300,acres:4.92,useCode:"970",owner:"SOUTHBOROUGH HOUSING AUTHORITY"},
  {id:"F_651332_2935867",addr:"51 BOSTON ROAD",totalVal:589300,bldgVal:294200,landVal:295100,acres:0.35,useCode:"101",owner:"LEMIEUX DEBORAH Q"},
  {id:"F_651474_2935856",addr:"53 BOSTON ROAD",totalVal:630100,bldgVal:335300,landVal:294800,acres:0.34,useCode:"101",owner:"PERKINS MELISSA"},
  {id:"F_651798_2935869",addr:"59 BOSTON ROAD",totalVal:682600,bldgVal:378100,landVal:294600,acres:0.33,useCode:"104",owner:"STRAZ JUSTIN T AND WENDI A"},
  {id:"F_651972_2936067",addr:"BOSTON ROAD",totalVal:3800,bldgVal:0,landVal:3800,acres:0.51,useCode:"929",owner:"COMMONWEALTH OF MASS"},
  {id:"F_649883_2936375",addr:"BOSTON ROAD",totalVal:5800,bldgVal:0,landVal:5800,acres:0.72,useCode:"392",owner:"LAMY CHRISTOPHER M"},
  {id:"F_654069_2935177",addr:"BOSTON ROAD",totalVal:1600,bldgVal:0,landVal:1600,acres:0.21,useCode:"930",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"F_658800_2935531",addr:"BOSTON ROAD",totalVal:2100,bldgVal:0,landVal:2100,acres:0.34,useCode:"915",owner:"DEPT OF CONSERVATION AND RECREATION"},
  {id:"F_655556_2934765",addr:"BOSTON ROAD",totalVal:68100,bldgVal:0,landVal:68100,acres:11.11,useCode:"950",owner:"SOUTHBOROUGH OPEN LAND FOUNDATION"},
  {id:"F_650041_2935956",addr:"BOSTON ROAD OFF",totalVal:30400,bldgVal:0,landVal:30400,acres:1.04,useCode:"392",owner:"NEW YORK CENTRAL LINES LLC"},
  {id:"F_647665_2936432",addr:"COMMON & MAIN STREET",totalVal:403600,bldgVal:0,landVal:348600,acres:0.74,useCode:"930",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"F_648154_2936342",addr:"1 CORDAVILLE ROAD",totalVal:490800,bldgVal:222000,landVal:268800,acres:0.44,useCode:"970",owner:"SOUTHBOROUGH HOUSING AUTHORITY"},
  {id:"F_648293_2935028",addr:"11 CORDAVILLE ROAD",totalVal:3569000,bldgVal:251900,landVal:3249700,acres:17.28,useCode:"931",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"F_648764_2935823",addr:"28 CORDAVILLE ROAD",totalVal:23234300,bldgVal:20804200,landVal:1843700,acres:11.65,useCode:"934",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"F_648180_2936180",addr:"3 CORDAVILLE ROAD",totalVal:991400,bldgVal:688500,landVal:302900,acres:0.55,useCode:"101",owner:"DONAHUE, CHRISTINE J"},
  {id:"F_648939_2935328",addr:"32 CORDAVILLE ROAD",totalVal:19874400,bldgVal:18372200,landVal:983600,acres:4.22,useCode:"931",owner:"SOUTHBOROUGH, TOWN OF"},
  {id:"F_649414_2934374",addr:"36 CORDAVILLE ROAD",totalVal:6615900,bldgVal:252400,landVal:5853200,acres:55.7,useCode:"931",owner:"SOUTHBOROUGH, TOWN OF"},
  {id:"F_648206_2936040",addr:"5 CORDAVILLE ROAD",totalVal:1013000,bldgVal:736200,landVal:276800,acres:0.67,useCode:"101",owner:"GARAPATI SHIVARAMAKRISHNA"},
  {id:"F_648178_2935875",addr:"7 CORDAVILLE ROAD",totalVal:695800,bldgVal:367500,landVal:328300,acres:1.54,useCode:"101",owner:"WARFIELD, JOHN H AND"},
  {id:"F_648274_2935640",addr:"9 CORDAVILLE ROAD",totalVal:2894200,bldgVal:2304300,landVal:473900,acres:1.69,useCode:"931",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"F_650053_2936787",addr:"10 EAST MAIN STREET",totalVal:578500,bldgVal:288500,landVal:287400,acres:0.15,useCode:"101",owner:"LI BRYAN"},
  {id:"F_650094_2936637",addr:"11 EAST MAIN STREET",totalVal:376600,bldgVal:141600,landVal:235000,acres:0.31,useCode:"104",owner:"QUIRK, MARY S"},
  {id:"F_650118_2936891",addr:"12 EAST MAIN STREET",totalVal:1045400,bldgVal:775300,landVal:270100,acres:0.79,useCode:"112",owner:"BARTOLINI MARGUERITE F TRS"},
  {id:"F_650188_2936684",addr:"13 EAST MAIN STREET",totalVal:447300,bldgVal:154500,landVal:292800,acres:0.29,useCode:"101",owner:"THIBAUD, STEVEN E AND"},
  {id:"F_650170_2937084",addr:"14 EAST MAIN STREET",totalVal:409000,bldgVal:121300,landVal:278200,acres:1.11,useCode:"352",owner:"NSVPI REALTY LL"},
  {id:"F_650278_2936735",addr:"15 EAST MAIN STREET",totalVal:667900,bldgVal:359900,landVal:293100,acres:0.3,useCode:"101",owner:"PAUL, ROBERT E AND MARTHA P"},
  {id:"F_650335_2936961",addr:"16 EAST MAIN STREET",totalVal:434200,bldgVal:171800,landVal:252000,acres:0.31,useCode:"352",owner:"NSVPI REALTY LLC"},
  {id:"F_650359_2936778",addr:"17 EAST MAIN STREET",totalVal:600600,bldgVal:300500,landVal:290500,acres:0.23,useCode:"101",owner:"SEGARRA DANIEL J AND ALLA Y"},
  {id:"F_650154_2937258",addr:"18 EAST MAIN STREET",totalVal:470600,bldgVal:135600,landVal:322600,acres:1.16,useCode:"101",owner:"DALTON MELINDA"},
  {id:"F_650434_2936805",addr:"19 EAST MAIN STREET",totalVal:1277800,bldgVal:985000,landVal:290900,acres:0.24,useCode:"101",owner:"CHRISTENSEN ERIK D"},
  {id:"F_649686_2936670",addr:"2 EAST MAIN STREET",totalVal:256200,bldgVal:0,landVal:256200,acres:0.45,useCode:"390",owner:"BEMIS PETER"},
  {id:"F_650456_2937097",addr:"20 EAST MAIN STREET",totalVal:641300,bldgVal:348200,landVal:293100,acres:0.3,useCode:"101",owner:"LOVEN ZACHERY DALTON AND"},
  {id:"F_650513_2936826",addr:"21 EAST MAIN STREET",totalVal:544800,bldgVal:254000,landVal:288600,acres:0.18,useCode:"101",owner:"LAMY, CHRISTOPHER M"},
  {id:"F_650499_2936983",addr:"22 EAST MAIN STREET",totalVal:631600,bldgVal:331400,landVal:297800,acres:0.42,useCode:"101",owner:"LUGO SHARLENE"},
  {id:"F_650632_2936882",addr:"23 EAST MAIN STREET",totalVal:627100,bldgVal:332900,landVal:287000,acres:0.14,useCode:"101",owner:"HARVEY KEVIN A AND CAYSIE C"},
  {id:"F_650623_2937067",addr:"24 EAST MAIN STREET",totalVal:586600,bldgVal:269600,landVal:304000,acres:0.58,useCode:"101",owner:"NICHOLSON, PAUL"},
  {id:"F_650774_2936871",addr:"25 EAST MAIN STREET",totalVal:873000,bldgVal:565600,landVal:304000,acres:0.58,useCode:"101",owner:"TALBOT JULIE"},
  {id:"F_650764_2937093",addr:"26 EAST MAIN STREET",totalVal:465600,bldgVal:157000,landVal:308600,acres:0.7,useCode:"105",owner:"GENTILE MICHAEL P"},
  {id:"F_650892_2937120",addr:"28 EAST MAIN STREET",totalVal:739300,bldgVal:441800,landVal:297500,acres:0.41,useCode:"101",owner:"MUTALIK, PRAVEEN G AND KAREN M"},
  {id:"F_650891_2936889",addr:"29 EAST MAIN STREET",totalVal:609900,bldgVal:304300,landVal:293000,acres:0.29,useCode:"101",owner:"DREPANOS, PAUL N AND SARAH M"},
  {id:"F_650991_2937150",addr:"30 EAST MAIN STREET",totalVal:546400,bldgVal:249000,landVal:297400,acres:0.41,useCode:"101",owner:"MARGARITIS THAEA E"},
  {id:"F_650964_2936902",addr:"31 EAST MAIN STREET",totalVal:507300,bldgVal:212100,landVal:295200,acres:0.35,useCode:"101",owner:"LACH ELLIOT"},
  {id:"F_651066_2936922",addr:"33 EAST MAIN STREET",totalVal:1309300,bldgVal:1000700,landVal:304800,acres:0.6,useCode:"101",owner:"ARENA STEPHEN  L TR"},
  {id:"F_651135_2937209",addr:"34 EAST MAIN STREET",totalVal:1218900,bldgVal:851900,landVal:345500,acres:0.67,useCode:"101",owner:"FUREY, JONATHAN AND KELLY ANN"},
  {id:"F_651164_2936941",addr:"35 EAST MAIN STREET",totalVal:508600,bldgVal:187400,landVal:296900,acres:0.4,useCode:"101",owner:"BOLAND, WILLIAM J AND MARY CAITLIN"},
  {id:"F_651278_2937221",addr:"36 EAST MAIN STREET",totalVal:346400,bldgVal:0,landVal:346400,acres:0.69,useCode:"130",owner:"FUREY JONATHAN AND KELLY ANN"},
  {id:"F_651271_2936958",addr:"37 EAST MAIN STREET",totalVal:812700,bldgVal:484000,landVal:315900,acres:0.89,useCode:"101",owner:"BOLAND MATTHEW J"},
  {id:"F_651417_2936964",addr:"39 EAST MAIN STREET",totalVal:989400,bldgVal:678500,landVal:310900,acres:0.76,useCode:"101",owner:"BELTRAMINI, PAUL J AND"},
  {id:"F_651375_2937296",addr:"40 EAST MAIN STREET",totalVal:510700,bldgVal:206300,landVal:304400,acres:0.59,useCode:"101",owner:"MATTIOLI, FRANCIS J & ANNA U T"},
  {id:"F_651540_2936954",addr:"41 EAST MAIN STREET",totalVal:614900,bldgVal:317000,landVal:295600,acres:0.36,useCode:"101",owner:"ASPESI, STEPHEN P"},
  {id:"F_651467_2937304",addr:"42 EAST MAIN STREET",totalVal:1305700,bldgVal:992100,landVal:313600,acres:0.83,useCode:"101",owner:"LORD ADAM J AND MELISSA M"},
  {id:"F_651636_2936939",addr:"43 EAST MAIN STREET",totalVal:470900,bldgVal:160300,landVal:300200,acres:0.48,useCode:"101",owner:"ASPESI, STEPHEN P AND PETER M TRS"},
  {id:"F_651626_2937174",addr:"44 EAST MAIN STREET",totalVal:601900,bldgVal:301000,landVal:300900,acres:0.5,useCode:"101",owner:"GLEESON TIMOTHY P AND AMANDA E"},
  {id:"F_651723_2937176",addr:"46 EAST MAIN STREET",totalVal:507200,bldgVal:196400,landVal:298300,acres:0.43,useCode:"101",owner:"ALBRECHT, GEORGE W JR"},
  {id:"F_649848_2936705",addr:"6 EAST MAIN STREET",totalVal:662600,bldgVal:376900,landVal:256100,acres:0.43,useCode:"341",owner:"MARLBOROUGH SAVINGS BANK"},
  {id:"F_649951_2936560",addr:"7 EAST MAIN STREET",totalVal:551800,bldgVal:255600,landVal:289800,acres:0.21,useCode:"104",owner:"CORNER MAIN REALTY ASSOCIATES LLC"},
  {id:"F_649975_2936764",addr:"8 EAST MAIN STREET",totalVal:542600,bldgVal:253200,landVal:289400,acres:0.2,useCode:"101",owner:"MEDINE, ELIZABETH F TRUSTEE"},
  {id:"F_649992_2936588",addr:"9 EAST MAIN STREET",totalVal:384600,bldgVal:175100,landVal:209500,acres:0.07,useCode:"101",owner:"ANDERSON WESLEY B TRST"},
  {id:"F_650026_2936832",addr:"EAST MAIN STREET",totalVal:2200,bldgVal:0,landVal:2200,acres:0.05,useCode:"131",owner:"LI BRYAN"},
  {id:"F_650302_2937098",addr:"EAST MAIN STREET OFF",totalVal:5900,bldgVal:0,landVal:5900,acres:0.39,useCode:"131",owner:"NSVPI REALTY LLC"},
  {id:"F_651809_2937176",addr:"24 FRAMINGHAM ROAD",totalVal:641900,bldgVal:411200,landVal:230700,acres:0.51,useCode:"101",owner:"YEE THOMAS DAVID"},
  {id:"F_651640_2937363",addr:"28 FRAMINGHAM ROAD",totalVal:478800,bldgVal:228900,landVal:247000,acres:1.12,useCode:"101",owner:"SARNO BRETT M AND BENITA M"},
  {id:"F_651576_2937499",addr:"32 FRAMINGHAM ROAD",totalVal:1161900,bldgVal:930000,landVal:231900,acres:0.55,useCode:"101",owner:"KALYANARAMAN, ASHVIN"},
  {id:"F_651424_2937632",addr:"36 FRAMINGHAM ROAD",totalVal:974600,bldgVal:725600,landVal:249000,acres:1.25,useCode:"101",owner:"LAMSON JOSEF W AND TATIANA"},
  {id:"F_651391_2937828",addr:"42 FRAMINGHAM ROAD",totalVal:614000,bldgVal:385900,landVal:228100,acres:0.42,useCode:"101",owner:"REED ARTHUR AND KELLY"},
  {id:"F_651323_2937955",addr:"46 FRAMINGHAM ROAD",totalVal:496400,bldgVal:259900,landVal:232700,acres:0.57,useCode:"101",owner:"TOLANDER, KIMBERLY AND MATS"},
  {id:"F_651261_2938091",addr:"48 FRAMINGHAM ROAD",totalVal:444600,bldgVal:216100,landVal:228500,acres:0.43,useCode:"101",owner:"MERGENER ADAM R"},
  {id:"F_651188_2938202",addr:"50 FRAMINGHAM ROAD",totalVal:631900,bldgVal:370900,landVal:233800,acres:0.61,useCode:"101",owner:"FERRIS, ADAM"},
  {id:"F_651156_2938327",addr:"52 FRAMINGHAM ROAD",totalVal:561700,bldgVal:328500,landVal:233200,acres:0.59,useCode:"101",owner:"HAYASHI, ROSS"},
  {id:"F_651127_2938449",addr:"54 FRAMINGHAM ROAD",totalVal:618700,bldgVal:386000,landVal:232700,acres:0.57,useCode:"101",owner:"GAGNE, LORI ANN AND MARK R"},
  {id:"F_651097_2938571",addr:"56 FRAMINGHAM ROAD",totalVal:493500,bldgVal:260800,landVal:232700,acres:0.57,useCode:"101",owner:"THAYER, PAUL C JR"},
  {id:"F_651069_2938695",addr:"58 FRAMINGHAM ROAD",totalVal:232700,bldgVal:0,landVal:232700,acres:0.57,useCode:"130",owner:"CONNONI ROBERT L & ANNE M"},
  {id:"F_651040_2938817",addr:"60 FRAMINGHAM ROAD",totalVal:713500,bldgVal:480800,landVal:232700,acres:0.57,useCode:"101",owner:"PRASAD AVINASH"},
  {id:"F_651012_2938938",addr:"62 FRAMINGHAM ROAD",totalVal:151300,bldgVal:0,landVal:151300,acres:0.57,useCode:"130",owner:"CONNONI, ROBERT L AND ANNE M"},
  {id:"F_650430_2940090",addr:"82 FRAMINGHAM ROAD",totalVal:628900,bldgVal:395700,landVal:233200,acres:0.59,useCode:"101",owner:"LI, YAOKAI AND ZHIFAN DONG"},
  {id:"F_650327_2940163",addr:"84 FRAMINGHAM ROAD",totalVal:607100,bldgVal:369600,landVal:232700,acres:0.57,useCode:"101",owner:"AKISETTY KRANTHI  KUMAR"},
  {id:"F_650224_2940232",addr:"86 FRAMINGHAM ROAD",totalVal:667700,bldgVal:435000,landVal:232700,acres:0.57,useCode:"101",owner:"CAO TONG AND JIAO SHEN"},
  {id:"F_650806_2940178",addr:"89 FRAMINGHAM ROAD",totalVal:823300,bldgVal:556800,landVal:233800,acres:0.61,useCode:"101",owner:"COSTA HUMBERTO"},
  {id:"F_650983_2939063",addr:"FRAMINGHAM ROAD",totalVal:151300,bldgVal:0,landVal:151300,acres:0.57,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEN TRS"},
  {id:"F_650616_2939920",addr:"FRAMINGHAM ROAD",totalVal:234900,bldgVal:0,landVal:234900,acres:0.65,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEN"},
  {id:"F_650954_2939186",addr:"FRAMINGHAM ROAD",totalVal:151300,bldgVal:0,landVal:151300,acres:0.57,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEU"},
  {id:"F_650764_2939740",addr:"FRAMINGHAM ROAD",totalVal:233500,bldgVal:0,landVal:233500,acres:0.6,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEN"},
  {id:"F_650828_2939632",addr:"FRAMINGHAM ROAD",totalVal:151800,bldgVal:0,landVal:151800,acres:0.6,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEN"},
  {id:"F_650697_2939834",addr:"FRAMINGHAM ROAD",totalVal:233800,bldgVal:0,landVal:233800,acres:0.61,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEN"},
  {id:"F_650895_2939496",addr:"FRAMINGHAM ROAD",totalVal:151600,bldgVal:0,landVal:151600,acres:0.59,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEN"},
  {id:"F_650945_2939338",addr:"FRAMINGHAM ROAD",totalVal:151800,bldgVal:0,landVal:151800,acres:0.6,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEN"},
  {id:"F_650523_2940005",addr:"FRAMINGHAM ROAD",totalVal:235500,bldgVal:0,landVal:235500,acres:0.67,useCode:"130",owner:"KWAN, PETER AND AGNES KWAN WEN TRS"},
  {id:"F_647969_2936295",addr:"0 MAIN STREET",totalVal:800,bldgVal:0,landVal:800,acres:0.05,useCode:"131",owner:"MORRIS STEPHEN AND NANCY TRS"},
  {id:"F_648850_2936654",addr:"0 MAIN STREET",totalVal:6200,bldgVal:0,landVal:6200,acres:0.41,useCode:"132",owner:"RICHARD A HALLISEY, LP"},
  {id:"F_649558_2936565",addr:"1 MAIN STREET",totalVal:471600,bldgVal:221400,landVal:249500,acres:0.23,useCode:"093",owner:"SHERIDAN, PHIL BUILDING ASSOCIATION"},
  {id:"F_649221_2936279",addr:"10 MAIN STREET",totalVal:729800,bldgVal:382700,landVal:335500,acres:0.44,useCode:"101",owner:"HOKINSON, RAYMOND D AND MICHELE A"},
  {id:"F_649044_2936544",addr:"11 MAIN STREET",totalVal:2020800,bldgVal:1465700,landVal:440000,acres:1.6,useCode:"340",owner:"HALLISEY,  RICHARD A LP"},
  {id:"F_649207_2936160",addr:"12 MAIN STREET",totalVal:576600,bldgVal:216400,landVal:346900,acres:0.7,useCode:"101",owner:"HOKINSON RAYMOND DAVID AND"},
  {id:"F_649106_2936299",addr:"14 MAIN STREET",totalVal:751200,bldgVal:493900,landVal:253300,acres:0.35,useCode:"342",owner:"14 MAIN STREET DDC LLC"},
  {id:"F_648776_2936549",addr:"15 MAIN STREET",totalVal:1057300,bldgVal:697200,landVal:360100,acres:1.02,useCode:"105",owner:"CONNELL, KRISTEN"},
  {id:"F_649001_2936288",addr:"16 MAIN STREET",totalVal:623500,bldgVal:285300,landVal:338200,acres:0.5,useCode:"105",owner:"FLING TIMOTHY JAMES"},
  {id:"F_648657_2936585",addr:"17 MAIN STREET",totalVal:584800,bldgVal:245100,landVal:332700,acres:0.37,useCode:"904",owner:"ST MARKS SCHOOL OF SOUTHBOROUG"},
  {id:"F_648904_2936291",addr:"18 MAIN STREET",totalVal:620800,bldgVal:294200,landVal:326600,acres:0.23,useCode:"104",owner:"FLING TIMOTHY J"},
  {id:"F_648606_2936788",addr:"19 MAIN STREET",totalVal:729700,bldgVal:0,landVal:724700,acres:2.34,useCode:"947",owner:"ST MARKS SCHOOL OF"},
  {id:"F_649650_2936422",addr:"2 MAIN STREET",totalVal:394400,bldgVal:199900,landVal:175200,acres:0.26,useCode:"326",owner:"MAURO, STEVEN W TRUSTEE"},
  {id:"F_648780_2936260",addr:"22 MAIN STREET",totalVal:1165800,bldgVal:797500,landVal:348300,acres:0.73,useCode:"109",owner:"PARRY-GEORGE JOANNA"},
  {id:"F_648692_2936267",addr:"24 MAIN STREET",totalVal:552100,bldgVal:220400,landVal:331700,acres:0.35,useCode:"101",owner:"STANTON PATRICK AND DIANNA BELL"},
  {id:"F_648007_2936692",addr:"25 MAIN STREET",totalVal:4060200,bldgVal:3545900,landVal:370600,acres:1.72,useCode:"931",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"F_648586_2936275",addr:"26 MAIN STREET",totalVal:976800,bldgVal:608300,landVal:359800,acres:1,useCode:"941",owner:"ST MARKS SCHOOL"},
  {id:"F_648391_2936301",addr:"28 MAIN STREET",totalVal:1330200,bldgVal:789300,landVal:527300,acres:1.5,useCode:"954",owner:"SOUTHBOROUGH VILLAGE SOCIETY"},
  {id:"F_647288_2936520",addr:"29 MAIN STREET",totalVal:3698000,bldgVal:3265900,landVal:372300,acres:1.83,useCode:"960",owner:"ST MARKS CHURCH"},
  {id:"F_647053_2936688",addr:"31 MAIN STREET",totalVal:1821100,bldgVal:748900,landVal:741700,acres:4.36,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_648059_2936340",addr:"34 MAIN STREET",totalVal:708600,bldgVal:372500,landVal:336100,acres:0.45,useCode:"101",owner:"MCNALLY MICHAEL S"},
  {id:"F_647965_2936350",addr:"36 MAIN STREET",totalVal:693400,bldgVal:368300,landVal:325100,acres:0.2,useCode:"109",owner:"MORRIS STEPHEN AND NANCY TRS"},
  {id:"F_649578_2936407",addr:"4 MAIN STREET",totalVal:514200,bldgVal:282500,landVal:231300,acres:0.09,useCode:"325",owner:"PRAMUKH MAHANT REALTY LLC"},
  {id:"F_647856_2936337",addr:"40 MAIN STREET",totalVal:697900,bldgVal:446500,landVal:251400,acres:0.29,useCode:"031",owner:"MEJ MAIN STREET REALTY LLC"},
  {id:"F_647693_2936263",addr:"42 MAIN STREET",totalVal:631200,bldgVal:298200,landVal:333000,acres:0.38,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_647604_2936251",addr:"44 MAIN STREET",totalVal:920700,bldgVal:589000,landVal:328700,acres:0.28,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_647130_2935955",addr:"46 MAIN STREET",totalVal:54651500,bldgVal:53216300,landVal:1120700,acres:11,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_649459_2936620",addr:"5 MAIN STREET",totalVal:855400,bldgVal:546900,landVal:269000,acres:0.82,useCode:"325",owner:"OLD FIRE STATION LLC"},
  {id:"F_646831_2936120",addr:"54 MAIN STREET",totalVal:765200,bldgVal:421800,landVal:341400,acres:0.57,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_646731_2936102",addr:"56 MAIN STREET",totalVal:361000,bldgVal:0,landVal:339100,acres:0.52,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_649521_2936377",addr:"6 MAIN STREET",totalVal:575700,bldgVal:323400,landVal:252300,acres:0.17,useCode:"104",owner:"PATEL, VINOD"},
  {id:"F_649410_2936284",addr:"8 MAIN STREET",totalVal:676200,bldgVal:338000,landVal:338200,acres:0.5,useCode:"101",owner:"PROSPERI, WARREN C AND LUCIA R"},
  {id:"F_649320_2936477",addr:"9 MAIN STREET",totalVal:560200,bldgVal:281500,landVal:257100,acres:0.46,useCode:"340",owner:"TOTEM INVESTMENT PROPERTIES LL"},
  {id:"F_649364_2936779",addr:"MAIN STREET",totalVal:284100,bldgVal:0,landVal:284100,acres:1.67,useCode:"403",owner:"MASSACHUSETTS ELECTRIC CO"},
  {id:"F_647847_2935938",addr:"10 MIDDLE ROAD",totalVal:609600,bldgVal:264300,landVal:328500,acres:0.28,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_647745_2935858",addr:"12 MIDDLE ROAD",totalVal:562800,bldgVal:228700,landVal:334100,acres:0.4,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_647708_2935732",addr:"14 MIDDLE ROAD",totalVal:1069500,bldgVal:713600,landVal:355900,acres:0.91,useCode:"101",owner:"HICKEY JAMES H AND ERIN DORIS"},
  {id:"F_647650_2935618",addr:"16 MIDDLE ROAD",totalVal:360000,bldgVal:0,landVal:343000,acres:0.61,useCode:"130",owner:"KLEIN DS AND EA WETHERBEE TRS"},
  {id:"F_647584_2935519",addr:"18 MIDDLE ROAD",totalVal:1871300,bldgVal:1500900,landVal:350700,acres:0.79,useCode:"101",owner:"WETHERBEE (50%) ELIZABETH A TRS"},
  {id:"F_647957_2936215",addr:"2 MIDDLE ROAD",totalVal:519700,bldgVal:200900,landVal:309600,acres:1.25,useCode:"101",owner:"DWIGGINS, PAUL A AND CATHY P"},
  {id:"F_647848_2936183",addr:"4 MIDDLE ROAD",totalVal:615600,bldgVal:274300,landVal:330200,acres:0.31,useCode:"101",owner:"MORGAN CHRISTOPHER R"},
  {id:"F_647871_2936092",addr:"6 MIDDLE ROAD",totalVal:601900,bldgVal:255300,landVal:328500,acres:0.28,useCode:"940",owner:"FAY SCHOOL INC"},
  {id:"F_647885_2936011",addr:"8 MIDDLE ROAD",totalVal:528000,bldgVal:190000,landVal:334700,acres:0.42,useCode:"101",owner:"KAVANAUGH SUSAN H TRS"},
  {id:"F_646706_2934816",addr:"MIDDLE ROAD",totalVal:1434300,bldgVal:0,landVal:1434300,acres:52.59,useCode:"915",owner:"DEPT OF CONSERVATION AND RECREATION"},
  {id:"F_648372_2933062",addr:"MIDDLE ROAD",totalVal:797800,bldgVal:0,landVal:797800,acres:61.17,useCode:"915",owner:"DEPT OF CONSERVATION AND RECREATION"},
  {id:"F_649639_2936307",addr:"2 PARK STREET",totalVal:466100,bldgVal:213500,landVal:252600,acres:0.18,useCode:"104",owner:"PARK NORTH GROUP LLC"},
  {id:"F_650000_2935686",addr:"25 PARK STREET",totalVal:584400,bldgVal:220400,landVal:321100,acres:2.06,useCode:"101",owner:"STORLAZZI, MAURO, SCHNARE AND"},
  {id:"F_649544_2936226",addr:"3 PARK STREET",totalVal:467900,bldgVal:214600,landVal:253300,acres:0.2,useCode:"101",owner:"ASPESI, STEPHEN P"},
  {id:"F_649768_2936262",addr:"4 PARK STREET",totalVal:131400,bldgVal:0,landVal:131400,acres:0.45,useCode:"390",owner:"ASPESI, PETER M AND MARILYN M"},
  {id:"F_649678_2936117",addr:"5 PARK STREET",totalVal:793300,bldgVal:510600,landVal:266000,acres:0.73,useCode:"332",owner:"ASPESI, PETER M AND MARILYN M"},
  {id:"F_659695_2937828",addr:"1 PINE HILL ROAD",totalVal:1052200,bldgVal:721800,landVal:330400,acres:0.32,useCode:"101",owner:"HOPKINSON MICHAEL A AND"},
  {id:"F_659507_2938533",addr:"10 PINE HILL ROAD",totalVal:688800,bldgVal:306800,landVal:372700,acres:1.86,useCode:"101",owner:"CAREY, MARYJAYNE AND"},
  {id:"F_659830_2938785",addr:"11 PINE HILL ROAD",totalVal:1448600,bldgVal:1073800,landVal:374800,acres:2,useCode:"104",owner:"LACROIX STEVEN M"},
  {id:"F_659338_2938920",addr:"12 A PINE HILL ROAD",totalVal:1132200,bldgVal:819400,landVal:305900,acres:1.01,useCode:"101",owner:"COUKOS STEPHEN AND KRISTINA"},
  {id:"F_659412_2938770",addr:"12 PINE HILL ROAD",totalVal:1014400,bldgVal:631300,landVal:373500,acres:1.91,useCode:"101",owner:"FLEETWOOD CHAUNCEY AND MARI"},
  {id:"F_659643_2938913",addr:"13 PINE HILL ROAD",totalVal:1178500,bldgVal:818300,landVal:360200,acres:1.03,useCode:"101",owner:"GARGE PIYUSH AND GARGI"},
  {id:"F_659345_2939089",addr:"14 PINE HILL ROAD",totalVal:1049600,bldgVal:685800,landVal:360700,acres:1.06,useCode:"101",owner:"KERWIN JOHN F AND ASHLEY I.W."},
  {id:"F_659677_2939054",addr:"15 PINE HILL ROAD",totalVal:1497700,bldgVal:1103700,landVal:360100,acres:1.02,useCode:"101",owner:"TWELLMAN TAYLOR AND CHELSEA A"},
  {id:"F_659236_2939365",addr:"16 PINE HILL ROAD",totalVal:990900,bldgVal:609900,landVal:376900,acres:2.41,useCode:"101",owner:"FEMIA PAUL V TRS"},
  {id:"F_659849_2939121",addr:"17 PINE HILL ROAD",totalVal:1501100,bldgVal:1129200,landVal:368500,acres:1.58,useCode:"101",owner:"APTEKMAN DANIEL AND"},
  {id:"F_659706_2939322",addr:"19 PINE HILL ROAD",totalVal:1272800,bldgVal:890300,landVal:382500,acres:3.46,useCode:"101",owner:"LEE CHAN HOON AND CHEN LI"},
  {id:"F_659537_2939484",addr:"21 PINE HILL ROAD",totalVal:876600,bldgVal:511200,landVal:362400,acres:1.17,useCode:"101",owner:"KINGSLEY, JOHN D AND"},
  {id:"F_659462_2939625",addr:"23 PINE HILL ROAD",totalVal:1107200,bldgVal:737200,landVal:370000,acres:1.68,useCode:"101",owner:"LEI NING AND JINGMEI YANG"},
  {id:"F_659449_2939779",addr:"25 PINE HILL ROAD",totalVal:1098500,bldgVal:719900,landVal:375200,acres:2.08,useCode:"101",owner:"BAKER BRETT W AND VEENA M"},
  {id:"F_659384_2939973",addr:"27 PINE HILL ROAD",totalVal:1351700,bldgVal:976500,landVal:366000,acres:1.41,useCode:"101",owner:"BUTLER TIMOTHY A AND SHANNON J"},
  {id:"F_659095_2939906",addr:"28 PINE HILL ROAD",totalVal:1407600,bldgVal:965100,landVal:439100,acres:1.29,useCode:"101",owner:"MICHAS JAMES G AND SARA B TRS"},
  {id:"F_659344_2940246",addr:"29 PINE HILL ROAD",totalVal:1709500,bldgVal:1316400,landVal:368700,acres:1.59,useCode:"101",owner:"HAMEL MATTHEW"},
  {id:"F_659742_2938038",addr:"3 PINE HILL ROAD",totalVal:992100,bldgVal:643100,landVal:349000,acres:0.75,useCode:"104",owner:"CROATTI, DONALD J AND MARYANNE L"},
  {id:"F_659053_2940077",addr:"30 PINE HILL ROAD",totalVal:1497800,bldgVal:1061600,landVal:436200,acres:1.1,useCode:"101",owner:"NAGPAL HARI KRISHAN TRS"},
  {id:"F_659035_2940210",addr:"32 PINE HILL ROAD",totalVal:1420500,bldgVal:983000,landVal:435000,acres:1.02,useCode:"101",owner:"GARGE PRATYUSH AND ALKA"},
  {id:"F_659011_2940351",addr:"34 PINE HILL ROAD",totalVal:1540000,bldgVal:1104500,landVal:435500,acres:1.05,useCode:"101",owner:"YARALA, RAHUL R AND"},
  {id:"F_659412_2940632",addr:"35 PINE HILL ROAD",totalVal:1172400,bldgVal:794600,landVal:374400,acres:1.97,useCode:"101",owner:"HAMILTON, ALFRED C AND DIANA L WAINRIB"},
  {id:"F_658989_2940495",addr:"36 PINE HILL ROAD",totalVal:1561500,bldgVal:1097700,landVal:435200,acres:1.03,useCode:"101",owner:"GADDE SHRINIVAS AND"},
  {id:"F_659325_2940790",addr:"37 PINE HILL ROAD",totalVal:1107200,bldgVal:739400,landVal:364600,acres:1.32,useCode:"101",owner:"AVDOKHIN ALEXEY V AND ELENA"},
  {id:"F_658972_2940639",addr:"38 PINE HILL ROAD",totalVal:1479300,bldgVal:1034200,landVal:435000,acres:1.02,useCode:"101",owner:"STUKALIN, FELIX AND ANNA"},
  {id:"F_659309_2940953",addr:"39 PINE HILL ROAD",totalVal:1037500,bldgVal:637900,landVal:365200,acres:1.36,useCode:"101",owner:"LIU LING AND HANPING WU"},
  {id:"F_659462_2937684",addr:"4 PINE HILL ROAD",totalVal:676000,bldgVal:302800,landVal:373200,acres:1.89,useCode:"101",owner:"SALMAN MUSTAFA AND KIMBERLY RA"},
  {id:"F_659276_2941089",addr:"41 PINE HILL ROAD",totalVal:1040000,bldgVal:680100,landVal:359900,acres:1,useCode:"101",owner:"LIPMAN ALISA A"},
  {id:"F_659961_2941140",addr:"47 PINE HILL ROAD",totalVal:1270200,bldgVal:812400,landVal:457800,acres:3.55,useCode:"101",owner:"SHORT WILLIAM R TRS"},
  {id:"F_659795_2941379",addr:"49 PINE HILL ROAD",totalVal:1332100,bldgVal:864100,landVal:462600,acres:4.45,useCode:"101",owner:"SNYDER SUE P & RICHARD B TRS"},
  {id:"F_659812_2938323",addr:"7 PINE HILL ROAD",totalVal:360900,bldgVal:0,landVal:360900,acres:1.07,useCode:"130",owner:"SHAY JOSEPH F JR"},
  {id:"F_659849_2938545",addr:"9 PINE HILL ROAD",totalVal:1513100,bldgVal:1048300,landVal:365100,acres:1.35,useCode:"101",owner:"SHAY, JOSEPH F JR"},
  {id:"F_657966_2939684",addr:"PINE HILL ROAD",totalVal:47200,bldgVal:0,landVal:47200,acres:16.14,useCode:"950",owner:"PINE HILL MEADOW TRUST INC"},
  {id:"F_659381_2937366",addr:"PINE HILL ROAD",totalVal:16300,bldgVal:0,landVal:16300,acres:1.24,useCode:"131",owner:"MCCARTHY SCOTT W"},
  {id:"F_659418_2937239",addr:"PINE HILL ROAD OFF",totalVal:10400,bldgVal:0,landVal:10400,acres:0.69,useCode:"131",owner:"MCCARTHY, SCOTT W"},
  {id:"F_659433_2937131",addr:"PINE HILL ROAD OFF",totalVal:600,bldgVal:0,landVal:600,acres:0.08,useCode:"132",owner:"MCDONALD CHARLENE C AND"}
];

const USE_CODE_DESCRIPTIONS = {
  "031": "Mixed Use (Res+Comm)",
  "093": "Municipal/Fraternal",
  "101": "Single Family Residential",
  "102": "Condo",
  "104": "Two Family",
  "105": "Three Family",
  "109": "Multiple Houses",
  "112": "Apt (4-8 units)",
  "130": "Vacant Land",
  "131": "Vacant Land",
  "132": "Vacant Land",
  "314": "Restaurant/Bar",
  "316": "Mixed Use (Res+Comm)",
  "325": "Motel/Inn",
  "326": "Restaurant/Bar",
  "332": "Auto Repair/Service",
  "334": "Gasoline Station",
  "337": "Parking Lot",
  "340": "General Office",
  "341": "Bank",
  "342": "Medical Office",
  "352": "Retail/Service",
  "390": "Vacant Commercial",
  "391": "Vacant Commercial",
  "392": "Vacant Commercial",
  "403": "Utility",
  "013": "Multiple Use",
  "904": "Private School",
  "915": "Government/Institutional",
  "929": "Government/Institutional",
  "930": "Government/Institutional",
  "931": "Municipal Building/Land",
  "934": "Municipal Building/Land",
  "940": "Private School",
  "941": "Private School",
  "947": "Private School",
  "950": "Conservation/Open Space",
  "954": "Historical Society",
  "960": "Church/Religious",
  "970": "Housing Authority",
  "971": "Government/Institutional"
};

// Format currency
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0';
  return '$' + Math.round(val).toLocaleString();
};

// Format percentage
const formatPercent = (val) => (val * 100).toFixed(1) + '%';

// Section Components
const CoverSection = ({ data, setData }) => {
  const [edit, setEdit] = useState(false);
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Town of Southborough</h1>
          <h2 className="text-2xl text-blue-900 mb-4">Route 9 Corridor District Improvement Financing Program</h2>
          <p className="text-lg text-slate-700 font-semibold">Wastewater Infrastructure Investment</p>
        </div>
        <button onClick={() => setEdit(!edit)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">
          {edit ? <Eye size={18} /> : <Edit2 size={18} />}
          {edit ? 'View' : 'Edit'}
        </button>
      </div>

      <div className="border-t border-slate-300 pt-6">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Program Date</label>
            {edit ? (
              <input
                type="date"
                value={data.programDate}
                onChange={(e) => setData({...data, programDate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
              />
            ) : (
              <p className="text-lg text-slate-900 font-mono">{data.programDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Base Date (Valuation Date)</label>
            {edit ? (
              <input
                type="date"
                value={data.baseDate}
                onChange={(e) => setData({...data, baseDate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
              />
            ) : (
              <p className="text-lg text-slate-900 font-mono">{data.baseDate}</p>
            )}
          </div>
        </div>

        {edit ? (
          <textarea
            value={data.introduction}
            onChange={(e) => setData({...data, introduction: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm mb-4 h-32 font-mono"
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data.introduction}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DistrictMapWithFallback = () => {
  const [showInteractive, setShowInteractive] = useState(false);
  const [mapError, setMapError] = useState(false);

  return (
    <div className="bg-slate-50 border-2 border-slate-300 rounded p-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-slate-600 font-semibold">Proposed DIF District — Route 9 Corridor</p>
        {!mapError && (
          <button
            onClick={() => setShowInteractive(!showInteractive)}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            {showInteractive ? 'Show Static Map' : 'Load Interactive Map'}
          </button>
        )}
      </div>
      {showInteractive && !mapError ? (
        <React.Suspense fallback={
          <div className="h-96 bg-white border border-slate-300 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-slate-500 text-sm">Loading interactive map...</p>
            </div>
          </div>
        }>
          <LazyDistrictMap />
        </React.Suspense>
      ) : (
        <>
          <div className="bg-white border border-slate-300 rounded overflow-hidden">
            <img
              src="/district-map.png"
              alt="Southborough DIF Area Discussion Draft #2 — Route 9 Corridor showing proposed district boundaries along Boston Road/Route 9, bordered by Framingham, Westborough, and Ashland"
              className="w-full h-auto"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Discussion Draft #2 (2/15/26) — DIF area is within the 25% statutory limit (MGL Ch. 40Q §2). Southborough total area: 15.7 sq mi; 25% limit: 3.9 sq mi.</p>
        </>
      )}
    </div>
  );
};

const AboutDistrictSection = ({ data, setData }) => {
  const [edit, setEdit] = useState(false);
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">About the Development District</h2>
        <button onClick={() => setEdit(!edit)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">
          {edit ? <Eye size={18} /> : <Edit2 size={18} />}
          {edit ? 'View' : 'Edit'}
        </button>
      </div>

      <DistrictMapWithFallback />

      {edit ? (
        <textarea
          value={data.districtNarrative}
          onChange={(e) => setData({...data, districtNarrative: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-40 font-mono"
        />
      ) : (
        <div className="prose prose-sm max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data.districtNarrative}</p>
        </div>
      )}
    </div>
  );
};

const ParcelSection = ({ selectedParcels, setSelectedParcels, filteredParcels, searchTerm, setSearchTerm, sortBy, setSortBy }) => {
  const selectedParcelIds = new Set(selectedParcels.map(p => p.id));

  const stats = useMemo(() => {
    const totalVal = selectedParcels.reduce((sum, p) => sum + p.totalVal, 0);
    const totalAcres = selectedParcels.reduce((sum, p) => sum + p.acres, 0);
    const useCounts = {};
    selectedParcels.forEach(p => {
      useCounts[p.useCode] = (useCounts[p.useCode] || 0) + 1;
    });
    return { totalVal, totalAcres, count: selectedParcels.length, useCounts };
  }, [selectedParcels]);

  const usePieData = useMemo(() => {
    const data = [];
    Object.entries(stats.useCounts).forEach(([code, count]) => {
      data.push({ name: USE_CODE_DESCRIPTIONS[code] || code, value: count });
    });
    return data;
  }, [stats.useCounts]);

  const COLORS = ['#1a365d', '#2d5a8c', '#4a7ba7', '#6b9bc4', '#8bacdb', '#afc3e8', '#bccde8', '#c9d8f0'];

  const sortedParcels = useMemo(() => {
    let sorted = [...filteredParcels];
    if (sortBy === 'value') sorted.sort((a, b) => b.totalVal - a.totalVal);
    else if (sortBy === 'acres') sorted.sort((a, b) => b.acres - a.acres);
    else sorted.sort((a, b) => a.addr.localeCompare(b.addr));
    return sorted;
  }, [filteredParcels, sortBy]);

  const toggleParcel = (parcel) => {
    if (selectedParcelIds.has(parcel.id)) {
      setSelectedParcels(selectedParcels.filter(p => p.id !== parcel.id));
    } else {
      setSelectedParcels([...selectedParcels, parcel]);
    }
  };

  const toggleAll = () => {
    if (selectedParcels.length === filteredParcels.length) {
      setSelectedParcels([]);
    } else {
      setSelectedParcels(filteredParcels);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 space-y-6">
      <div className="p-8 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Parcel Information</h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold">Parcels Selected</p>
            <p className="text-3xl font-bold text-blue-900">{stats.count}</p>
            <p className="text-xs text-blue-600">of {ROUTE9_PARCELS.length} total</p>
          </div>
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p className="text-sm text-green-700 font-semibold">Total Assessed Value</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalVal)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded border border-purple-200">
            <p className="text-sm text-purple-700 font-semibold">Total Acres</p>
            <p className="text-3xl font-bold text-purple-900">{stats.totalAcres.toFixed(2)}</p>
            <p className="text-xs text-purple-600">% of town: {((stats.totalAcres / 14432) * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-orange-50 p-4 rounded border border-orange-200">
            <p className="text-sm text-orange-700 font-semibold">25% Limit Check</p>
            <p className={`text-lg font-bold ${stats.totalAcres <= (14432 * 0.25) ? 'text-green-900' : 'text-red-900'}`}>
              {((stats.totalAcres / (14432 * 0.25)) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-orange-600">Limit: 3,608 acres</p>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="Search by address or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded text-sm bg-white"
          >
            <option value="address">Sort by Address</option>
            <option value="value">Sort by Value (High to Low)</option>
            <option value="acres">Sort by Acres (High to Low)</option>
          </select>
        </div>

        {usePieData.length > 0 && (
          <div className="flex gap-8 items-center bg-slate-50 p-6 rounded border border-slate-200 mb-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name.split('(')[0]}: ${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-4">Parcel Use Type Breakdown</h3>
              <div className="space-y-2 text-sm">
                {usePieData.sort((a, b) => b.value - a.value).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{backgroundColor: COLORS[usePieData.indexOf(item) % COLORS.length]}}></div>
                      <span className="text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900">Parcels</h3>
          <button
            onClick={toggleAll}
            className="text-sm px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
          >
            {selectedParcels.length === filteredParcels.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50">
                <th className="text-left py-3 px-3 font-semibold text-slate-700 w-12"><input type="checkbox" onChange={toggleAll} checked={selectedParcels.length === filteredParcels.length} /></th>
                <th className="text-left py-3 px-3 font-semibold text-slate-700">Parcel ID</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-700">Address</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-700">Total Value</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-700">Acres</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-700">Use</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-700">Owner</th>
              </tr>
            </thead>
            <tbody>
              {sortedParcels.map((parcel) => (
                <tr key={parcel.id} className="border-b border-slate-200 hover:bg-blue-50">
                  <td className="py-3 px-3"><input type="checkbox" checked={selectedParcelIds.has(parcel.id)} onChange={() => toggleParcel(parcel)} /></td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-700">{parcel.id}</td>
                  <td className="py-3 px-3 text-slate-700">{parcel.addr}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900">{formatCurrency(parcel.totalVal)}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{parcel.acres.toFixed(2)}</td>
                  <td className="py-3 px-3 text-xs text-slate-600">{USE_CODE_DESCRIPTIONS[parcel.useCode]}</td>
                  <td className="py-3 px-3 text-xs text-slate-600">{parcel.owner.substring(0, 30)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FindingsSection = ({ data, setData, stats }) => {
  const [edit, setEdit] = useState(false);
  const findings = data.findings || {};

  const toggleFinding = (key) => {
    setData({
      ...data,
      findings: {
        ...findings,
        [key]: !findings[key]
      }
    });
  };

  const acreagePercent = (stats.totalAcres / 14432) * 100;

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Statement of Findings</h2>
        <button onClick={() => setEdit(!edit)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">
          {edit ? <Eye size={18} /> : <Edit2 size={18} />}
          {edit ? 'View' : 'Edit'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">MGL Chapter 40Q §2 Requirements:</span> The town must certify that the DIF district meets all statutory requirements, including acreage limits, appropriate valuation methods, and proper procedures.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={findings.finding1 || false}
            onChange={() => toggleFinding('finding1')}
            className="mt-1"
          />
          <span className="text-sm text-slate-700">
            <span className="font-semibold">Finding 1:</span> The district is appropriately defined and bounded as the Route 9 Corridor in Southborough, encompassing 64 parcels with total assessed value of {formatCurrency(stats.totalVal)}.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={findings.finding2 || false}
            onChange={() => toggleFinding('finding2')}
            className="mt-1"
          />
          <span className="text-sm text-slate-700">
            <span className="font-semibold">Finding 2:</span> The district acreage ({stats.totalAcres.toFixed(2)} acres, {acreagePercent.toFixed(2)}% of town) does not exceed 25% of total town area (14,432 acres).
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={findings.finding3 || false}
            onChange={() => toggleFinding('finding3')}
            className="mt-1"
          />
          <span className="text-sm text-slate-700">
            <span className="font-semibold">Finding 3:</span> The development program (wastewater infrastructure) meets the statutory definition of an appropriate development activity likely to generate substantial new assessed values.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={findings.finding4 || false}
            onChange={() => toggleFinding('finding4')}
            className="mt-1"
          />
          <span className="text-sm text-slate-700">
            <span className="font-semibold">Finding 4:</span> The financial plan demonstrates that the Invested Revenue District will generate sufficient tax revenues to fund the development program within a reasonable timeframe ({data.difTerm}-year term).
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={findings.finding5 || false}
            onChange={() => toggleFinding('finding5')}
            className="mt-1"
          />
          <span className="text-sm text-slate-700">
            <span className="font-semibold">Finding 5:</span> The town has followed all procedural requirements including town meeting vote and assessor certifications.
          </span>
        </label>
      </div>

      {edit ? (
        <textarea
          value={data.findingsNarrative || ''}
          onChange={(e) => setData({...data, findingsNarrative: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-32 font-mono"
          placeholder="Additional findings narrative..."
        />
      ) : data.findingsNarrative ? (
        <div className="prose prose-sm max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data.findingsNarrative}</p>
        </div>
      ) : null}
    </div>
  );
};

const DevelopmentProgramSection = ({ data, setData }) => {
  const [edit, setEdit] = useState(false);

  const updateComponent = (idx, key, value) => {
    const newComponents = [...data.projectComponents];
    newComponents[idx] = {...newComponents[idx], [key]: parseFloat(value) || 0};
    setData({...data, projectComponents: newComponents});
  };

  const totalCost = data.projectComponents.reduce((sum, c) => sum + c.cost, 0);

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Development Program</h2>
        <button onClick={() => setEdit(!edit)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">
          {edit ? <Eye size={18} /> : <Edit2 size={18} />}
          {edit ? 'View' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Project Components (Municipal Wastewater System)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50">
                <th className="text-left py-3 px-3 font-semibold text-slate-700">Component</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-700">Cost</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-700">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.projectComponents.map((comp, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="py-3 px-3 text-slate-700 font-medium">{comp.name}</td>
                  <td className="py-3 px-3 text-right">
                    {edit ? (
                      <input
                        type="number"
                        value={comp.cost / 1000000}
                        onChange={(e) => updateComponent(idx, 'cost', parseFloat(e.target.value) * 1000000)}
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-right font-mono text-sm"
                        placeholder="0"
                      />
                    ) : (
                      <span className="font-mono text-slate-900">{formatCurrency(comp.cost)}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">{((comp.cost / totalCost) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td className="py-3 px-3 font-bold text-slate-900">Total Project Cost</td>
                <td className="py-3 px-3 text-right font-bold text-lg text-slate-900 font-mono">{formatCurrency(totalCost)}</td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {edit ? (
        <div className="space-y-4 border-t pt-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Statement of Means and Objectives</label>
            <textarea
              value={data.meansAndObjectives}
              onChange={(e) => setData({...data, meansAndObjectives: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-20 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Plans for Relocation</label>
            <textarea
              value={data.relocationPlan}
              onChange={(e) => setData({...data, relocationPlan: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-16 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Plans for Housing</label>
            <textarea
              value={data.housingPlan}
              onChange={(e) => setData({...data, housingPlan: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-16 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Operation After Completion</label>
            <textarea
              value={data.operationPlan}
              onChange={(e) => setData({...data, operationPlan: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-16 font-mono"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6 border-t pt-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Statement of Means and Objectives</h3>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{data.meansAndObjectives}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Plans for Relocation</h3>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{data.relocationPlan}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Plans for Housing</h3>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{data.housingPlan}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Operation After Completion</h3>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{data.operationPlan}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FinancialPlanSection = ({ data, setData, stats, projectCost }) => {
  const [showDebtService, setShowDebtService] = useState(false);
  const [debtParams, setDebtParams] = useState({
    bondAmount: projectCost * 0.7,
    interestRate: 4.0,
    term: 20
  });

  // Calculate financial projections
  const projections = useMemo(() => {
    const baseYear = new Date(data.baseDate).getFullYear();
    const oav = stats.totalVal;
    const taxRate = data.taxRate / 1000;
    const growthRate = data.annualGrowthRate / 100;
    const captureRates = data.captureRates || [{years: 10, rate: 0.5}, {years: 15, rate: 0.25}];

    const data_arr = [];
    let cumulativeDifRevenue = 0;
    let totalNewGrowth = oav * taxRate;

    for (let i = 0; i < data.difTerm; i++) {
      const year = baseYear + i;
      const fyEnding = `FY${year + 1}`;

      // Calculate new growth revenue
      const newGrowthThisYear = totalNewGrowth * Math.pow(1 + growthRate, i);

      // Determine capture rate for this year
      let captureRate = 0.5;
      let yearsElapsed = 0;
      for (let rate of captureRates) {
        if (i < yearsElapsed + rate.years) {
          captureRate = rate.rate;
          break;
        }
        yearsElapsed += rate.years;
      }

      const difRevenue = newGrowthThisYear * captureRate;
      const toGeneralFund = newGrowthThisYear * (1 - captureRate);
      cumulativeDifRevenue += difRevenue;

      data_arr.push({
        year: i + 1,
        fyEnding,
        newGrowthRevenue: newGrowthThisYear,
        difRevenue,
        toGeneralFund,
        cumulativeDifRevenue,
        debtService: 0
      });
    }

    // Add debt service if applicable
    if (showDebtService && debtParams.bondAmount > 0) {
      const annualDebtService = debtParams.bondAmount * (debtParams.interestRate / 100) / (1 - Math.pow(1 + (debtParams.interestRate / 100), -debtParams.term));
      data_arr.forEach((row, idx) => {
        if (idx < debtParams.term) {
          row.debtService = annualDebtService;
        }
      });
    }

    return data_arr;
  }, [data.baseDate, data.taxRate, data.annualGrowthRate, data.captureRates, data.difTerm, stats.totalVal, showDebtService, debtParams]);

  const totalDifRevenue = projections[projections.length - 1]?.cumulativeDifRevenue || 0;
  const paybackYear = projections.find(p => p.cumulativeDifRevenue >= projectCost)?.year || null;

  const chartData = projections.map(p => ({
    year: p.year,
    cumulative: Math.round(p.cumulativeDifRevenue / 1000000),
    projectCost: Math.round(projectCost / 1000000)
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 space-y-6">
      <div className="p-8 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Financial Plan</h2>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded mb-6 grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">DIF Term (Years)</label>
            <input
              type="range"
              min="20"
              max="30"
              value={data.difTerm}
              onChange={(e) => setData({...data, difTerm: parseInt(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>20</span>
              <span className="font-bold text-slate-900">{data.difTerm}</span>
              <span>30</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tax Rate (per $1,000)</label>
            <input
              type="number"
              step="0.01"
              value={data.taxRate}
              onChange={(e) => setData({...data, taxRate: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm"
            />
            <p className="text-xs text-slate-600 mt-1">Southborough FY2025: $13.81</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Annual New Growth Rate (%)</label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={data.annualGrowthRate}
              onChange={(e) => setData({...data, annualGrowthRate: parseFloat(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>1%</span>
              <span className="font-bold text-slate-900">{data.annualGrowthRate.toFixed(1)}%</span>
              <span>10%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Original Assessed Value (OAV)</label>
            <p className="text-lg font-bold text-slate-900 font-mono">{formatCurrency(stats.totalVal)}</p>
            <p className="text-xs text-slate-600 mt-1">{stats.count} selected parcels</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded">
          <h3 className="font-semibold text-slate-900 mb-4">Tax Increment Capture Configuration</h3>
          <div className="space-y-3">
            {(data.captureRates || []).map((rate, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-slate-700">Years 1-{rate.years}</label>
                </div>
                <div className="w-32">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={rate.rate * 100}
                    onChange={(e) => {
                      const newRates = [...(data.captureRates || [])];
                      newRates[idx].rate = parseFloat(e.target.value) / 100;
                      setData({...data, captureRates: newRates});
                    }}
                    className="w-full"
                  />
                </div>
                <div className="w-16 text-right">
                  <span className="font-bold text-slate-900">{(rate.rate * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded">
          <h3 className="font-semibold text-slate-900 mb-4">Funding Sources</h3>
          <p className="text-sm text-slate-600 mb-4">DIF is one component of a comprehensive funding strategy. Edit percentages below to model different funding scenarios.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-white">
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Funding Source</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">%</th>
                </tr>
              </thead>
              <tbody>
                {(data.fundingSources || []).map((source, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-100'}>
                    <td className="py-2 px-3 text-slate-900 text-sm">{source.name}</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={source.percent}
                        onChange={(e) => {
                          const newSources = [...(data.fundingSources || [])];
                          newSources[idx].percent = parseFloat(e.target.value);
                          setData({...data, fundingSources: newSources});
                        }}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-right font-mono text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-white">
                  <td className="py-2 px-3 font-bold text-slate-900">Total</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">{(data.fundingSources || []).reduce((sum, s) => sum + s.percent, 0).toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="p-8 bg-slate-50">
        <h3 className="font-semibold text-slate-900 mb-4">Revenue Comparison — With and Without DIF</h3>
        <p className="text-sm text-slate-600 mb-4">This table demonstrates that the General Fund receives THE SAME revenue regardless of DIF. The DIF only captures the INCREMENT above baseline growth.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-white">
                <th className="text-left py-2 px-3 font-semibold text-slate-700">Year</th>
                <th className="text-center py-2 px-3 font-semibold text-slate-700">FY Ending</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">No DIF — GF Deposit</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">With DIF — Total Receipts</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">With DIF — GF Deposit</th>
                <th className="text-right py-2 px-3 font-semibold text-blue-700">Tax Increment for DIF</th>
                <th className="text-right py-2 px-3 font-semibold text-green-700">Net DIF Benefit</th>
              </tr>
            </thead>
            <tbody>
              {projections.slice(0, Math.min(28, data.difTerm)).map((row, idx) => {
                const baselineGFDeposit = row.newGrowthRevenue;
                const withDifTotalReceipts = row.newGrowthRevenue;
                const withDifGFDeposit = row.toGeneralFund;
                const taxIncrementForDif = row.difRevenue;
                const netBenefit = row.newGrowthRevenue - baselineGFDeposit;
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-100 border-b border-slate-200'}>
                    <td className="py-2 px-3 text-slate-900 font-semibold">{row.year}</td>
                    <td className="py-2 px-3 text-slate-700 text-center">{row.fyEnding}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-900">{formatCurrency(baselineGFDeposit)}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-900">{formatCurrency(withDifTotalReceipts)}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">{formatCurrency(withDifGFDeposit)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-blue-900">{formatCurrency(taxIncrementForDif)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-green-900">{formatCurrency(netBenefit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 bg-slate-50">
        <h3 className="font-semibold text-slate-900 mb-4">{data.difTerm}-Year Revenue Projection</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-white">
                <th className="text-left py-2 px-3 font-semibold text-slate-700">Year</th>
                <th className="text-center py-2 px-3 font-semibold text-slate-700">FY Ending</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">New Growth Revenue</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">DIF Revenue (Captured)</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">To General Fund</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-700">Cumulative DIF</th>
              </tr>
            </thead>
            <tbody>
              {projections.slice(0, Math.min(30, data.difTerm)).map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-100 border-b border-slate-200'}>
                  <td className="py-2 px-3 text-slate-900 font-semibold">{row.year}</td>
                  <td className="py-2 px-3 text-slate-700 text-center">{row.fyEnding}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-900">{formatCurrency(row.newGrowthRevenue)}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-blue-900">{formatCurrency(row.difRevenue)}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">{formatCurrency(row.toGeneralFund)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-green-900">{formatCurrency(row.cumulativeDifRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8">
        <h3 className="font-semibold text-slate-900 mb-4">Revenue vs. Project Cost</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis label={{ value: 'Million $', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `$${value}M`} />
            <Legend />
            <Area type="monotone" dataKey="cumulative" stroke="#059669" fill="#d1fae5" name="Cumulative DIF Revenue" />
            <Line type="monotone" dataKey="projectCost" stroke="#dc2626" strokeWidth={3} strokeDasharray="5 5" name="Project Cost" />
          </AreaChart>
        </ResponsiveContainer>
        {paybackYear && (
          <p className="text-sm text-slate-700 mt-4">
            <span className="font-semibold">Payback Period:</span> Year {paybackYear} (revenue exceeds project cost in FY{new Date(data.baseDate).getFullYear() + paybackYear})
          </p>
        )}
      </div>

      <div className="p-8 border-t border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={showDebtService}
            onChange={(e) => setShowDebtService(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="font-semibold text-slate-900">Show Debt Service Scenario</span>
        </label>

        {showDebtService && (
          <div className="bg-slate-50 border border-slate-200 p-6 rounded space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bond Amount ($ millions)</label>
                <input
                  type="number"
                  step="0.1"
                  value={debtParams.bondAmount / 1000000}
                  onChange={(e) => setDebtParams({...debtParams, bondAmount: parseFloat(e.target.value) * 1000000})}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={debtParams.interestRate}
                  onChange={(e) => setDebtParams({...debtParams, interestRate: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Term (Years)</label>
                <input
                  type="number"
                  step="1"
                  value={debtParams.term}
                  onChange={(e) => setDebtParams({...debtParams, term: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-slate-200 grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <p className="text-sm text-green-700 font-semibold">Total OAV</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalVal)}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-sm text-blue-700 font-semibold">Est. DIF Revenue (Total)</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalDifRevenue)}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded border border-orange-200">
          <p className="text-sm text-orange-700 font-semibold">Project Cost</p>
          <p className="text-2xl font-bold text-orange-900">{formatCurrency(projectCost)}</p>
        </div>
        <div className={`p-4 rounded border ${totalDifRevenue >= projectCost ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm font-semibold ${totalDifRevenue >= projectCost ? 'text-green-700' : 'text-red-700'}`}>Surplus/(Deficit)</p>
          <p className={`text-2xl font-bold ${totalDifRevenue >= projectCost ? 'text-green-900' : 'text-red-900'}`}>
            {formatCurrency(totalDifRevenue - projectCost)}
          </p>
        </div>
      </div>
    </div>
  );
};

const OperationSection = ({ data, setData }) => {
  const [edit, setEdit] = useState(false);
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Operation & Management</h2>
        <button onClick={() => setEdit(!edit)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">
          {edit ? <Eye size={18} /> : <Edit2 size={18} />}
          {edit ? 'View' : 'Edit'}
        </button>
      </div>

      {edit ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Administering Entity</label>
            <input
              type="text"
              value={data.administringEntity}
              onChange={(e) => setData({...data, administringEntity: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Committee Composition</label>
            <textarea
              value={data.committeeComposition}
              onChange={(e) => setData({...data, committeeComposition: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-20 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reporting Timeline</label>
            <textarea
              value={data.reportingTimeline}
              onChange={(e) => setData({...data, reportingTimeline: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-20 font-mono"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Administering Entity</h3>
            <p className="text-slate-700 text-sm">{data.administringEntity}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Committee Composition</h3>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{data.committeeComposition}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Reporting Timeline</h3>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{data.reportingTimeline}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const AppendicesSection = ({ data, setData }) => {
  const appendices = data.appendices || {};

  const toggleAppendix = (key) => {
    setData({
      ...data,
      appendices: {
        ...appendices,
        [key]: !appendices[key]
      }
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Required Appendices</h2>
      <p className="text-slate-700 text-sm">Check off appendices as they are completed and attached to this DIF proposal.</p>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={appendices.map || false}
            onChange={() => toggleAppendix('map')}
            className="w-4 h-4"
          />
          <span className="text-slate-700">District Map (showing all parcels and district boundaries)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={appendices.townVote || false}
            onChange={() => toggleAppendix('townVote')}
            className="w-4 h-4"
          />
          <span className="text-slate-700">Town Meeting/Town Council Vote (establishing DIF)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={appendices.acreageCert || false}
            onChange={() => toggleAppendix('acreageCert')}
            className="w-4 h-4"
          />
          <span className="text-slate-700">Assessor's Certification of Acreage</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={appendices.oavCert || false}
            onChange={() => toggleAppendix('oavCert')}
            className="w-4 h-4"
          />
          <span className="text-slate-700">Assessor's Certification of Original Assessed Value (OAV)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={appendices.parcelList || false}
            onChange={() => toggleAppendix('parcelList')}
            className="w-4 h-4"
          />
          <span className="text-slate-700">Complete Parcel List (with use codes and values)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={appendices.activitiesAuth || false}
            onChange={() => toggleAppendix('activitiesAuth')}
            className="w-4 h-4"
          />
          <span className="text-slate-700">Activities Authorized (MGL 40Q §2(c))</span>
        </label>
      </div>
    </div>
  );
};

const JustificationSection = ({ data, setData }) => {
  const [edit, setEdit] = useState(false);
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Justification Narrative</h2>
        <button onClick={() => setEdit(!edit)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">
          {edit ? <Eye size={18} /> : <Edit2 size={18} />}
          {edit ? 'View' : 'Edit'}
        </button>
      </div>

      {edit ? (
        <textarea
          value={data.justificationNarrative}
          onChange={(e) => setData({...data, justificationNarrative: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm h-64 font-mono"
        />
      ) : (
        <div className="prose prose-sm max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data.justificationNarrative}</p>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function SouthboroughDIFApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('cover');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('address');
  const [selectedParcels, setSelectedParcels] = useState(ROUTE9_PARCELS);
  const [pdfProgress, setPdfProgress] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handleExportPDF = async () => {
    setPdfGenerating(true);
    try {
      const pages = await generateDIFProposalPDF(data, selectedParcels, stats, projectCost, (msg) => setPdfProgress(msg));
      setPdfProgress(null);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setPdfProgress('Error generating PDF');
      setTimeout(() => setPdfProgress(null), 3000);
    }
    setPdfGenerating(false);
  };

  const filteredParcels = useMemo(() => {
    return ROUTE9_PARCELS.filter(p =>
      p.addr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.includes(searchTerm)
    );
  }, [searchTerm]);

  const stats = useMemo(() => {
    const totalVal = selectedParcels.reduce((sum, p) => sum + p.totalVal, 0);
    const totalAcres = selectedParcels.reduce((sum, p) => sum + p.acres, 0);
    return { totalVal, totalAcres, count: selectedParcels.length };
  }, [selectedParcels]);

  const [data, setData] = useState({
    programDate: '2025-03-09',
    baseDate: '2025-01-01',
    introduction: `This District Improvement Financing (DIF) Program under Massachusetts General Law Chapter 40Q establishes a designated development district, invested revenue district, development program, and infrastructure revenue district debt payoff (IRDDP) for the Route 9 Corridor in Southborough. The DIF mechanism allows the town to capture and invest new tax revenue generated by private development within the defined district to fund essential public infrastructure—specifically a modern municipal wastewater system that will enable higher-density, mixed-use development along this key regional economic corridor.

The wastewater infrastructure will provide significant public health, environmental, and economic benefits including relief from outdated septic systems, protection of groundwater resources, and catalyzation of private investment and job creation aligned with state housing and economic development goals.`,
    districtNarrative: `The Route 9 Corridor in Southborough is a key segment of the Route 9 "Golden Triangle" regional economic development zone between Boston and Worcester. The corridor extends approximately 2.5 miles along Boston Road and Route 9, encompassing 64 parcels with a combined assessed value of over $47 million.

Currently, much of the corridor development is constrained by lack of municipal wastewater infrastructure, forcing reliance on individual septic systems. This limitation restricts development potential, threatens groundwater quality, and prevents the type of concentrated, mixed-use development that would maximize value capture and regional economic impact.

The town has determined that public wastewater infrastructure is the critical enabling investment needed to unlock the corridor's development potential. The DIF mechanism allows the town to fund this investment through tax revenues generated by the new development the wastewater system makes possible—creating a self-financing virtuous cycle.

This district was chosen because:
- Route 9 is designated as a Massachusetts economic development corridor
- The area has demonstrated private developer interest, contingent on wastewater availability
- Wastewater infrastructure is a traditional public good that generates quantifiable new tax values
- The project is financially viable within a reasonable DIF term (20-25 years)
- Environmental benefits of modern treatment vs. septic systems are substantial
- Project aligns with state housing production goals and climate resilience priorities`,
    findings: {},
    findingsNarrative: '',
    projectComponents: [
      {name: 'WRRF/Treatment Plant — Engineering', cost: 3750000},
      {name: 'Collection System — Engineering', cost: 3095000},
      {name: 'WRRF/Treatment Plant — Construction', cost: 15000000},
      {name: 'Collection System — Construction (Primary)', cost: 15000000},
      {name: 'Collection System — Construction (Secondary)', cost: 5000000},
      {name: 'Pump Stations', cost: 4000000},
      {name: 'MassDOT Intersection Work', cost: 2000000},
      {name: 'Administration & Legal', cost: 2000000}
    ],
    meansAndObjectives: `The wastewater system will consist of a new municipal treatment facility with capacity to serve 3,000+ equivalent dwelling units, collection lines throughout the Route 9 corridor, and necessary pump stations for elevation changes.

The system will be designed to Massachusetts Department of Environmental Protection (MassDEP) standards for secondary treatment with nutrient removal. Initial capacity will be 750,000 gallons per day, expandable to 1.5 million GPD. Service area will be the Route 9 Corridor Development District.

Means: Municipal revenue bonds backed by DIF tax increment financing. Operations: User fee structure for private developers connecting to the system, with rates set to ensure financial sustainability.

Objectives:
- Enable development of mixed-use projects (residential, office, retail) along Route 9
- Replace aging septic systems with modern centralized treatment
- Protect groundwater resources in the Chauncy Tunnel area aquifer
- Generate municipal tax revenue to fund the system
- Create permanent jobs in construction and operations`,
    relocationPlan: `No displacement of residential or business tenants is anticipated. The wastewater infrastructure will be constructed in public rights-of-way and on municipal parcels where necessary. Any easements on private property will be acquired through standard municipal processes with fair-market compensation.`,
    housingPlan: `The wastewater system will enable development of market-rate and affordable housing along the Route 9 corridor, consistent with state Chapter 40R housing production goals. The town anticipates at least 200-300 additional housing units (50,000+ square feet) as a direct result of wastewater system availability. This will include a mix of rental apartments, condominiums, and senior housing, providing workforce housing in a high-opportunity area.`,
    operationPlan: `The municipal wastewater system will be operated by the Town of Southborough Department of Public Works under a dedicated Sewer Commission. A DIF Advisory Committee will oversee district financial performance and annually report to the Select Board and Finance Committee on DIF revenue generation, project costs, and system operations.

The system will be self-supporting through user fees charged to all properties connected to the municipal system, whether public or private. Connection is mandatory for all properties in the district once the system is operational. A capital replacement reserve will be funded through rates to ensure long-term sustainability.`,
    administringEntity: 'Development Program Oversight Committee (PODC), appointed by the Select Board',
    committeeComposition: `5 members appointed by the Select Board:
- The Assessor, or their designee
- The Assistant Town Administrator
- One member of the Select Board
- One member of the Finance Committee
- One member of the Community and Economic Development Committee`,
    reportingTimeline: `Annual Report to Select Board (June) covering:
- DIF revenue collected and expended
- Assessor's annual certification of Tax Increment
- Project status and milestone achievements
- Property value growth and development activity in the district
- Development Sinking Fund Account and Project Cost Account status
- Financial projection updates
- 5-year review of capture percentages
- Recommendations for program modifications`,
    appendices: {},
    difTerm: 30,
    taxRate: 13.81,
    annualGrowthRate: 3.0,
    captureRates: [{years: 30, rate: 1.0}],
    fundingSources: [
      {name: 'DIF Revenue', percent: 5.6},
      {name: 'Betterments', percent: 14.7},
      {name: 'User Generated Revenue (sewer rates)', percent: 14.1},
      {name: 'Short Term Rental Tax', percent: 18.7},
      {name: 'Water/Infrastructure Fund', percent: 10.2},
      {name: 'State/Federal Grants (SRF, MassWorks)', percent: 6.5},
      {name: 'Solar/Energy Revenue', percent: 4.5},
      {name: 'Cape Cod Trust / Regional Funds', percent: 24.5},
      {name: 'Other/Balances', percent: 1.2}
    ],
    fundFlowNarrative: `DIF Revenues flow into the Development Program Fund. If debt is issued, funds are directed to the Development Sinking Fund Account for Principal & Interest payments. If no debt is incurred, funds flow to the Project Cost Account, which includes Municipal Cost Sub Accounts that feed back to the Municipal General Fund. This structure ensures DIF revenues are directed toward infrastructure financing while maintaining clear accounting and municipal fund separation.`,
    justificationNarrative: `Route 9 Economic Importance and State Goals

Route 9 is designated by the Massachusetts Office of Business Development as a key economic development corridor, part of the Route 9 "Golden Triangle" connecting Boston's suburbs to Worcester's innovation economy. The corridor is slated for concentrated residential and commercial development to meet the state's housing production goals under Chapter 40R and to align with climate resilience and smart growth policies.

Infrastructure as Economic Catalyst

The Route 9 Corridor project illustrates the "Economic Cycle" pattern documented across successful Massachusetts development initiatives: infrastructure investment → private development → new tax growth → debt service repayment. This virtuous cycle begins with public wastewater infrastructure, which directly enables private development in the district. The wastewater system is the critical constraint removed, unlocking substantial development potential.

Nitrogen Reduction and Environmental Compliance

The Route 9 area is subject to strict nitrogen loading limits under state and federal water quality mandates. Individual septic systems in this area produce effluent with high nitrogen content, contributing to coastal and groundwater contamination risks. The proposed municipal wastewater treatment system will achieve advanced nutrient removal (nitrogen and phosphorus), meeting DEP nitrogen loading targets while protecting the Chauncy Tunnel area aquifer. This environmental compliance objective justifies public investment independent of economic development arguments.

Elimination of Individual Nitrate Systems

Private development in the district is currently hampered by the inability to obtain economical septic system designs due to nitrogen loading constraints. A centralized treatment facility with nutrient removal eliminates reliance on individual nitrate systems, making private development economically feasible and allowing property owners and developers to avoid substantial individual treatment system costs.

Tax Revenue Generation and Economic Development

Based on comparable developments in Massachusetts, each acre of new development generates approximately $15,000-25,000 in new annual tax revenue. The Route 9 corridor can accommodate 500+ acres of development. Private development projects are projected within the district contingent on wastewater availability. Conservative estimates project new annual tax increment of $8M-12M by Year 10, substantially exceeding debt service and operating costs. The DIF term of 30 years is conservative for a project with this revenue potential.

Bond Issuance and SRF Program Backing

The DIF will support municipal revenue bonds backed by the State Revolving Fund (SRF) program, providing favorable borrowing rates and extended repayment terms. Importantly, DIF bonds DO NOT count toward municipal debt limit under MGL 40Q §4(m), preserving the town's borrowing capacity for other essential services.

Community Support and Market Evidence

Developer interest in the district is demonstrated and contingent on wastewater availability. Property owners, business operators, and the Select Board recognize wastewater as essential to remaining competitive and capturing development opportunities. Residents support the project based on environmental and public health benefits.

Precedent and Proven Model

The Southborough DIF follows the proven Massachusetts Chapter 40Q model successfully implemented in Yarmouth, Barnstable, Hyannis, Plymouth, and other municipalities. The statutory framework is clear, the financial mechanics are well-tested, and the implementation path is straightforward. This represents proven public finance practice with documented upside potential.`
  });

  const projectCost = data.projectComponents.reduce((sum, c) => sum + c.cost, 0);

  const sections = [
    {id: 'cover', label: 'Cover & Introduction', icon: '📄'},
    {id: 'district', label: 'About the District', icon: '🗺️'},
    {id: 'parcels', label: 'Parcel Information', icon: '📋'},
    {id: 'findings', label: 'Findings', icon: '✓'},
    {id: 'program', label: 'Development Program', icon: '🏗️'},
    {id: 'financial', label: 'Financial Plan', icon: '💰'},
    {id: 'operation', label: 'Operation & Management', icon: '⚙️'},
    {id: 'appendices', label: 'Appendices Checklist', icon: '📎'},
    {id: 'justification', label: 'Justification', icon: '📝'}
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && <h1 className="font-bold text-sm">SOUTHBOROUGH DIF</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-3 rounded mb-2 transition-all ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{section.icon}</span>
                {sidebarOpen && <span className="text-sm">{section.label}</span>}
              </div>
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <button
            onClick={handleExportPDF}
            disabled={pdfGenerating}
            className={`w-full px-4 py-3 rounded font-semibold text-sm transition-all ${
              pdfGenerating
                ? 'bg-slate-600 text-slate-400 cursor-wait'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            <div className="flex items-center gap-3 justify-center">
              {pdfGenerating ? <Loader size={18} className="animate-spin" /> : <FileText size={18} />}
              {sidebarOpen && <span>{pdfProgress || 'Export PDF'}</span>}
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto space-y-8">
          {activeSection === 'cover' && <CoverSection data={data} setData={setData} />}
          {activeSection === 'district' && <AboutDistrictSection data={data} setData={setData} />}
          {activeSection === 'parcels' && (
            <ParcelSection
              selectedParcels={selectedParcels}
              setSelectedParcels={setSelectedParcels}
              filteredParcels={filteredParcels}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          )}
          {activeSection === 'findings' && <FindingsSection data={data} setData={setData} stats={stats} />}
          {activeSection === 'program' && <DevelopmentProgramSection data={data} setData={setData} />}
          {activeSection === 'financial' && <FinancialPlanSection data={data} setData={setData} stats={stats} projectCost={projectCost} />}
          {activeSection === 'operation' && <OperationSection data={data} setData={setData} />}
          {activeSection === 'appendices' && <AppendicesSection data={data} setData={setData} />}
          {activeSection === 'justification' && <JustificationSection data={data} setData={setData} />}
        </div>
      </div>
    </div>
  );
}
