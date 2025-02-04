document.addEventListener("DOMContentLoaded", function () {
    const serverIP = "103.152.197.168:25567"; // Minecraft server IP
    const playerCountElement = document.getElementById("player-count");
    const uptimeElement = document.getElementById("server-uptime");
    const cpuUsageElement = document.getElementById("cpu-usage");
    const memoryUsageElement = document.getElementById("memory-usage");
    const diskUsageElement = document.getElementById("disk-usage");
    const serverStartingModal = document.getElementById("server-starting-modal");
    const body = document.body;
    const playerListContainer = document.getElementById("player-list-container"); // Container for player list

    // Proxy URL to bypass CORS issues (replace with your own proxy if needed)
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const sparkUrl = "https://spark.lucko.me/iUoCM7ULWh"; // Your Spark profiler link

    // Function to fetch server data from the Minecraft API
    async function fetchServerData() {
    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${serverIP}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Server Data:", data); // Debugging log

        if (data.online) {
            updateServerStatus(true, data.players?.online ?? 0, data.players?.list);
            redirectToMainPage(); // Redirect if server is online
        } else {
            updateServerStatus(false);
            redirectTo404(); // Redirect if server is offline
        }
    } catch (error) {
        console.error("Error fetching server data:", error);
        updateServerStatus(false);
        redirectTo404(); // Redirect if an error occurs
    }
}

// Function to redirect to 404 page if offline
function redirectTo404() {
    if (window.location.pathname !== "/404page.html") {
        window.location.href = "/404page.html";
    }
}

// Function to redirect to Main Page if online
function redirectToMainPage() {
    if (window.location.pathname !== "/mainpage.html") {
        window.location.href = "/mainpage.html";
    }
}

// Fetch data every 10 seconds to check server status
fetchServerData(); // Initial check
setInterval(fetchServerData, 10000); // Check every 10 seconds

    

function updateServerStatus(isOnline, playerCount = 0, playerList = []) {
    uptimeElement.innerHTML = isOnline
        ? `<i class="fas fa-check-circle status-icon" style="color: #00ff00;"></i> <span class="status-text">Online - 24/7</span>`
        : `<i class="fas fa-times-circle status-icon" style="color: #ff0000;"></i> <span class="status-text">Offline ❌</span>`;

    playerCountElement.textContent = isOnline ? `${playerCount} Players Online` : "Server Offline";

    // Show or hide modal
    isOnline ? hideServerStartingModal() : showServerStartingModal();

    // Update player list or clear if offline
    if (isOnline && playerList?.length) {
        updatePlayerList(playerList);
    } else {
        playerListContainer.innerHTML = "<p>No players online</p>";
    }

    // Add animation effect
    animateStatus();
}

// Function to add smooth animation when status changes
function animateStatus() {
    const statusIcon = document.querySelector(".status-icon");
    const statusText = document.querySelector(".status-text");

    if (statusIcon && statusText) {
        statusIcon.style.animation = "fadeScale 0.5s ease-in-out";
        statusText.style.animation = "fadeIn 0.5s ease-in-out";
    }
}

// Add styles for animations
const style = document.createElement("style");
style.innerHTML = `
    @keyframes fadeScale {
        0% { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }

    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }

    .status-icon {
        font-size: 30px; 
        vertical-align: middle;
        display: inline-block;
    }

    .status-text {
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
    }
`;
document.head.appendChild(style);


    // Function to update the player list with player avatars
    async function updatePlayerList(players) {
        console.log("Player List:", players); // Log players for debugging

        playerListContainer.innerHTML = ''; // Clear previous player list
        if (players && players.length > 0) {
            for (const player of players) {
                try {
                    // Fetch UUID from Mojang's API
                    const uuid = await fetchPlayerUUID(player);

                    // Create player element
                    const playerElement = document.createElement("li");

                    // Create an image element for the player avatar (head)
                    const playerAvatar = document.createElement("img");
                    playerAvatar.src = `https://crafatar.com/avatars/${uuid}?size=32&overlay`; // Fetch avatar from Crafatar using UUID
                    playerAvatar.alt = player;
                    playerAvatar.classList.add("player-avatar");

                    // Add error handling for failed image loading
                    playerAvatar.onerror = function () {
                        console.error(`Failed to load avatar for ${player}`);
                        playerAvatar.src = "https://crafatar.com/avatars/unknown?size=32&overlay"; // Fallback image
                    };

                    const playerName = document.createElement("span");
                    playerName.textContent = player;
                    playerName.classList.add("player-name");

                    // Append avatar and name to player list item
                    playerElement.appendChild(playerAvatar);
                    playerElement.appendChild(playerName);
                    playerListContainer.appendChild(playerElement); // Append to the container
                } catch (error) {
                    console.error(`Error processing player ${player}:`, error);
                    // Add a fallback player element if something goes wrong
                    const fallbackElement = document.createElement("li");
                    fallbackElement.textContent = player;
                    playerListContainer.appendChild(fallbackElement);
                }
            }
        } else {
            playerListContainer.innerHTML = "<li>No players online</li>"; // Message if no players
        }
    }

    // Function to fetch player UUID from Mojang's API
    async function fetchPlayerUUID(playerName) {
        try {
            const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${playerName}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch UUID for ${playerName}: ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`UUID for ${playerName}:`, data.id); // Log the UUID for debugging
            return data.id;
        } catch (error) {
            console.error(`Error fetching UUID for ${playerName}:`, error);
            return "unknown"; // Return a default value in case of an error
        }
    }

    // Function to show the starting modal and apply background blur
    function showServerStartingModal() {
        serverStartingModal.style.display = "flex"; // Show the modal
        body.classList.add("modal-open"); // Apply background blur and prevent scrolling
    }

    // Function to hide the starting modal and remove background blur
    function hideServerStartingModal() {
        serverStartingModal.style.display = "none"; // Hide the modal
        body.classList.remove("modal-open"); // Remove background blur and allow scrolling
    }

    // Function to fetch system stats from the Spark profiler API (via proxy)
    async function fetchSystemStats() {
        try {
            const response = await fetch(proxyUrl + sparkUrl); // Using the proxy to avoid CORS issues
            if (!response.ok) {
                throw new Error(`Failed to fetch system stats: ${response.statusText}`);
            }
            const data = await response.json();
            console.log("Fetched System Stats:", data); // Log raw data for debugging

            // Update the system stats elements with the fetched data
            if (data && data.cpuUsage !== undefined && data.memoryUsage && data.diskUsage) {
                cpuUsageElement.textContent = `${data.cpuUsage.toFixed(2)}%`;
                memoryUsageElement.textContent = `${data.memoryUsage.used.toFixed(2)} MB / ${data.memoryUsage.total.toFixed(2)} MB`;
                diskUsageElement.textContent = `${data.diskUsage.used.toFixed(2)} GB / ${data.diskUsage.total.toFixed(2)} GB`;
            } else {
                console.error("Unexpected data format:", data);
                cpuUsageElement.textContent = "Error fetching data";
                memoryUsageElement.textContent = "Error fetching data";
                diskUsageElement.textContent = "Error fetching data";
            }
        } catch (error) {
            console.error("Error fetching system stats:", error);
            cpuUsageElement.textContent = "Error fetching data";
            memoryUsageElement.textContent = "Error fetching data";
            diskUsageElement.textContent = "Error fetching data";
        }
    }

    // Fetch data every 5 seconds
    fetchServerData(); // Initial check when page loads
    fetchSystemStats(); // Fetch initial system stats from Spark profiler link
    setInterval(fetchServerData, 10000); // Refresh server info every 60 seconds
    setInterval(fetchSystemStats, 10000); // Refresh system stats every 10 seconds

    // Set the date for Season 4 launch (3 months from now)
const season4Date = new Date();
season4Date.setMonth(season4Date.getMonth() + 3);

function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = season4Date - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

const messages = [
    '<i class="fas fa-gamepad"></i> Survive. Build. Conquer. <i class="fas fa-crown"></i>',
    '<i class="fas fa-hammer"></i> Gather. Craft. Thrive. <i class="fas fa-leaf"></i>',
    '<i class="fas fa-swords"></i> Battle. Defend. Dominate. <i class="fas fa-shield-alt"></i>',
    '<i class="fas fa-users"></i> Team Up. Explore. Rule. <i class="fas fa-map-marked-alt"></i>',
    '<i class="fas fa-fire"></i> Adventure Awaits. Rise as a Legend! <i class="fas fa-star"></i>',
    '<i class="fas fa-mountain"></i> Face the Wilderness. Survive the Unknown. <i class="fas fa-compass"></i>',
    '<i class="fas fa-dragon"></i> Discover. Conquer. Leave Your Mark. <i class="fas fa-footprints"></i>',
    '<i class="fas fa-dungeon"></i> Enter the Depths. Claim Your Treasure. <i class="fas fa-gem"></i>',
    '<i class="fas fa-handshake"></i> Make Allies or Enemies. The Choice is Yours. <i class="fas fa-scroll"></i>',
    '<i class="fas fa-rocket"></i> Dream Big. Build Bigger. <i class="fas fa-city"></i>'
];

const tips = [
    '<i class="fas fa-gift"></i> Tip: Need starter gear? Use <b>/kits kabayan3</b> to claim your kit!',
    '<i class="fas fa-treasure-chest"></i> Tip: Check out daily rewards with <b>/rewards</b>!',
    '<i class="fas fa-map"></i> Tip: Explore new biomes to find hidden treasures!',
    '<i class="fas fa-tools"></i> Tip: Repair your gear using an anvil before it breaks!',
    '<i class="fas fa-shield-alt"></i> Tip: Always keep a shield handy for PvP battles!'
];

let currentIndex = 0;
const messageElement = document.getElementById("game-message");

// Apply CSS for smooth transitions
messageElement.style.transition = "opacity 0.8s ease-in-out";

// Function to update the message smoothly
function updateMessage() {
    messageElement.style.opacity = 0; // Fade out
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % messages.length; // Cycle through messages
        const randomTip = tips[Math.floor(Math.random() * tips.length)]; // Random tip
        messageElement.innerHTML = Math.random() > 0.5 ? messages[currentIndex] : randomTip; // Show either a message or a tip
        messageElement.style.opacity = 1; // Fade in
    }, 800); // Wait for fade out before changing text
}

// Change message every 5 seconds
setInterval(updateMessage, 5000);

// Discord Webhook URL (Replace with your actual webhook URL)
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1326716044739481682/QNXURH3wlBQdMpxU8e94eY3XGwSA8jVVfW6csZ8xFtRQ9J9DT-5r3M4PcYNv38yNixaS";

// Get modal and button elements
const modal = document.getElementById("ticketModal");
const supportButton = document.getElementById("supportButton");
const closeModal = document.querySelector(".close");
const submitButton = document.querySelector("#ticketForm button");

const COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

// Function to check cooldown
function checkCooldown() {
    const lastSubmitTime = localStorage.getItem("lastSubmitTime");
    if (lastSubmitTime) {
        const elapsedTime = Date.now() - parseInt(lastSubmitTime, 10);
        if (elapsedTime < COOLDOWN_TIME) {
            updateCooldownButton(COOLDOWN_TIME - elapsedTime);
            return;
        }
    }
    submitButton.disabled = false;
    submitButton.innerText = "Submit Ticket";
}

// Function to update button with countdown
function updateCooldownButton(remainingTime) {
    submitButton.disabled = true;
    
    const updateCountdown = () => {
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.ceil((remainingTime % 60000) / 1000);
        submitButton.innerText = `Wait ${minutes}m ${seconds}s`;

        if (remainingTime <= 0) {
            submitButton.disabled = false;
            submitButton.innerText = "Submit Ticket";
            return;
        }

        remainingTime -= 1000;
        setTimeout(updateCountdown, 1000);
    };

    updateCountdown();
}

// Check cooldown on page load
checkCooldown();

// Open modal when clicking the floating support button
supportButton.addEventListener("click", () => {
    modal.style.display = "block";
    checkCooldown();
});

// Close modal when clicking the "X" button
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Handle ticket submission
document.getElementById("ticketForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (submitButton.disabled) return;

    const minecraftUsername = document.getElementById("minecraftUsername").value;
    const discordUsername = document.getElementById("discordUsername").value;
    const issue = document.getElementById("issue").value;

    const message = {
        content: `🎫 **New Support Ticket From Web** 🎫\n\n**Minecraft Username:** ${minecraftUsername}\n**Discord Username:** ${discordUsername}\n**Issue:** ${issue}`
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message)
        });

        if (response.ok) {
            document.getElementById("ticketResponse").innerHTML = "✅ Ticket submitted! Our team will assist you soon.";
            document.getElementById("ticketForm").reset();

            localStorage.setItem("lastSubmitTime", Date.now().toString());
            checkCooldown();

            setTimeout(() => {
                modal.style.display = "none";
            }, 3000);
        } else {
            throw new Error("Failed to submit ticket");
        }
    } catch (error) {
        document.getElementById("ticketResponse").innerHTML = "❌ Error submitting ticket. Please try again.";
    }
});

});