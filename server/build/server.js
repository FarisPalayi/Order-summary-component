"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var express_1 = __importDefault(require("express"));
var app = (0, express_1.default)();
var cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)({ origin: "http://localhost:8080" }));
app.use(express_1.default.json());
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// price details
var subscriptionDetails = [
    { id: 1, name: "weekly subscription", price: 9900, quantity: 1 },
    { id: 2, name: "monthly subscription", price: 39900, quantity: 1 },
    { id: 3, name: "annual subscription", price: 399900, quantity: 1 },
];
function createStripeSession(req) {
    return {
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.items.map(function (item) {
            var id = item.id;
            var _a = subscriptionDetails.find(function (subscription) { return subscription.id === id; }), name = _a.name, price = _a.price;
            return {
                quantity: 1,
                price_data: {
                    currency: "inr",
                    product_data: { name: name },
                    unit_amount: price,
                },
            };
        }),
        success_url: "" + process.env.CLIENT_URL,
        cancel_url: "" + process.env.CLIENT_URL,
    };
}
// post
app.post("/create-checkout-session", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, stripe.checkout.sessions.create(createStripeSession(req))];
            case 1:
                session = _a.sent();
                res.json({ url: session.url });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                res.status(500).json({ error: err_1.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// listen in port
var PORT = process.env.PORT || 3000;
app.listen(3000, function () {
    return console.log("Server is listening on port http://localhost:" + PORT);
});
