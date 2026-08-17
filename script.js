document.addEventListener("DOMContentLoaded", () => {
  // --- State Variables ---
  let selectedPackIndex = 2; // Default to Pack of 3 (index 2)
  let cartCount = 0;

  // --- Data for Pack Selection ---
  const packData = [
    {
      id: 1,
      quantity: 1,
      title: "Pack of 1 (200g)",
      price: 1699,
      originalPrice: 1799,
      discount: "6% Off",
      unitPrice: "₹1,699 / Jar",
      savingText: "Saving ₹100"
    },
    {
      id: 2,
      quantity: 2,
      title: "Pack of 2 (400g)",
      price: 2999,
      originalPrice: 3598,
      discount: "17% Off",
      unitPrice: "₹1,499 / Jar",
      savingText: "Saving ₹599"
    },
    {
      id: 3,
      quantity: 3,
      title: "Pack of 3 (600g)",
      price: 4199,
      originalPrice: 5397,
      discount: "22% Off",
      unitPrice: "₹1,399 / Jar",
      savingText: "Saving ₹1,198"
    },
    {
      id: 4,
      quantity: 4,
      title: "Pack of 4 (800g)",
      price: 5299,
      originalPrice: 7196,
      discount: "26% Off",
      unitPrice: "₹1,325 / Jar",
      savingText: "Saving ₹1,897"
    }
  ];

  // --- DOM Elements ---
  const packCards = document.querySelectorAll(".pack-card");
  const mainPrice = document.querySelector(".current-price");
  const originalPrice = document.querySelector(".original-price");
  const mainDiscount = document.querySelector(".discount-badge");
  const cartBadge = document.querySelector(".cart-badge");
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const stickyAtcBtn = document.getElementById("sticky-atc-btn");
  const buyNowLink = document.getElementById("buy-now-link");
  const stickyPrice = document.querySelector(".sticky-product-price");
  
  // Gallery elements
  const mainImage = document.getElementById("main-product-image");
  const thumbnails = document.querySelectorAll(".thumbnail");

  // AI Chat Assistant elements
  const chatTrigger = document.getElementById("ai-chat-trigger");
  const chatWindow = document.getElementById("ai-chat-window");
  const chatClose = document.getElementById("ai-chat-close");
  const chatSend = document.getElementById("ai-chat-send");
  const chatInput = document.getElementById("ai-chat-input");
  const chatBody = document.getElementById("ai-chat-body");

  // --- Functions ---
  
  // Format currency
  const formatPrice = (value) => {
    return "₹" + value.toLocaleString("en-IN");
  };

  // Update PDP prices based on selected pack
  const updatePrices = (index) => {
    const pack = packData[index];
    
    // Update main text
    mainPrice.textContent = formatPrice(pack.price);
    originalPrice.textContent = formatPrice(pack.originalPrice);
    mainDiscount.textContent = pack.discount + " | " + pack.savingText;
    
    // Update sticky bar price
    if (stickyPrice) {
      stickyPrice.textContent = formatPrice(pack.price);
    }
  };

  // --- Event Listeners ---

  // Pack selection
  packCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      // Remove active classes
      packCards.forEach(c => c.classList.remove("active"));
      
      // Set current card active
      card.classList.add("active");
      selectedPackIndex = index;
      
      // Update price display
      updatePrices(selectedPackIndex);
    });
  });

  // Gallery image switching
  thumbnails.forEach(thumb => {
    thumb.addEventListener("click", () => {
      // Remove active class from other thumbnails
      thumbnails.forEach(t => t.classList.remove("active"));
      
      // Set active
      thumb.classList.add("active");
      
      // Switch source image
      const newSrc = thumb.getAttribute("data-image");
      mainImage.src = newSrc;
    });
  });

  // --- Cart Drawer State & Logic ---
  let cartItems = [];

  const cartDrawer = document.getElementById("cart-drawer");
  const cartDrawerOverlay = document.getElementById("cart-drawer-overlay");
  const cartDrawerClose = document.getElementById("cart-drawer-close");
  const cartDrawerBody = document.getElementById("cart-drawer-body");
  const cartSubtotalPrice = document.querySelector(".cart-subtotal-price");
  const cartCheckoutBtn = document.getElementById("cart-checkout-btn");
  const cartIconTrigger = document.getElementById("cart-click-trigger");

  const openCart = () => {
    cartDrawer.classList.add("active");
    cartDrawerOverlay.classList.add("active");
  };

  const closeCart = () => {
    cartDrawer.classList.remove("active");
    cartDrawerOverlay.classList.remove("active");
  };

  // Open and close cart drawer handlers
  if (cartIconTrigger) cartIconTrigger.addEventListener("click", openCart);
  if (cartDrawerClose) cartDrawerClose.addEventListener("click", closeCart);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener("click", closeCart);

  // Render Cart Contents
  const updateCartDrawerUI = () => {
    // Calculate total count and subtotal
    let totalItems = 0;
    let subtotal = 0;

    cartItems.forEach(item => {
      totalItems += item.qty;
      subtotal += item.price * item.qty;
    });

    // Update Header Cart Badge
    if (totalItems > 0) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = "flex";
    } else {
      cartBadge.style.display = "none";
    }

    // Update subtotal display
    cartSubtotalPrice.textContent = formatPrice(subtotal);

    // Toggle checkout button
    if (cartCheckoutBtn) {
      cartCheckoutBtn.disabled = cartItems.length === 0;
    }

    // Render items list
    if (cartItems.length === 0) {
      cartDrawerBody.innerHTML = `<div class="cart-empty-message">Your cart is empty. Add some collagen to start your glow!</div>`;
      return;
    }

    cartDrawerBody.innerHTML = "";
    cartItems.forEach((item, index) => {
      const itemRow = document.createElement("div");
      itemRow.className = "cart-item-row";
      itemRow.innerHTML = `
        <img class="cart-item-img" src="${item.img}" alt="${item.title}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.title}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-qty-control">
            <button class="cart-item-qty-btn decrease-qty" data-index="${index}">-</button>
            <span class="cart-item-qty-val">${item.qty}</span>
            <button class="cart-item-qty-btn increase-qty" data-index="${index}">+</button>
          </div>
          <div class="cart-item-remove" data-index="${index}">Remove</div>
        </div>
      `;
      cartDrawerBody.appendChild(itemRow);
    });

    // Wire up events inside the cart list
    document.querySelectorAll(".decrease-qty").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        if (cartItems[index].qty > 1) {
          cartItems[index].qty--;
        } else {
          cartItems.splice(index, 1);
        }
        updateCartDrawerUI();
      });
    });

    document.querySelectorAll(".increase-qty").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        cartItems[index].qty++;
        updateCartDrawerUI();
      });
    });

    document.querySelectorAll(".cart-item-remove").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        cartItems.splice(index, 1);
        updateCartDrawerUI();
      });
    });
  };

  // Add to Cart Action
  const handleAddToCart = () => {
    const selectedPack = packData[selectedPackIndex];
    
    // Check if item already exists in cart
    const existingIndex = cartItems.findIndex(item => item.id === selectedPack.id);
    
    if (existingIndex > -1) {
      cartItems[existingIndex].qty++;
    } else {
      cartItems.push({
        id: selectedPack.id,
        title: selectedPack.title,
        price: selectedPack.price,
        qty: 1,
        img: "images/collagen_jar.png"
      });
    }

    // Refresh UI
    updateCartDrawerUI();

    // Automatically slide cart drawer open
    openCart();
  };

  if (addToCartBtn) addToCartBtn.addEventListener("click", handleAddToCart);
  if (stickyAtcBtn) stickyAtcBtn.addEventListener("click", handleAddToCart);

  if (buyNowLink) {
    buyNowLink.addEventListener("click", () => {
      const selectedPack = packData[selectedPackIndex];
      // When buying now, we push it to cart and open cart drawer
      const existingIndex = cartItems.findIndex(item => item.id === selectedPack.id);
      if (existingIndex > -1) {
        cartItems[existingIndex].qty++;
      } else {
        cartItems.push({
          id: selectedPack.id,
          title: selectedPack.title,
          price: selectedPack.price,
          qty: 1,
          img: "images/collagen_jar.png"
        });
      }
      updateCartDrawerUI();
      openCart();
    });
  }

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener("click", () => {
      let subtotal = 0;
      cartItems.forEach(item => subtotal += item.price * item.qty);
      alert(`Checkout processed successfully! Total order amount: ${formatPrice(subtotal)}. Thank you for shopping!`);
      cartItems = [];
      updateCartDrawerUI();
      closeCart();
    });
  }

  // --- AI Chat Assistant Integration ---
  
  // Toggle chat window
  chatTrigger.addEventListener("click", () => {
    chatWindow.classList.toggle("active");
  });

  chatClose.addEventListener("click", () => {
    chatWindow.classList.remove("active");
  });

  // Send message
  const sendMessage = () => {
    const text = chatInput.value.trim();
    if (!text) return;

    // User message bubble
    const userBubble = document.createElement("div");
    userBubble.className = "ai-chat-bubble ai-bubble-user";
    userBubble.textContent = text;
    chatBody.appendChild(userBubble);
    
    // Clear input
    chatInput.value = "";
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botBubble = document.createElement("div");
      botBubble.className = "ai-chat-bubble ai-bubble-bot";
      
      // Simple response generator
      const lowerText = text.toLowerCase();
      let response = "I'm here to help! Ask me anything about the marine collagen ingredients, reviews, or your order status.";
      
      if (lowerText.includes("taste") || lowerText.includes("fishy")) {
        response = "Our Pure Korean Marine Collagen is completely unflavored and odorless. It uses nano-hydrolyzed peptides which mix smoothly into coffee, tea, water, or smoothies without any fishy smell or aftertaste!";
      } else if (lowerText.includes("bovine") || lowerText.includes("cow") || lowerText.includes("why marine")) {
        response = "Great question! Marine collagen (sourced from deep-sea fish) is composed mostly of Type I & III collagen, which is matches the collagen in human skin. Because the peptides are nano-hydrolyzed to <1000 Daltons, it absorbs 1.5x faster than bovine (cow) collagen.";
      } else if (lowerText.includes("discount") || lowerText.includes("offer") || lowerText.includes("coupon")) {
        response = "You can get 10% off your first order! Use code **GLOW10** at checkout. Also, you get up to 26% off directly on our Pack of 3 and Pack of 4 bundles.";
      } else if (lowerText.includes("result") || lowerText.includes("time") || lowerText.includes("weeks")) {
        response = "For best results, take 1 scoop daily. Most customers see skin hydration improvements in 4 weeks, softer fine lines by 8 weeks, and firmer skin with stronger hair/nails by 12 weeks.";
      }
      
      botBubble.textContent = response;
      chatBody.appendChild(botBubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 800);
  };

  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Initialize prices
  updatePrices(selectedPackIndex);
});
