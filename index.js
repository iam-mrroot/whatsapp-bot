const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const storage = require("node-persist");
const puppeteer = require("puppeteer-core");

// Create a new client instance with LocalAuth and puppeteer configuration
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: '/usr/bin/chromium-browser', // Adjust path if necessary
  },
});

async function initstorage() {
  try {
    await storage.init({
      dir: "userdata",
      stringify: JSON.stringify,
      parse: JSON.parse,
      encoding: "utf8",
      logging: false,
      ttl: false,
    });
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
}

// Event listener for QR code generation
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR Code generated, scan it with your WhatsApp app.");
});

// Event listener when the client is ready
client.on("ready", async () => {
  console.log("Client is ready!");
  await initstorage();
});

// Event listener for incoming messages
client.on("message", async (message) => {
  try {
    console.log(`Received message from ${message.from}: ${message.body}`); // Log received messages
    let userData = await storage.getItem(message.from);

    if (userData == null) {
      userData = { phoneNumber: message.from };
      await sendMessage(message.from); // greeting the user
      await captureData(message.from); //asking for the name
      await storage.setItem(message.from, userData); //storing the phone number into userdata
    } else if (!userData.name) {
      userData.name = message.body; //saving the name
      await client.sendMessage(
        message.from,
        `hello ${userData.name} nice to meet you`
      );
      await storage.setItem(message.from, userData); //saving the name to userdata
      await askService(message.from);
    } else if (!userData.service) {
      userData.service = message.body;
      await storage.setItem(message.from, userData);
      await finalMessage(message.from);
    } else {
      console.log("User has already provided all information.");
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
});

// Initialize the WhatsApp client
client.initialize();

// Messaging functions

async function sendMessage(to) {
  try {
    await client.sendMessage(
      to,
      `*welcome to URBANZI*\n
"We are the best in what we do"
I am URBANZI'S Personal chat assistant.
---------------------------------------
*OUR SERVICES*:\n
🔷 WEB DEVELOPMENT
🔷 MOBILE APPLICATION
🔷 BRANDING
🔷 SOFTWARE DEVELOPMENT
🔷 SEO SUPPORT
🔷 UI/UX DEVELOPMENT
🔷 DIGITAL MARKETING
🔷 GRAPHICS AND DESIGN
🔷 CHAT BOT
🔷 LEAD GENERATION
🔷 BUSINESS SOLUTIONS
---------------------------------------`
    );
    console.log("Greeting message sent");
  } catch (error) {
    console.error(`Failed to send greeting message to ${to}:`, error);
  }
}

async function captureData(to) {
  try {
    await client.sendMessage(to, "Can I have your name, Please?");
    console.log("Asking for name sent");
  } catch (error) {
    console.error(`Failed to ask for name from ${to}:`, error);
  }
}

async function askService(to) {
  try {
    await client.sendMessage(to, "What Kind of Service are you looking for?");
    console.log("Asking for service sent");
  } catch (error) {
    console.error(`Failed to ask for service from ${to}:`, error);
  }
}

async function finalMessage(to) {
  try {
    await client.sendMessage(
      to,
      "Thank you for your interest in URBANZI. We will get back to you soon."
    );
    console.log("Thank you message sent");
  } catch (error) {
    console.error(`Failed to send final message to ${to}:`, error);
  }
}
