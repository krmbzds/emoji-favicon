document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements - Desktop
  const emojiInput = document.getElementById("emoji-input");
  const previewFavicon = document.getElementById("preview-favicon");
  const outputText = document.getElementById("output-text");
  const copyBtn = document.getElementById("copy-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const tabTitle = document.querySelector(".tab-title");
  const addressText = document.querySelector(".address-text");
  const browserMenu = document.querySelector(".browser-menu");
  const browserDropdown = document.getElementById("browser-dropdown");

  // DOM Elements - Mobile
  const mobileEmojiInput = document.getElementById("mobile-emoji-input");
  const mobileGenerateBtn = document.getElementById("mobile-generate-btn");
  const mobileFavicon = document.getElementById("mobile-favicon");
  const mobilePreviewFavicon = document.getElementById(
    "mobile-preview-favicon",
  );
  const mobileOutputText = document.getElementById("mobile-output-text");
  const mobileCopyBtn = document.getElementById("mobile-copy-btn");
  const mobileTabs = document.querySelectorAll(".mobile-tab");

  // Initialize the app
  function init() {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    // Generate initial favicon
    generateFavicon();

    // Set up event listeners
    setupEventListeners();
  }

  // Set up all event listeners
  function setupEventListeners() {
    // Emoji input change
    emojiInput.addEventListener("input", generateFavicon);

    // Copy button click
    copyBtn.addEventListener("click", copyToClipboard);

    // Theme toggle click
    themeToggle.addEventListener("click", toggleTheme);

    // Prevent emoji input from accepting more than 2 characters
    emojiInput.addEventListener("input", function (e) {
      if (e.target.value.length > 2) {
        e.target.value = e.target.value.slice(0, 2);
      }
    });

    // Tab title change - update favicon when title changes
    tabTitle.addEventListener("input", generateFavicon);

    // Address text change - update favicon when URL changes
    addressText.addEventListener("input", generateFavicon);

    // Prevent Enter key from creating newlines in editable fields
    tabTitle.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        tabTitle.blur();
      }
    });

    addressText.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addressText.blur();
      }
    });

    // Browser menu toggle
    browserMenu.addEventListener("click", toggleDropdown);

    // Refresh button click - reset values
    document
      .querySelector(".nav-button:nth-child(3)")
      .addEventListener("click", function () {
        resetValues();
      });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".browser-menu-container")) {
        closeDropdown();
      }
    });

    // Handle tab close button clicks
    document.querySelectorAll(".tab-close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const tab = this.closest(".browser-tab");
        if (!tab) return;

        // Check which tab is being closed by checking the tab title
        const tabTitle = tab.querySelector(".tab-title").textContent;

        // Allow closing Habbo Hotel and America Online tabs
        if (tabTitle === "Habbo Hotel") {
          playHabboCloseSound();
          tab.remove();
        } else if (tabTitle === "America Online") {
          playAOLCloseSound();
          tab.remove();
        } else if (tabTitle === "Cheap Viagra") {
          // Check if antivirus mode is active
          const isAntivirusActive =
            document.body.getAttribute("data-antivirus-active") === "true";

          if (isAntivirusActive) {
            // Play sound and remove tab
            playAhhSound();

            // Activate the first tab before removing this one
            const firstTab = document.querySelector(".browser-tab");
            if (firstTab) {
              firstTab.classList.add("active");
            }

            tab.remove();

            // Schedule the tab to reappear after 20 seconds
            setTimeout(() => {
              // Check if antivirus mode is still active
              const stillActive =
                document.body.getAttribute("data-antivirus-active") === "true";

              if (stillActive) {
                addCheapViagraTab();
              }
            }, 20000); // 20 seconds
          }
        }
        // Prevent closing the first tab (preview tab) unless it's the Cheap Viagra tab
        else if (
          this.id === "preview-tab-close" &&
          tabTitle !== "Cheap Viagra"
        ) {
          return; // Don't close the preview tab
        }
      });
    });

    // Handle tab clicks for Habbo Hotel and America Online
    document.querySelectorAll(".browser-tab").forEach((tab) => {
      tab.addEventListener("click", function (e) {
        // Don't trigger if clicking on the close button
        if (e.target.classList.contains("tab-close")) return;

        const tabTitle = this.querySelector(".tab-title").textContent;
        if (tabTitle === "Habbo Hotel") {
          playHabboClickSound();
        } else if (tabTitle === "America Online") {
          playAOLClickSound();
        }
      });
    });

    // Handle easter egg item click
    document
      .querySelector(".dropdown-item")
      .addEventListener("click", function () {
        // Flash yellow borders on active tab and address bar
        flashBorders();
        closeDropdown();
      });

    // Handle install antivirus click
    document
      .getElementById("install-antivirus")
      .addEventListener("click", function () {
        toggleAntivirusToolbar();
        closeDropdown();
      });

    // Handle antivirus toolbar button clicks
    document.querySelectorAll(".antivirus-btn").forEach((button) => {
      button.addEventListener("click", function () {
        playAhhSound();
      });
    });

    // Handle tools link click
    document
      .querySelector(".tools-link")
      .addEventListener("click", function () {
        window.open("https://kerembozdas.com", "_blank");
        closeDropdown();
      });

    // Mobile-specific event listeners
    setupMobileEventListeners();
  }

  // Toggle dropdown menu
  function toggleDropdown(e) {
    // If event is provided, prevent default behavior
    if (e) {
      e.stopPropagation();
    }
    browserDropdown.classList.toggle("show");
  }

  // Close dropdown menu
  function closeDropdown() {
    browserDropdown.classList.remove("show");
  }

  // Flash gentle borders on active tab and address bar
  function flashBorders() {
    const activeTab = document.querySelector(".browser-tab.active");
    const addressBar = document.querySelector(".address-bar");

    // Add temporary gentle highlight
    activeTab.style.transition = "border-color 0.3s ease";
    addressBar.style.transition = "border-color 0.3s ease";
    activeTab.style.borderColor = "#9580ff";
    addressBar.style.borderColor = "#9580ff";

    // Remove highlight after 500ms (longer, gentler)
    setTimeout(() => {
      activeTab.style.borderColor = "";
      addressBar.style.borderColor = "";
    }, 500);
  }

  // Generate favicon HTML and update preview
  function generateFavicon() {
    const emoji = emojiInput.value.trim() || "😩";

    // Update preview
    previewFavicon.textContent = emoji;

    // Generate SVG favicon HTML
    const svgData = generateSvgFavicon(emoji);
    const svgDataDisplay = generateSvgFaviconDisplay(emoji);
    let htmlCode = `<link rel="icon" href="${svgDataDisplay}">`;

    // Check if antivirus mode is active and shuffle the HTML if it is
    const isAntivirusActive =
      document.body.getAttribute("data-antivirus-active") === "true";
    if (isAntivirusActive) {
      htmlCode = shuffleHtmlCode(htmlCode);
    }

    // Update output textarea
    outputText.value = htmlCode;

    // Update the actual favicon of the page
    updatePageFavicon(svgData);
  }

  // Generate SVG favicon data URI
  function generateSvgFavicon(emoji) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${escapeHtml(emoji)}</text></svg>`;
    const encodedSvg = encodeURIComponent(svg);
    return `data:image/svg+xml,${encodedSvg}`;
  }

  // Generate SVG favicon data URI for display (non-encoded)
  function generateSvgFaviconDisplay(emoji) {
    return `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${escapeHtml(emoji)}</text></svg>`;
  }

  // Escape HTML characters
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Update the actual page favicon
  function updatePageFavicon(svgData) {
    // Remove existing favicon if any
    let existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Create and add new favicon
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = svgData;
    document.head.appendChild(favicon);
  }

  // Copy generated code to clipboard
  async function copyToClipboard() {
    const code = outputText.value;

    // Check if antivirus mode is active
    const isAntivirusActive =
      document.body.getAttribute("data-antivirus-active") === "true";

    if (isAntivirusActive) {
      playAhhSound();
    }

    try {
      await navigator.clipboard.writeText(code);
      showCopySuccess();
    } catch (err) {
      // Fallback for older browsers
      fallbackCopyToClipboard(code);
      showCopySuccess();
    }
  }

  // Fallback copy method
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
  }

  // Show copy success feedback
  function showCopySuccess() {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied!
    `;
    copyBtn.style.color = "var(--primary-color)";

    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.color = "";
    }, 2000);
  }

  // Toggle between dark and light theme
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }

  // Set theme
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // Reset values to defaults
  function resetValues() {
    // Reset emoji input
    emojiInput.value = "😩";

    // Reset tab title
    tabTitle.textContent = "Your Website";

    // Reset URL
    addressText.textContent = "https://yourwebsite.com";

    // Restore closed tabs if they don't exist
    restoreClosedTabs();

    // Regenerate favicon with default emoji
    generateFavicon();

    // Flash borders to indicate reset
    flashBorders();
  }

  // Restore closed tabs (Habbo Hotel and America Online)
  function restoreClosedTabs() {
    const browserTabs = document.querySelector(".browser-tabs");
    const newTabButton = document.querySelector(".new-tab-button");

    // Check if Habbo Hotel tab exists
    const habboTab = Array.from(document.querySelectorAll(".browser-tab")).find(
      (tab) => tab.querySelector(".tab-title").textContent === "Habbo Hotel",
    );

    // Create Habbo Hotel tab if it doesn't exist
    if (!habboTab) {
      const habboTabElement = document.createElement("div");
      habboTabElement.className = "browser-tab";
      habboTabElement.innerHTML = `
        <div class="tab-favicon">🏩</div>
        <div class="tab-title">Habbo Hotel</div>
        <div class="tab-close">×</div>
      `;

      // Insert before the new tab button
      browserTabs.insertBefore(habboTabElement, newTabButton);

      // Add event listeners to the new tab
      setupTabEventListeners(habboTabElement);
    }

    // Check if America Online tab exists
    const aolTab = Array.from(document.querySelectorAll(".browser-tab")).find(
      (tab) => tab.querySelector(".tab-title").textContent === "America Online",
    );

    // Create America Online tab if it doesn't exist
    if (!aolTab) {
      const aolTabElement = document.createElement("div");
      aolTabElement.className = "browser-tab";
      aolTabElement.innerHTML = `
        <div class="tab-favicon">💾</div>
        <div class="tab-title">America Online</div>
        <div class="tab-close">×</div>
      `;

      // Insert before the new tab button
      browserTabs.insertBefore(aolTabElement, newTabButton);

      // Add event listeners to the new tab
      setupTabEventListeners(aolTabElement);
    }
  }

  // Set up event listeners for a tab (used for dynamically created tabs)
  function setupTabEventListeners(tab) {
    // Add click listener for tab
    tab.addEventListener("click", function (e) {
      // Don't trigger if clicking on the close button
      if (e.target.classList.contains("tab-close")) return;

      const tabTitle = this.querySelector(".tab-title").textContent;
      if (tabTitle === "Habbo Hotel") {
        playHabboClickSound();
      } else if (tabTitle === "America Online") {
        playAOLClickSound();
      }
    });

    // Add click listener for close button
    const closeBtn = tab.querySelector(".tab-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const tabElement = this.closest(".browser-tab");
        if (!tabElement) return;

        // Check which tab is being closed by checking the tab title
        const tabTitle = tabElement.querySelector(".tab-title").textContent;

        // Allow closing Habbo Hotel and America Online tabs
        if (tabTitle === "Habbo Hotel") {
          playHabboCloseSound();
          tabElement.remove();
        } else if (tabTitle === "America Online") {
          playAOLCloseSound();
          tabElement.remove();
        } else if (tabTitle === "Cheap Viagra") {
          // Check if antivirus mode is active
          const isAntivirusActive =
            document.body.getAttribute("data-antivirus-active") === "true";

          if (isAntivirusActive) {
            // Play sound and remove tab
            playAhhSound();

            // Activate the first tab before removing this one
            const firstTab = document.querySelector(".browser-tab");
            if (firstTab) {
              firstTab.classList.add("active");
            }

            tabElement.remove();

            // Schedule the tab to reappear after 20 seconds
            setTimeout(() => {
              // Check if antivirus mode is still active
              const stillActive =
                document.body.getAttribute("data-antivirus-active") === "true";

              if (stillActive) {
                addCheapViagraTab();
              }
            }, 20000); // 20 seconds
          }
        }
        // Prevent closing the first tab (preview tab) unless it's the Cheap Viagra tab
        else if (
          this.id === "preview-tab-close" &&
          tabTitle !== "Cheap Viagra"
        ) {
          return; // Don't close the preview tab
        }
      });
    }
  }

  // Play sound when Habbo Hotel tab is clicked
  function playHabboClickSound() {
    const audio = new Audio("assets/audio/jackin_chicago_48_9.mp3");
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  }

  // Play sound when Habbo Hotel tab close button is clicked
  function playHabboCloseSound() {
    const audio = new Audio("assets/audio/dj_fuses_duck_funk_04_6.mp3");
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  }

  // Play sound when America Online tab is clicked
  function playAOLClickSound() {
    const audio = new Audio("assets/audio/aol.mp3");
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  }

  // Play sound when America Online tab close button is clicked
  function playAOLCloseSound() {
    const audio = new Audio("assets/audio/win_3_1_xylo.mp3");
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  }

  // Handle emoji picker (if available)
  function handleEmojiPicker() {
    // This could be extended to include an emoji picker
    // For now, we rely on native emoji input
    console.log("Emoji picker functionality can be added here");
  }

  // Validate emoji input
  function validateEmoji(emoji) {
    // Basic validation - check if it's a valid emoji
    // This is a simple check, could be enhanced
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(emoji);
  }

  // Toggle antivirus toolbar visibility
  function toggleAntivirusToolbar() {
    const toolbar = document.getElementById("antivirus-toolbar");
    const menuItem = document.getElementById("install-antivirus");
    const dropdown = document.getElementById("browser-dropdown");

    if (toolbar.style.display === "none") {
      toolbar.style.display = "block";
      // Play hellno sound when antivirus is activated
      playHellnoSound();

      // Hide the dropdown menu after activation
      dropdown.classList.remove("show");

      // Prevent toolbar from being removed by hiding the menu item
      menuItem.style.display = "none";

      addressText.textContent = "https://templeos.org";

      // Set antivirus mode as active
      document.body.setAttribute("data-antivirus-active", "true");

      // Regenerate favicon to apply shuffling to existing output
      generateFavicon();

      // Start continuous shuffling of output text
      startContinuousShuffle();

      // Change mouse cursor to flying saucer
      changeCursorToFlyingSaucer();

      // Start the notification counter on America Online tab
      startNotificationCounter();

      // Schedule the Cheap Viagra tab to appear after 20 seconds
      scheduleCheapViagraTab();
    } else {
      // Don't allow hiding the toolbar once activated
      // toolbar.style.display = "none";
    }
  }

  // Play hellno sound when antivirus is activated
  function playHellnoSound() {
    const audio = new Audio("assets/audio/hellno.mp3");
    audio.volume = 0.7; // Set volume to 70%
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });

    // Start music loop after hellno sound finishes
    audio.addEventListener("ended", () => {
      startMusicLoop();

      // Start emoji input animation when antivirus is activated
      if (emojiInput) {
        startEmojiInputAnimation();
      }
    });
  }

  // Play ahh sound when toolbar buttons are clicked
  function playAhhSound() {
    const audio = new Audio("assets/audio/ahh.mp3");
    audio.volume = 0.7; // Set volume to 70%
    audio.play().catch((error) => {
      console.log("Ahh sound playback failed:", error);
    });
  }

  // Shuffle HTML code by swapping single adjacent characters randomly
  function shuffleHtmlCode(htmlCode) {
    // Parse the HTML to extract tag attributes (not the href value)
    const tagMatch = htmlCode.match(/<link\s+([^>]+)>/);
    if (!tagMatch) return htmlCode;

    const attributes = tagMatch[1];
    const chars = attributes.split("");

    // Find positions of characters within attribute names and values (not in the href URL)
    const swappablePositions = [];
    let inAttribute = false;
    let inHref = false;
    let currentAttr = "";

    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === "=") {
        inAttribute = true;
        if (currentAttr === "href") {
          inHref = true;
        }
        currentAttr = "";
      } else if (chars[i] === " " && inAttribute) {
        inAttribute = false;
        inHref = false;
      } else if (!inAttribute && chars[i] !== " ") {
        currentAttr += chars[i];
      }

      // Allow swapping if we're not in the href value and not at spaces or quotes
      if (
        !inHref &&
        chars[i] !== " " &&
        chars[i] !== '"' &&
        chars[i] !== "'" &&
        i < chars.length - 1
      ) {
        if (
          chars[i + 1] !== " " &&
          chars[i + 1] !== '"' &&
          chars[i + 1] !== "'" &&
          chars[i + 1] !== "="
        ) {
          swappablePositions.push(i);
        }
      }
    }

    // If there are swappable positions, randomly swap one pair
    if (swappablePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * swappablePositions.length);
      const position = swappablePositions[randomIndex];

      // Swap the adjacent characters
      [chars[position], chars[position + 1]] = [
        chars[position + 1],
        chars[position],
      ];

      // Rebuild the HTML with the swapped characters
      const newAttributes = chars.join("");
      return htmlCode.replace(/<link\s+([^>]+)>/, `<link ${newAttributes}>`);
    }

    return htmlCode;
  }

  // Start continuous shuffling of output text when antivirus is active
  let shuffleInterval;
  function startContinuousShuffle() {
    // Clear any existing interval
    if (shuffleInterval) {
      clearInterval(shuffleInterval);
    }

    // Shuffle the output text every 500ms for a frantic effect
    shuffleInterval = setInterval(() => {
      const isAntivirusActive =
        document.body.getAttribute("data-antivirus-active") === "true";
      if (isAntivirusActive) {
        // Shuffle desktop output
        if (outputText.value) {
          outputText.value = shuffleHtmlCode(outputText.value);
        }

        // Shuffle mobile output
        const mobileOutputText = document.getElementById("mobile-output-text");
        if (mobileOutputText && mobileOutputText.textContent) {
          mobileOutputText.textContent = shuffleHtmlCode(
            mobileOutputText.textContent,
          );
        }
      } else {
        // Restore normal cursor when antivirus is not active
        restoreNormalCursor();
      }
    }, 500);
  }

  // Empty function - animation removed
  function animateCharacterSwap(element, position) {
    // Animation functionality removed - only swapping remains
  }

  // Change mouse cursor to flying saucer when antivirus mode is active
  function changeCursorToFlyingSaucer() {
    // Apply the PNG file as cursor
    document.body.style.cursor = `url('assets/images/saucer.png'), auto`;

    // Apply to all interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, input, textarea, [contenteditable="true"]',
    );
    interactiveElements.forEach((element) => {
      element.style.cursor = `url('assets/images/saucer.png'), auto`;
    });
  }

  // Restore normal cursor when antivirus mode is not active
  function restoreNormalCursor() {
    document.body.style.cursor = "";

    // Restore normal cursor for interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, input, textarea, [contenteditable="true"]',
    );
    interactiveElements.forEach((element) => {
      element.style.cursor = "";
    });
  }

  // Start notification counter on America Online tab
  let notificationInterval;
  let notificationCount = 1;

  function startNotificationCounter() {
    // Find America Online tab
    const aolTab = Array.from(document.querySelectorAll(".browser-tab")).find(
      (tab) => tab.querySelector(".tab-title").textContent === "America Online",
    );

    if (!aolTab) return;

    // Find the tab title and close button elements
    const tabTitle = aolTab.querySelector(".tab-title");
    const tabClose = aolTab.querySelector(".tab-close");

    // Create notification badge if it doesn't exist
    let notificationBadge = aolTab.querySelector(".notification-badge");
    if (!notificationBadge) {
      notificationBadge = document.createElement("div");
      notificationBadge.className = "notification-badge";
      // Insert the badge between the title and close button
      aolTab.insertBefore(notificationBadge, tabClose);
    }

    // Reset counter
    notificationCount = 1;
    notificationBadge.textContent = notificationCount;

    // Clear any existing interval
    if (notificationInterval) {
      clearInterval(notificationInterval);
    }

    // Start frantically increasing counter
    notificationInterval = setInterval(() => {
      notificationCount++;
      notificationBadge.textContent = notificationCount;

      // Add a pulse effect for visual emphasis
      notificationBadge.style.transform = "scale(1.2)";
      setTimeout(() => {
        notificationBadge.style.transform = "scale(1)";
      }, 100);
    }, 300); // Update every 300ms for frantic effect
  }

  // Start emoji input animation when antivirus is active
  let emojiAnimationInterval;
  let growing = true;

  function startEmojiInputAnimation() {
    // Clear any existing interval
    if (emojiAnimationInterval) {
      clearInterval(emojiAnimationInterval);
    }

    // Start continuous jittery animation
    emojiAnimationInterval = setInterval(() => {
      // Generate random scale between 0.9 and 1.3 for continuous jittery effect
      const randomScale = 0.9 + Math.random() * 0.4;
      emojiInput.style.transform = `scale(${randomScale})`;
    }, 150); // Update every 150ms for continuous jittery effect
  }

  // Start continuous music loop with Randomized Dual-Head Queue algorithm
  let currentMusicIndex = 0;
  let musicPlaylist = []; // The playlist that will be reordered
  let isPlaying = false;

  function startMusicLoop() {
    if (isPlaying) return; // Prevent multiple loops

    // Load available music tracks
    const musicTracks = [
      "assets/audio/toolbar/1.mp3",
      "assets/audio/toolbar/2.mp3",
      "assets/audio/toolbar/3.mp3",
      "assets/audio/toolbar/4.mp3",
      "assets/audio/toolbar/5.mp3",
      "assets/audio/toolbar/6.mp3",
      "assets/audio/toolbar/7.mp3",
      "assets/audio/toolbar/8.mp3",
      "assets/audio/toolbar/9.mp3",
      "assets/audio/toolbar/10.mp3",
      "assets/audio/toolbar/11.mp3",
      "assets/audio/toolbar/12.mp3",
      "assets/audio/toolbar/13.mp3",
      "assets/audio/toolbar/14.mp3",
      "assets/audio/toolbar/15.mp3",
      "assets/audio/toolbar/16.mp3",
      "assets/audio/toolbar/17.mp3",
      "assets/audio/toolbar/18.mp3",
      "assets/audio/toolbar/19.mp3",
      "assets/audio/toolbar/20.mp3",
      "assets/audio/toolbar/21.mp3",
      "assets/audio/toolbar/22.mp3",
      "assets/audio/toolbar/23.mp3",
      "assets/audio/toolbar/24.mp3",
      "assets/audio/toolbar/25.mp3",
      "assets/audio/toolbar/26.mp3",
      "assets/audio/toolbar/27.mp3",
    ];

    // Initialize the playlist with all tracks
    musicPlaylist = [...musicTracks];

    // Shuffle the initial playlist to start with a random order
    shuffleArray(musicPlaylist);

    isPlaying = true;
    playNextTrack();
  }

  // Function to shuffle an array (Fisher-Yates algorithm)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Function to get the next track using Randomized Dual-Head Queue algorithm
  function getNextTrack() {
    if (musicPlaylist.length === 0) return null;

    // Determine how many tracks to choose from at the front of the playlist
    // We'll use 2 tracks as described in the blog post (n-2 guarantee)
    const choiceCount = Math.min(2, musicPlaylist.length);

    // Pick a random track from the first 'choiceCount' elements
    const randomIndex = Math.floor(Math.random() * choiceCount);
    const selectedTrack = musicPlaylist[randomIndex];

    // Remove the selected track from its current position
    musicPlaylist.splice(randomIndex, 1);

    // Add the selected track to the end of the playlist
    musicPlaylist.push(selectedTrack);

    return selectedTrack;
  }

  function playNextTrack() {
    if (!isPlaying) return;

    // Play static sound between tracks
    const staticSound = new Audio("assets/audio/static.mp3");
    staticSound.volume = 0.5;
    staticSound.play().catch((error) => {
      console.log("Static sound failed:", error);
    });

    // Get the next track using the Randomized Dual-Head Queue algorithm
    const selectedTrack = getNextTrack();

    if (!selectedTrack) {
      console.error("No track available to play");
      return;
    }

    // Find the index of the selected track in the original tracks array (for reference)
    const originalTracks = [
      "assets/audio/toolbar/1.mp3",
      "assets/audio/toolbar/2.mp3",
      "assets/audio/toolbar/3.mp3",
      "assets/audio/toolbar/4.mp3",
      "assets/audio/toolbar/5.mp3",
      "assets/audio/toolbar/6.mp3",
      "assets/audio/toolbar/7.mp3",
      "assets/audio/toolbar/8.mp3",
      "assets/audio/toolbar/9.mp3",
      "assets/audio/toolbar/10.mp3",
      "assets/audio/toolbar/11.mp3",
      "assets/audio/toolbar/12.mp3",
      "assets/audio/toolbar/13.mp3",
      "assets/audio/toolbar/14.mp3",
      "assets/audio/toolbar/15.mp3",
      "assets/audio/toolbar/16.mp3",
      "assets/audio/toolbar/17.mp3",
      "assets/audio/toolbar/18.mp3",
      "assets/audio/toolbar/19.mp3",
      "assets/audio/toolbar/20.mp3",
      "assets/audio/toolbar/21.mp3",
      "assets/audio/toolbar/22.mp3",
      "assets/audio/toolbar/23.mp3",
      "assets/audio/toolbar/24.mp3",
      "assets/audio/toolbar/25.mp3",
      "assets/audio/toolbar/26.mp3",
      "assets/audio/toolbar/27.mp3",
    ];
    currentMusicIndex = originalTracks.indexOf(selectedTrack);

    const music = new Audio(selectedTrack);
    music.volume = 0.6;
    music.play().catch((error) => {
      console.log("Music playback failed:", error);
    });

    // Schedule next track when current one ends
    music.addEventListener("ended", () => {
      setTimeout(() => {
        playStaticAndNextTrack();
      }, 100); // Small delay before static
    });
  }

  function playStaticAndNextTrack() {
    if (!isPlaying) return;

    // Play static sound
    const staticSound = new Audio("assets/audio/static.mp3");
    staticSound.volume = 0.5;
    staticSound.play().catch((error) => {
      console.log("Static sound failed:", error);
    });

    // Play next track after static
    setTimeout(() => {
      if (isPlaying) {
        // Get the next track using the Randomized Dual-Head Queue algorithm
        const selectedTrack = getNextTrack();

        if (!selectedTrack) {
          console.error("No track available to play");
          return;
        }

        // Find the index of the selected track in the original tracks array
        const originalTracks = [
          "assets/audio/toolbar/1.mp3",
          "assets/audio/toolbar/2.mp3",
          "assets/audio/toolbar/3.mp3",
          "assets/audio/toolbar/4.mp3",
          "assets/audio/toolbar/5.mp3",
          "assets/audio/toolbar/6.mp3",
          "assets/audio/toolbar/7.mp3",
          "assets/audio/toolbar/8.mp3",
          "assets/audio/toolbar/9.mp3",
          "assets/audio/toolbar/10.mp3",
          "assets/audio/toolbar/11.mp3",
          "assets/audio/toolbar/12.mp3",
          "assets/audio/toolbar/13.mp3",
          "assets/audio/toolbar/14.mp3",
          "assets/audio/toolbar/15.mp3",
          "assets/audio/toolbar/16.mp3",
          "assets/audio/toolbar/17.mp3",
          "assets/audio/toolbar/18.mp3",
          "assets/audio/toolbar/19.mp3",
          "assets/audio/toolbar/20.mp3",
          "assets/audio/toolbar/21.mp3",
          "assets/audio/toolbar/22.mp3",
          "assets/audio/toolbar/23.mp3",
          "assets/audio/toolbar/24.mp3",
          "assets/audio/toolbar/25.mp3",
          "assets/audio/toolbar/26.mp3",
          "assets/audio/toolbar/27.mp3",
        ];
        currentMusicIndex = originalTracks.indexOf(selectedTrack);

        const nextMusic = new Audio(selectedTrack);
        nextMusic.volume = 0.6;
        nextMusic.play().catch((error) => {
          console.log("Next music failed:", error);
        });

        nextMusic.addEventListener("ended", () => {
          setTimeout(() => {
            playStaticAndNextTrack();
          }, 100);
        });
      }
    }, 800); // Static duration
  }

  // Setup mobile-specific event listeners
  function setupMobileEventListeners() {
    // Mobile emoji input change
    if (mobileEmojiInput) {
      mobileEmojiInput.addEventListener("input", function () {
        const emoji = mobileEmojiInput.value.trim() || "😩";

        // Update mobile preview
        const mobileFavicon = document.getElementById("mobile-favicon");
        const mobilePreviewFavicon = document.getElementById(
          "mobile-preview-favicon",
        );
        const mobileOutputText = document.getElementById("mobile-output-text");

        if (mobileFavicon) mobileFavicon.textContent = emoji;
        if (mobilePreviewFavicon) mobilePreviewFavicon.textContent = emoji;

        // Generate SVG favicon data
        const svgDataDisplay = generateSvgFaviconDisplay(emoji);
        let htmlCode = `<link rel="icon" href="${svgDataDisplay}">`;

        // Check if antivirus mode is active and shuffle the HTML if it is
        const isAntivirusActive =
          document.body.getAttribute("data-antivirus-active") === "true";
        if (isAntivirusActive) {
          htmlCode = shuffleHtmlCode(htmlCode);
        }

        // Update mobile output
        if (mobileOutputText) mobileOutputText.textContent = htmlCode;
      });
    }

    // Mobile generate button click
    if (mobileGenerateBtn) {
      mobileGenerateBtn.addEventListener("click", function () {
        // Trigger input event to update preview
        if (mobileEmojiInput) {
          const event = new Event("input", { bubbles: true });
          mobileEmojiInput.dispatchEvent(event);
        }
      });
    }

    // Mobile copy button click
    if (mobileCopyBtn) {
      mobileCopyBtn.addEventListener("click", async function () {
        const mobileOutputText = document.getElementById("mobile-output-text");
        if (mobileOutputText) {
          const code = mobileOutputText.textContent;

          // Check if antivirus mode is active
          const isAntivirusActive =
            document.body.getAttribute("data-antivirus-active") === "true";

          if (isAntivirusActive) {
            playAhhSound();
          }

          try {
            await navigator.clipboard.writeText(code);
            // Show success feedback
            const originalText = mobileCopyBtn.textContent;
            mobileCopyBtn.textContent = "Copied!";
            mobileCopyBtn.style.backgroundColor = "var(--primary-color)";

            setTimeout(() => {
              mobileCopyBtn.textContent = originalText;
              mobileCopyBtn.style.backgroundColor = "";
            }, 2000);
          } catch (err) {
            console.error("Failed to copy:", err);
          }
        }
      });
    }

    // Mobile tab clicks
    if (mobileTabs) {
      mobileTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
          // Remove active class from all tabs
          mobileTabs.forEach((t) => t.classList.remove("active"));
          // Add active class to clicked tab
          this.classList.add("active");

          // Play sound based on tab data-sound attribute
          const soundType = this.getAttribute("data-sound");
          if (soundType === "jackin") {
            playHabboClickSound();
          } else if (soundType === "aol") {
            playAOLClickSound();
          }
        });
      });
    }
  }

  // Initialize the app when DOM is ready
  init();
});

// Additional utility functions
const EmojiFaviconGenerator = {
  // Generate favicon with custom size
  generateCustomSize: function (emoji, size = 100) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><text y=".9em" font-size="${size * 0.9}">${emoji}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },

  // Generate favicon with background color
  generateWithBackground: function (
    emoji,
    bgColor = "#22212C",
    textColor = "#F8F8F2",
  ) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bgColor}"/><text y=".9em" font-size="90" fill="${textColor}">${emoji}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },

  // Generate multiple sizes for different devices
  generateResponsive: function (emoji) {
    return {
      favicon: this.generateCustomSize(emoji, 32),
      appleTouchIcon: this.generateCustomSize(emoji, 180),
      icon192: this.generateCustomSize(emoji, 192),
      icon512: this.generateCustomSize(emoji, 512),
    };
  },
};

// Schedule Cheap Viagra tab to appear after 20 seconds when antivirus mode is active
let cheapViagraTimeout;
function scheduleCheapViagraTab() {
  // Clear any existing timeout
  if (cheapViagraTimeout) {
    clearTimeout(cheapViagraTimeout);
  }

  // Set timeout for 20 seconds
  cheapViagraTimeout = setTimeout(() => {
    // Check if antivirus mode is still active
    const isAntivirusActive =
      document.body.getAttribute("data-antivirus-active") === "true";

    if (isAntivirusActive) {
      addCheapViagraTab();
    }
  }, 20000); // 20 seconds
}

// Start continuous pulsing animation for a tab
function startTabPulse(tab) {
  if (!tab) return;

  // Add continuous pulsing animation
  tab.style.animation = "tabPulse 2s ease-in-out infinite";
}

// Add Cheap Viagra tab to the browser
function addCheapViagraTab() {
  const browserTabs = document.querySelector(".browser-tabs");
  const newTabButton = document.querySelector(".new-tab-button");

  if (!browserTabs || !newTabButton) return;

  // Check if Cheap Viagra tab already exists
  const existingTab = Array.from(
    document.querySelectorAll(".browser-tab"),
  ).find(
    (tab) => tab.querySelector(".tab-title").textContent === "Cheap Viagra",
  );

  // Only add the tab if it doesn't already exist
  if (!existingTab) {
    const cheapViagraTab = document.createElement("div");
    cheapViagraTab.className = "browser-tab";
    cheapViagraTab.innerHTML = `
      <div class="tab-favicon">💊</div>
      <div class="tab-title">Cheap Viagra</div>
      <div class="tab-close">×</div>
    `;

    // Insert before the new tab button
    browserTabs.insertBefore(cheapViagraTab, newTabButton);

    // Add event listeners to the new tab
    cheapViagraTab.addEventListener("click", function (e) {
      // Don't trigger if clicking on the close button
      if (e.target.classList.contains("tab-close")) return;

      // No special sound for Cheap Viagra tab click
    });

    // Add click listener for close button
    const closeBtn = cheapViagraTab.querySelector(".tab-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const tabElement = this.closest(".browser-tab");
        if (!tabElement) return;

        // Check if antivirus mode is active
        const isAntivirusActive =
          document.body.getAttribute("data-antivirus-active") === "true";

        if (isAntivirusActive) {
          // Play sound and remove tab
          const audio = new Audio("assets/audio/ahh.mp3");
          audio.volume = 0.7;
          audio.play().catch((error) => {
            console.log("Ahh sound playback failed:", error);
          });

          // Activate the first tab before removing this one
          const firstTab = document.querySelector(".browser-tab");
          if (firstTab) {
            firstTab.classList.add("active");
          }

          tabElement.remove();

          // Schedule the tab to reappear after 20 seconds
          setTimeout(() => {
            // Check if antivirus mode is still active
            const stillActive =
              document.body.getAttribute("data-antivirus-active") === "true";

            if (stillActive) {
              addCheapViagraTab();
            }
          }, 20000); // 20 seconds
        }
      });
    }

    // Flash the new tab to draw attention
    cheapViagraTab.style.animation = "tabFlash 1s ease-in-out 3";
    setTimeout(() => {
      cheapViagraTab.style.animation = "";

      // Start continuous pulsing animation
      startTabPulse(cheapViagraTab);
    }, 3000);
  }
}

// Export for potential use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = EmojiFaviconGenerator;
}
