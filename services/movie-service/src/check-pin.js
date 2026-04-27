const bcrypt = require("bcryptjs");

const hash = "$2b$10$lL9N3FZMFr/MXOjwWsFHAOYDCePEAH2VKXRxD5m9POHX3KeKtKwGG";
const commonPins = [
    "123456", "000000", "111111", "222222", "333333", "444444", "555555", "666666", "777777", "888888", "999999",
    "654321", "123123", "456456", "112233", "789456", "147258", "369258", "0852"
];

async function checkPins() {
    console.log("🔍 Checking common PINs for hash:", hash);
    for (const pin of commonPins) {
        const isMatch = await bcrypt.compare(pin, hash);
        if (isMatch) {
            console.log(`✅ FOUND MATCH! The PIN is: ${pin}`);
            return;
        }
    }
    console.log("❌ No common PINs matched.");
}

checkPins();
