var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var axios = require('axios');
var fs = require('fs');
function getData(addr) {
    return __awaiter(this, void 0, void 0, function () {
        var stables, fills, page, pageCount, response, fees, stableVolume, tokenVolume, takersArr, takers, formattedFee, formattedStableVolume, formattedTokenVolume, formattedTakers, formattedFills;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stables = [
                        '0x6b175474e89094c44da98b954eedeac495271d0f',
                        '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9'
                    ];
                    fills = [];
                    page = 1;
                    pageCount = 100;
                    _a.label = 1;
                case 1:
                    if (!(page <= pageCount)) return [3 /*break*/, 3];
                    return [4 /*yield*/, axios.get("https://api.0xtracker.com/fills?token=" + addr.toLowerCase() + "&limit=50&page=" + page++)];
                case 2:
                    response = _a.sent();
                    fills.push.apply(fills, response.data.fills);
                    // update pageCount
                    pageCount = parseFloat(response.data.pageCount);
                    return [3 /*break*/, 1];
                case 3:
                    fees = 0;
                    stableVolume = 0;
                    tokenVolume = 0;
                    takersArr = [];
                    // iterate through each fill
                    fills.forEach(function (fill) {
                        // add taker to the array
                        takersArr.push(fill.takerAddress);
                        // add to fees
                        fees += parseFloat(fill.protocolFee.USD);
                        // get the stablecoin in the trade
                        var stable = stables.includes(fill.assets[0].tokenAddress)
                            ? fill.assets[0]
                            : fill.assets[1];
                        // get the token that isn't the stablecoin
                        var token = stables.includes(fill.assets[0].tokenAddress)
                            ? fill.assets[1]
                            : fill.assets[0];
                        // add to volume
                        stableVolume += parseFloat(stable.amount);
                        tokenVolume += parseFloat(token.amount);
                    });
                    takers = __spreadArrays(new Set(takersArr)).length;
                    console.log("\n" + addr + ": \n");
                    console.log("Total protocol fees: $" + fees.toLocaleString(undefined, { minimumFractionDigits: 1 }) + " USD");
                    console.log("Total stablecoin volume: $" + stableVolume.toLocaleString(undefined, { minimumFractionDigits: 1 }) + " USD");
                    console.log("Total token volume: $" + tokenVolume.toLocaleString(undefined, { minimumFractionDigits: 1 }) + " USD");
                    console.log("Unique takers: " + takers);
                    console.log("Total trades: " + fills.length);
                    formattedFee = fees.toFixed(2);
                    formattedStableVolume = stableVolume.toFixed(2);
                    formattedTokenVolume = tokenVolume.toFixed(2);
                    formattedTakers = takers.toString();
                    formattedFills = fills.length.toString();
                    // add line to csv input
                    csvInput += (formattedFee + "," + formattedStableVolume + "," + formattedTokenVolume + "," + formattedTakers + "," + formattedFills + "\n");
                    return [2 /*return*/];
            }
        });
    });
}
var csvInput = '';
var pools = [
    '0x8341c03f454aa4D756B83f262d1911F79C75E242',
    '0x4eF32658A6A2A63e42E31b342bD2aeBf11A1be09'
];
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, pools_1, addr, header;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, pools_1 = pools;
                    _a.label = 1;
                case 1:
                    if (!(_i < pools_1.length)) return [3 /*break*/, 4];
                    addr = pools_1[_i];
                    return [4 /*yield*/, getData(addr)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    header = "Protocol Fees (USD),Total Stablecoin Volume(DAI),Total Token Volume,Unique Takers,Total Trades\n";
                    csvInput = header + csvInput;
                    fs.writeFile('output.cv', csvInput, function (err) {
                        console.log(err);
                        if (err)
                            return console.log(err);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
start();
