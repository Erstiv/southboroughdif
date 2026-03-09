import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Menu, X, ChevronDown, ChevronRight, Edit2, Eye, Download, Save, FileText, Loader } from 'lucide-react';
import { generateDIFProposalPDF } from './pdfExport';
import DistrictMap from './DistrictMap';

// PARCEL DATA - Route 9 Southborough
const ROUTE9_PARCELS = [
  {id:"277/048.0-0000-0016.A",addr:"BOSTON ROAD",totalVal:1200,bldgVal:0,landVal:1200,acres:0.08,useCode:"131",owner:"RIZZA JOSEPH"},
  {id:"277/047.0-0000-0009.0",addr:"179 BOSTON ROAD",totalVal:1083000,bldgVal:645900,landVal:320600,acres:3,useCode:"340",owner:"TSL REALTY LLC"},
  {id:"277/048.0-0000-0016.0",addr:"224 BOSTON ROAD",totalVal:601500,bldgVal:288400,landVal:238200,acres:0.76,useCode:"101",owner:"RIZZA JOSEPH"},
  {id:"277/047.0-0000-0005.0",addr:"154 BOSTON ROAD",totalVal:1131100,bldgVal:881500,landVal:249600,acres:1.29,useCode:"101",owner:"CASSIDY MATTHEW E"},
  {id:"277/055.0-0000-0087.0",addr:"43 BOSTON ROAD",totalVal:553300,bldgVal:238700,landVal:298900,acres:0.45,useCode:"101",owner:"ASAAD, SHAWKAT SHOKRY"},
  {id:"277/055.0-0000-0090.0",addr:"29 BOSTON ROAD",totalVal:795700,bldgVal:108200,landVal:252600,acres:0.32,useCode:"334",owner:"29 BOSTON ROAD LLC"},
  {id:"277/055.0-0000-0080.0",addr:"59 BOSTON ROAD",totalVal:682600,bldgVal:378100,landVal:294600,acres:0.33,useCode:"104",owner:"STRAZ JUSTIN T AND WENDI A"},
  {id:"277/055.0-0000-0094.0",addr:"49 BOSTON ROAD",totalVal:5225300,bldgVal:4137300,landVal:980300,acres:4.92,useCode:"970",owner:"SOUTHBOROUGH HOUSING AUTHORITY"},
  {id:"277/047.0-0000-0013.0",addr:"155 BOSTON ROAD",totalVal:1241800,bldgVal:492000,landVal:304000,acres:1.8,useCode:"340",owner:"145-155 BOSTON ROAD REALTY LLC"},
  {id:"277/048.0-0000-0052.0",addr:"0 BOSTON ROAD",totalVal:10300,bldgVal:0,landVal:10300,acres:2.08,useCode:"132",owner:"BEAR BLUFF-SOUTHBOROUGH LLC"},
  {id:"277/055.0-0000-0073.0",addr:"42 BOSTON ROAD",totalVal:545700,bldgVal:243500,landVal:300000,acres:0.48,useCode:"101",owner:"ANDERSON, NED AND MAJELLA"},
  {id:"277/047.0-0000-0013.A",addr:"145 BOSTON ROAD",totalVal:832100,bldgVal:598200,landVal:233900,acres:0.99,useCode:"340",owner:"145-155 BOSTON ROAD REALTY LLC"},
  {id:"277/055.0-0000-0089.0",addr:"39 BOSTON ROAD",totalVal:450700,bldgVal:113300,landVal:275400,acres:0.23,useCode:"316",owner:"KOKERNAK, RUTH"},
  {id:"277/048.0-0000-0004.0",addr:"248 BOSTON ROAD",totalVal:479400,bldgVal:234100,landVal:245300,acres:0.73,useCode:"101",owner:"BLIZZARD PETER F AND BETTY LOU"},
  {id:"277/055.0-0000-0075.0",addr:"44 BOSTON ROAD",totalVal:655600,bldgVal:378900,landVal:276700,acres:0.35,useCode:"101",owner:"MCDERMOTT, PAUL AND PATRICIA"},
  {id:"277/054.0-0000-0055.0",addr:"100 BOSTON ROAD",totalVal:587300,bldgVal:330400,landVal:256900,acres:0.52,useCode:"101",owner:"ROSS BENJAMIN AND GAIL ROSS"},
  {id:"277/048.0-0000-0005.0",addr:"240 BOSTON ROAD",totalVal:609600,bldgVal:342300,landVal:267300,acres:0.89,useCode:"101",owner:"MAHONEY MARK AND JESSICA"},
  {id:"277/048.0-0000-0003.0",addr:"258 BOSTON ROAD",totalVal:491700,bldgVal:241500,landVal:250200,acres:0.91,useCode:"101",owner:"CORMIER PATRICIA A"},
  {id:"277/047.0-0000-0006.0",addr:"166 BOSTON ROAD",totalVal:679500,bldgVal:383200,landVal:296300,acres:1.14,useCode:"101",owner:"DUCHARME MARY ELLEN LF EST"},
  {id:"277/055.0-0000-0093.0",addr:"51 BOSTON ROAD",totalVal:669200,bldgVal:301100,landVal:293600,acres:0.39,useCode:"316",owner:"PINEO JOHN R AND ELISE R"},
  {id:"277/055.0-0000-0076.0",addr:"46 BOSTON ROAD",totalVal:573600,bldgVal:297000,landVal:276600,acres:0.35,useCode:"101",owner:"CALLIGAN SUZANNE"},
  {id:"277/054.0-0000-0054.0",addr:"106 BOSTON ROAD",totalVal:746800,bldgVal:453200,landVal:293600,acres:0.64,useCode:"104",owner:"WANG WEI AND LIU QIULIANG"},
  {id:"277/054.0-0000-0046.0",addr:"112 BOSTON ROAD",totalVal:1004500,bldgVal:738200,landVal:266300,acres:0.54,useCode:"104",owner:"WANG WEI AND LIU QIULIANG"},
  {id:"277/048.0-0000-0015.0",addr:"230 BOSTON ROAD",totalVal:4200,bldgVal:0,landVal:4200,acres:8.98,useCode:"915",owner:"BEAR BLUFF-SOUTHBOROUGH LLC"},
  {id:"277/054.0-0000-0041.0",addr:"114 BOSTON ROAD",totalVal:1168000,bldgVal:890100,landVal:277900,acres:0.73,useCode:"104",owner:"BF AND JF REALTY INC"},
  {id:"277/048.0-0000-0013.0",addr:"220 BOSTON ROAD",totalVal:3800,bldgVal:0,landVal:3800,acres:10.67,useCode:"915",owner:"BEAR BLUFF-SOUTHBOROUGH LLC"},
  {id:"277/047.0-0000-0008.0",addr:"186 BOSTON ROAD",totalVal:669900,bldgVal:357100,landVal:312800,acres:1.74,useCode:"101",owner:"CORMIER DANIEL JOSEPH AND MOLLY CATHERINE"},
  {id:"277/055.0-0000-0074.0",addr:"BOSTON ROAD OFF",totalVal:2500,bldgVal:0,landVal:2500,acres:0.03,useCode:"392",owner:"MCDERMOTT, PAUL AND PATRICIA"},
  {id:"277/047.0-0000-0007.0",addr:"176 BOSTON ROAD",totalVal:1055500,bldgVal:639300,landVal:416200,acres:6.05,useCode:"101",owner:"DELPORTO ANDREW AND SARAH"},
  {id:"277/048.0-0000-0014.0",addr:"BOSTON ROAD",totalVal:14000,bldgVal:0,landVal:14000,acres:68,useCode:"915",owner:"BEAR BLUFF-SOUTHBOROUGH LLC"},
  {id:"277/055.0-0000-0092.0",addr:"53 BOSTON ROAD",totalVal:547800,bldgVal:240200,landVal:293400,acres:0.41,useCode:"316",owner:"BLACK ELLEN"},
  {id:"277/048.0-0000-0051.0",addr:"0 BOSTON ROAD",totalVal:7800,bldgVal:0,landVal:7800,acres:2.02,useCode:"132",owner:"BEAR BLUFF-SOUTHBOROUGH LLC"},
  {id:"277/055.0-0000-0088.A",addr:"41 BOSTON ROAD",totalVal:606200,bldgVal:305100,landVal:295100,acres:0.35,useCode:"101",owner:"CHENGAT ROGER AND JILU"},
  {id:"277/048.0-0000-0011.0",addr:"212 BOSTON ROAD",totalVal:483700,bldgVal:273800,landVal:209900,acres:0.59,useCode:"104",owner:"SANGSTER MARY JANE"},
  {id:"277/054.0-0000-0062.A",addr:"BOSTON ROAD",totalVal:5800,bldgVal:0,landVal:5800,acres:0.72,useCode:"392",owner:"LAMY CHRISTOPHER M"},
  {id:"277/047.0-0000-0013.B",addr:"BOSTON ROAD",totalVal:39000,bldgVal:0,landVal:39000,acres:1.86,useCode:"391",owner:"THOMAN RICHARD E TRS"},
  {id:"277/048.0-0000-0017.0",addr:"BOSTON ROAD",totalVal:214600,bldgVal:0,landVal:214600,acres:2.65,useCode:"930",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"277/055.0-0000-0120.0",addr:"24 A BOSTON ROAD",totalVal:768700,bldgVal:768700,landVal:0,acres:0,useCode:"102",owner:"FARLEY DANIEL AND SUZANNE"},
  {id:"277/055.0-0000-0120.1",addr:"26 A BOSTON ROAD",totalVal:774800,bldgVal:774800,landVal:0,acres:0,useCode:"102",owner:"WANG JIAHUI"},
  {id:"277/055.0-0000-0120.2",addr:"28 BOSTON ROAD",totalVal:837200,bldgVal:837200,landVal:0,acres:0,useCode:"102",owner:"ZHOU LITE AND QIAO CEN"},
  {id:"277/055.0-0000-0120.3",addr:"30 BOSTON ROAD",totalVal:843800,bldgVal:843800,landVal:0,acres:0,useCode:"102",owner:"CHANG JIMMY AND LILY LEE"},
  {id:"277/055.0-0000-0120.4",addr:"26 B BOSTON ROAD",totalVal:772300,bldgVal:772300,landVal:0,acres:0,useCode:"102",owner:"PARCHURE PRANAV AND SHRUTI AGRAWAL"},
  {id:"277/055.0-0000-0120.5",addr:"24 B BOSTON ROAD",totalVal:774800,bldgVal:774800,landVal:0,acres:0,useCode:"102",owner:"HUANG EDWARD AND SISI SUN"},
  {id:"277/048.0-0000-0020.0",addr:"206 BOSTON ROAD",totalVal:2900,bldgVal:0,landVal:2900,acres:8.16,useCode:"915",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"277/048.0-0000-0009.0",addr:"BOSTON ROAD",totalVal:4100,bldgVal:0,landVal:4100,acres:32.38,useCode:"915",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"277/048.0-0000-0010.0",addr:"214 BOSTON TURN PIKE",totalVal:1282800,bldgVal:1013300,landVal:269500,acres:1.05,useCode:"109",owner:"ANDERSON, NED AND MAJELLA"},
  {id:"277/047.0-0000-0004.0",addr:"148 BOSTON ROAD",totalVal:2289400,bldgVal:1997900,landVal:291500,acres:2.06,useCode:"325",owner:"MAPLEGATE-SOUTHBOROUGH LLC"},
  {id:"277/054.0-0000-0058.A",addr:"BOSTON ROAD",totalVal:5700,bldgVal:0,landVal:5700,acres:1.08,useCode:"391",owner:"ROSS BENJAMIN AND GAIL ROSS"},
  {id:"277/048.0-0000-0012.0",addr:"BOSTON ROAD",totalVal:17400,bldgVal:0,landVal:17400,acres:122,useCode:"013",owner:"BEAR BLUFF-SOUTHBOROUGH LLC"},
  {id:"277/054.0-0000-0056.0",addr:"104 BOSTON ROAD",totalVal:735100,bldgVal:453900,landVal:281200,acres:0.53,useCode:"104",owner:"SAPORITO, MICHAEL AND MARGARET"},
  {id:"277/054.0-0000-0060.0",addr:"BOSTON ROAD",totalVal:300,bldgVal:0,landVal:300,acres:0.04,useCode:"391",owner:"ROSS BENJAMIN AND GAIL ROSS"},
  {id:"277/047.0-0000-0011.0",addr:"BOSTON ROAD",totalVal:400,bldgVal:0,landVal:400,acres:0.06,useCode:"013",owner:"TOWN OF SOUTHBOROUGH"},
  {id:"277/055.0-0000-0086.0",addr:"45 BOSTON ROAD",totalVal:504200,bldgVal:205600,landVal:294500,acres:0.41,useCode:"101",owner:"LAVOIE, JOYCE M"},
  {id:"277/055.0-0000-0091.0",addr:"37 BOSTON ROAD",totalVal:612900,bldgVal:318500,landVal:294400,acres:0.41,useCode:"314",owner:"37 BOSTON ROAD LLC"},
  {id:"277/055.0-0000-0082.0",addr:"55 BOSTON ROAD",totalVal:610500,bldgVal:318000,landVal:292500,acres:0.38,useCode:"101",owner:"LAMY CHRISTOPHER M"},
  {id:"277/048.0-0000-0019.0",addr:"204 BOSTON ROAD",totalVal:5000,bldgVal:0,landVal:5000,acres:1.76,useCode:"929",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"277/055.0-0000-0085.0",addr:"47 BOSTON ROAD",totalVal:557800,bldgVal:262500,landVal:293300,acres:0.39,useCode:"101",owner:"VEGA MICHAEL J AND BERYL E"},
  {id:"277/054.0-0000-0045.0",addr:"BOSTON ROAD",totalVal:3400,bldgVal:0,landVal:3400,acres:0.15,useCode:"337",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"277/055.0-0000-0083.0",addr:"BOSTON ROAD",totalVal:200,bldgVal:0,landVal:200,acres:0.02,useCode:"950",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"277/047.0-0000-0010.0",addr:"193 BOSTON ROAD",totalVal:670300,bldgVal:382000,landVal:288300,acres:0.87,useCode:"101",owner:"MCGAFF BRIAN AND AMY"},
  {id:"277/048.0-0000-0006.0",addr:"236 BOSTON ROAD",totalVal:516500,bldgVal:276500,landVal:240000,acres:0.66,useCode:"101",owner:"DUTRA, SCOTT D"},
  {id:"277/048.0-0000-0007.0",addr:"234 BOSTON ROAD",totalVal:607800,bldgVal:348500,landVal:259300,acres:0.79,useCode:"101",owner:"CONNELL RICHARD B JR TRS"},
  {id:"277/048.0-0000-0021.0",addr:"200 BOSTON ROAD",totalVal:7100,bldgVal:0,landVal:7100,acres:119.59,useCode:"960",owner:"SOUTHBOROUGH TOWN OF"},
  {id:"277/055.0-0000-0081.0",addr:"57 BOSTON ROAD",totalVal:552100,bldgVal:252500,landVal:293600,acres:0.39,useCode:"101",owner:"DEJESUS VICTOR AND ASHLEY"}
];

const USE_CODE_DESCRIPTIONS = {
  "101": "Single Family Residential",
  "102": "Condo",
  "104": "Two Family",
  "109": "Multiple Houses",
  "130": "Vacant Land",
  "131": "Vacant Land",
  "132": "Vacant Land",
  "314": "Restaurant/Bar",
  "316": "Mixed Use (Res+Comm)",
  "325": "Motel",
  "334": "Gasoline Station",
  "337": "Parking Lot",
  "340": "General Office",
  "391": "Vacant Commercial",
  "392": "Vacant Commercial",
  "013": "Multiple Use",
  "915": "Government/Institutional",
  "929": "Government/Institutional",
  "930": "Government/Institutional",
  "950": "Government/Institutional",
  "960": "Government/Institutional",
  "970": "Government/Institutional",
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

  return (
    <div className="bg-slate-50 border-2 border-slate-300 rounded p-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-slate-600 font-semibold">Proposed DIF District — Route 9 Corridor</p>
        <button
          onClick={() => setShowInteractive(!showInteractive)}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          {showInteractive ? 'Show Static Map' : 'Load Interactive Map'}
        </button>
      </div>
      {showInteractive ? (
        <DistrictMap />
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
