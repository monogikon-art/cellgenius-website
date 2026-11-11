import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 3199);
const SECRET = "e2e-signing-secret-0123456789abcdef01";
const REQUEST_ID = "6f1c2a4e-8b3d-4c5e-9f70-1a2b3c4d5e6f";

const send = (res, events) => {
    res.writeHead(200, { "content-type": "application/x-ndjson" });
    for (const e of events) res.write(`${JSON.stringify(e)}\n`);
    res.end();
};

createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
        const base = ["POST", req.url, req.headers["x-cg-timestamp"], req.headers["x-cg-nonce"], body].join("\n");
        const expected = createHmac("sha256", SECRET).update(base).digest("hex");
        const given = String(req.headers["x-cg-signature"] ?? "");
        if (given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
            res.writeHead(401).end();
            return;
        }
        const call = JSON.parse(body);
        if (call.kind === "confirm") {
            send(res, [{ type: "delta", text: "Thank you — your request is with the team." }, { type: "confirmed", email: "maria@example.com" }, { type: "done" }]);
            return;
        }
        if (/demo/i.test(call.message)) {
            send(res, [
                { type: "delta", text: "Here is your demo request. Please check it." },
                {
                    type: "proposal",
                    request: {
                        requestId: REQUEST_ID,
                        type: "demo",
                        name: "Maria Lopez",
                        email: "maria@example.com",
                        company: "Example Bank",
                        preferredTimes: "Tuesday morning",
                        timezone: "Europe/Athens",
                        message: "Demo for our PMO team",
                    },
                },
                { type: "done" },
            ]);
            return;
        }
        send(res, [
            { type: "delta", text: "Changenius is **one system** for every change. " },
            { type: "delta", text: "See [the app](https://app.cellgenius-ai.com/login) or [this](https://evil.example.com)." },
            { type: "done" },
        ]);
    });
}).listen(port);
