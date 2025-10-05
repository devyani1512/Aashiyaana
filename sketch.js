// --- Global variables ---
let gridSize = 8;
let cellSize = 60;
let rooms = [];
// FIX: Added "Food Galley" to the roomTypes array as used in inventories
let roomTypes = ["Control Room", "Crew Chambers", "Medbay", "Mess Module", "Food Galley", "Waste Management", "Stowage"];
let currentRoomIndex = 0;
let roomTiles = [];
let objects = [];
let decorations = [];
let mode = "room";
let selectedRoom = null;
let reformingRoom = null;
let energy = 100, cost = 200, used = 0, mass=30000;
let draggedItem = null;
let draggingObject = null;
let draggingRoom = null;

// --- STATE MANAGEMENT FOR INVENTORY ---
let expandedItem = null;
let expandedSubItem = null;
let animationStates = {}; // Object to hold animation data for each item

let totalEnergy = 100;
let totalCost = 0;
let totalPower = 0;
let totalUsed = 0;

// FIX: Added global variable declarations for use in draw() and drawCorridors()
let controlRoom = null; 
let chatBtn; 

// Note: Ensure this structure is fully copied into your app.py for the chatbot context
const inventories = {
  "Control Room": [
    {
      name: "Life Support",
      isCategory: true,
      subItems: [
        {
          name: "Star-Node Model",
          volume: 112.9,
          power: 4,
          mass: 14620,
          imgSrc: "images/star_node.png",
          info: {
            description:
              "This model contains a CORE (Main ECLSS system) and STARs (Plug-in ECLSSs). CORE contains all the life-supporting mechanisms and is the main life-support system. STARs do not have all mechanisms for long-term life support but can be plugged into the NODE to be recharged when needed.",
            Source: [
              'Howe, A. Scott. "A modular habitation system for human planetary and space exploration." 45th International Conference on Environmental Systems, 2015.',
            ],
          },
        },
        {
          name: "ISRU Model",
          volume: 11.7,
          power: 4500,
          mass: 2134,
          imgSrc: "images/isru_system.png",
          info: {
            description:
              "For a lunar habitat, ISRU offers a way to reduce reliance on Earth resupply by using local resources. Lunar ice deposits can be extracted and turned into water for drinking, oxygen generation, or integration with regenerative systems. Oxygen can also be produced from regolith.",
            Source: [
              'Kessler, Paul, et al. "Artemis deep space habitation: Enabling a sustained human presence on the moon and beyond." 2022 IEEE Aerospace Conference (AERO). IEEE, 2022.',
            ],
          },
        },
        {
          name: "Regen Model",
          volume: 9.3,
          power: 3700,
          mass: 2423,
          imgSrc: "images/regen_system.png",
          info: {
            description:
              "Regen systems aim to form an almost closed-loop ECLSS. These systems rely on bio waste generated and wastewater offloaded to minimise their dependence on resupply of materials. Traditional forms of regen systems have been used on the ISS for years and have proven their mettle.",
            Source: [
              'Bryant, Zach, Andrew Choate, and David Howard. "Environmental Control and Life Support (ECLS) System Options for Mars Transit and Mars Surface Missions." 2023 International Conference on Environmental Systems, 2023.',
            ],
          },
        },
      ],
    },
    {
      name: "Thermal Support",
      isCategory: true,
      subItems: [
        {
          name: "Thermal Control System",
          volume: 4,
          power: 3840,
          mass: 12000,
          imgSrc: "images/tcs.png",
          info: {
            description:
              "Thermal Control System collects heat inside the habitat, transfers it through two fluid loops, and releases it into space using large radiator panels.",
            Source: [
              'Schunk, R. Gregory, et al. "Thermal control system architecture and technology challenges for a lunar surface habitat." 2022 IEEE Aerospace Conference (AERO). IEEE, 2022.',
            ],
          },
        },
      ],
    },
    {
      name: "Power Sources",
      isCategory: true,
      subItems: [
        {
          name: "KiloPower Reactors",
          volume: 2.35,
          power_gen: 40000,
          mass: 6000,
          imgSrc: "images/kilopower_reactors.png",
          info: {
            description:
              "The Kilopower reactor concept is one of the simplest space power reactor concepts ever proposed.",
            Source: [
              'Poston, David I., Marc Gibson, and Patrick McClure. "Kilopower reactors for potential space exploration missions." Nuclear and Emerging Technologies for Space 2019 (NETS-2019).',
            ],
          },
        },
        {
          name: "Solar Farm",
          volume: 3,
          power_gen: 7795,
          mass: 60,
          power: 40800,
          imgSrc: "images/solar_array.png",
          info: {
            description:
              "For a lunar habitat, solar farms help reduce reliance on Earth resupply by generating power from sunlight.",
            Source: [
              'Kotedadi, Abhirama Rai, and Neelesh Ranjan Saxena. "Power Generation System For Lunar Habitat." Human Space Flight: Technology (2019).',
            ],
          },
        },
        {
          name: "Thermo-Electric Generator",
          volume: 2.63,
          power_gen: 7795,
          mass: 18080,
          power: 274900,
          imgSrc: "images/teg_array.png",
          info: {
            description:
              "Thermo-electric generators convert temperature differences into electrical energy.",
            Source: [
              'Kotedadi, Abhirama Rai, and Neelesh Ranjan Saxena. "Power Generation System For Lunar Habitat." Human Space Flight: Technology (2019).',
            ],
          },
        },
      ],
    },
    {
      name: "Power Storage",
      isCategory: true,
      subItems: [
        {
          name: "Li-Ion Batteries",
          volume: 10.24,
          mass: 4000,
          power_store: 10000,
          imgSrc: "images/li-ion_batteries.png",
          info: {
            description:
              "Li-Ion batteries have very high energy density, reliability, and long shelf life.",
            Source: [
              'Kotedadi, Abhirama Rai, and Neelesh Ranjan Saxena. "Power Generation System For Lunar Habitat." Human Space Flight: Technology (2019).',
            ],
          },
        },
        {
          name: "Fuel Cells",
          volume: 3.25,
          mass: 16000,
          power_store: 10000,
          imgSrc: "images/he-ion_batteries.png",
          info: {
            description:
              "Fuel cells can store a large amount of energy with high energy density.",
            Source: [
              'Kotedadi, Abhirama Rai, and Neelesh Ranjan Saxena. "Power Generation System For Lunar Habitat." Human Space Flight: Technology (2019).',
            ],
          },
        },
      ],
    },
    {
      name: "Comm System",
      isCategory: true,
      subItems: [
        {
          name: "Gateway System",
          volume: 0.15,
          power: 450,
          mass: 40,
          imgSrc: "images/gateway_system_module.png",
          info: {
            description:
              "The Gateway acts like a cell tower in lunar orbit, connecting astronauts and rovers to Earth.",
            Source: [
              'Farkasvölgyi, Andrea, et al. "The evolution of lunar communication—From the beginning to the present." Int. Journal of Satellite Communications and Networking 42.3 (2024).',
            ],
          },
        },
        {
          name: "LCBN System",
          volume: 50,
          power: 710,
          mass: 180,
          imgSrc: "images/malpert_mountain_thingy.png",
          info: {
            description:
              "Lunar Base Communication and Navigation System using a relay station at Malapert Mountain for near-constant Earth visibility.",
            Source: [
              'Qaise, Omar, et al. "Operational design considerations of a polar lunar base communications and Navigation System." SpaceOps 2010 Conference. NASA Marshall Space Flight Center and AIAA, 2010.',
            ],
          },
        },
      ],
    },
  ],

  "Crew Chambers": [
    {
      name: "Eclipse private berths",
      volume: 5.43,
      power: 225,
      mass: 284.75,
      imgSrc: "images/eclipse_berth.png",
      info: {
        description:
          "Designed for four crew, the chamber includes compact private berths with stowage and radiation shielding.",
      },
    },
    {
      name: "ISS crew chambers",
      volume: 2.1,
      power: 225,
      mass: 379,
      imgSrc: "images/iss_crew_quarters.png",
      info: {
        description:
          "ISS crew quarters are designed for private use beyond sleep, allowing crew to work and personalize space.",
      },
    },
    {
      name: "Small crew chambers",
      volume: 5.43,
      power: 140,
      mass: 190,
      imgSrc: "images/small_crew_quarters.png",
      info: {
        description:
          "Compact living spaces designed for future missions with volume constraints and high efficiency.",
      },
    },
  ],

  "Medbay": [
    {
      name: "Exercise & Rejuvenation",
      isCategory: true,
      subItems: [
        {
          name: "ARED",
          volume: 3.31,
          power: 6,
          mass: 300,
          imgSrc: "images/excercise_thingy.png",
          info: {
            description:
              "The Advanced Resistive Exercise Device simulates free-weight lifting in microgravity.",
          },
        },
        {
          name: "Cage",
          volume: 2.2,
          power: 300,
          mass: 250,
          imgSrc: "images/isru_system.png",
          info: {
            description:
              "CAGE combines artificial gravity with resistance exercise for astronaut health.",
          },
        },
      ],
    },
    {
      name: "Medical Support System",
      isCategory: true,
      subItems: [
        {
          name: "Use Crew Chambers",
          volume: 1.6,
          mass: 104,
          imgSrc: "images/medi_bag.png",
          info: {
            description:
              "Crew chambers can double as emergency medical facilities for small crews.",
          },
        },
        {
          name: "Common Habitat MCF",
          volume: 18,
          power: 2545,
          mass: 455,
          imgSrc: "images/tcs.png",
          info: {
            description:
              "MCF is a full-fledged medical bay for long-duration space missions with advanced equipment.",
          },
        },
      ],
    },
  ],

  "Food Galley": [
    {
      name: "Food Stowage",
      isCategory: true,
      subItems: [
        {
          name: "ISS Bags",
          volume: 15,
          mass: 30,
          imgSrc: "images/iss_food_bags.png",
        },
        {
          name: "Orion Stowage Sys",
          volume: 6,
          mass: 30,
          imgSrc: "images/iss_food_bags.png",
        },
      ],
    },
    {
      name: "Food Prep",
      energy: 5,
      power: 2,
      cost: 10,
      imgSrc: "images/.jpg",
    },
  ],

  "Waste Management": [
    {
      name: "AstroYeast",
      energy: 10,
      power: 5,
      cost: 20,
      imgSrc: "placeholder1.jpg",
    },
    {
      name: "Solein Food Reactor",
      energy: 15,
      power: 8,
      cost: 30,
      imgSrc: "placeholder1.jpg",
    },
    {
      name: "CANgrow",
      energy: 20,
      power: 10,
      cost: 40,
      imgSrc: "placeholder1.jpg",
    },
  ],

  "Stowage": [
    {
      name: "Eclipse EVA SYS",
      energy: 0,
      power: 0,
      cost: 10,
      imgSrc: "placeholder1.jpg",
    },
    {
      name: "Lunar Vehicles",
      energy: 0,
      power: 0,
      cost: 5,
      imgSrc: "placeholder1.jpg",
    },
    {
      name: "TRI-ATHLETE",
      energy: 5,
      power: 3,
      cost: 15,
      imgSrc: "placeholder1.jpg",
    },
  ],
};


let bgImg;
let confirmBtn, finalizeBtn, newRoomBtn, reformBtn;
let floorColor = [120, 200, 255, 180];
let wallColor = [30, 50, 120, 220];
let miniMapX, miniMapY, miniMapW = 250, miniMapH = 250;
let miniScale = 0.2;


function preload() {
    bgImg = loadImage("someone.png");
    // Ensure you have placeholder images or this will crash
    for (const roomType in inventories) {
        for (const item of inventories[roomType]) {
            if (item.isCategory) {
                for (const subItem of item.subItems) {
                    // Check for imgSrc property before attempting to load
                    if (subItem.imgSrc) subItem.img = loadImage(subItem.imgSrc);
                }
            } else if (item.imgSrc) {
                item.img = loadImage(item.imgSrc);
            }
        }
    }
}

function findItemDetails(itemName) {
    for (const roomType in inventories) {
        for (const item of inventories[roomType]) {
            if (item.isCategory) {
                const foundSubItem = item.subItems.find(sub => sub.name === itemName);
                if (foundSubItem) return foundSubItem;
            } else if (item.name === itemName) {
                return item;
            }
        }
    }
    return null;
}

function initializeAnimationStates() {
    animationStates = {};
    for (const roomType in inventories) {
        for (const item of inventories[roomType]) {
            if (item.isCategory) {
                for (const subItem of item.subItems) {
                    animationStates[subItem.name] = { currentHeight: 0, targetHeight: 0 };
                }
            } else if (item.info) {
                animationStates[item.name] = { currentHeight: 0, targetHeight: 0 };
            }
        }
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    initializeAnimationStates(); // Initialize the animation system

    let uiY = height - 70;

    // --- GAME BUTTONS ---
    confirmBtn = createButton("Confirm Layout → Place Objects");
    styleButton(confirmBtn);
    confirmBtn.position(width / 2 - 300, uiY);
    confirmBtn.mousePressed(() => {
        if (roomTiles.length > 0) mode = "place";
    });

    finalizeBtn = createButton("Finalize Room");
    styleButton(finalizeBtn);
    finalizeBtn.position(width / 2 - 80, uiY);
    finalizeBtn.mousePressed(() => finalizeRoom());

    newRoomBtn = createButton("Start New Room");
    styleButton(newRoomBtn);
    newRoomBtn.position(width / 2 + 180, uiY);
    newRoomBtn.mousePressed(() => startNewRoom());
    
    reformBtn = createButton("Reform Selected Room");
    styleButton(reformBtn);
    reformBtn.position(width / 2 + 400, uiY);
    reformBtn.hide();
    reformBtn.mousePressed(() => reformRoom());
    
    // --- CHAT BUTTON (Redirect to independent chatbot.html) ---
    chatBtn = createButton("💬 AI Architect"); // FIX: Added the chat button setup
    styleButton(chatBtn);
    chatBtn.position(40, 70); 
    chatBtn.style("width", "150px"); 
    chatBtn.mousePressed(() => {
        // Assuming you have a separate HTML file for the chat
        window.location.href = '/chatbott.html'; 
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);
    image(bgImg, 0, 0, windowWidth, windowHeight);
    fill(0, 150);
    rect(0, 0, windowWidth, windowHeight);
    drawTitle();

    if (mode === "room" || mode === "place") {
        textAlign(CENTER, TOP);
        textSize(24);
        fill(255);
        noStroke();
        let roomName = reformingRoom ? reformingRoom.name : (roomTypes[currentRoomIndex] || "Stowage");
        text(`Constructing: ${roomName}`, width / 2, 70);
    }

    if (mode === "room") {
        confirmBtn.show();
        finalizeBtn.hide();
        newRoomBtn.hide();
        confirmBtn.html(reformingRoom ? "Confirm New Layout" : "Confirm Layout → Place Objects");
        drawStats();
        drawGrid();
        highlightSelectedTiles();
        drawRoomOutline(roomTiles);
        drawInventory();
    } else if (mode === "place") {
        confirmBtn.hide();
        finalizeBtn.show();
        newRoomBtn.hide();
        reformBtn.hide();
        drawStats();
        drawAllRooms();
        drawRoomWithWalls(roomTiles, floorColor, wallColor);
        drawObjects(objects);
        drawInventory();
        if (draggedItem) drawDraggedItem(draggedItem);
    } else if (mode === "final") {
        confirmBtn.hide();
        finalizeBtn.hide();
        newRoomBtn.show();
        reformBtn.style('display', selectedRoom ? 'block' : 'none');
        drawAllRooms();
        drawCorridors();
        drawLifeSupport();
        drawStats();
        drawMiniMap();
    }
}

function calculateDetailHeight(item) {
    if (!item || !item.info) return 0;
    let height = 30; // Top padding with stats line
    height += 40; // Approx height for description
    height += 20; // "Specifications" title
    height += item.info.specs.length * 15;
    height += 20; // "Benefits" title
    height += item.info.benefits.length * 15;
    height += 15; // Bottom padding
    return height;
}

// RESTORED DRAWINVENTORY FOR CORRECT ANIMATION/OFFSET LOGIC
function drawInventory() {
    let invX = windowWidth - 250;
    let invY = 150;
    let invW = 220;
    let itemH = 35;
    let subItemH = 30;
    let currentRoomName = reformingRoom ? reformingRoom.name : (roomTypes[currentRoomIndex] || "Stowage");
    const currentInventory = inventories[currentRoomName] || [];

    // --- Update and calculate heights for panel size ---
    let totalHeight = 40;
    let currentYOffset = invY + 40;

    for (const item of currentInventory) {
        totalHeight += itemH + 5;
        let itemYEnd = currentYOffset + itemH;

        if (expandedItem === item) {
            if (item.isCategory) {
                totalHeight += (subItemH + 5) * item.subItems.length;
                let subYOffset = itemYEnd + 5;

                for (const subItem of item.subItems) {
                    // Animation calculation
                    let animState = animationStates[subItem.name];
                    if (expandedSubItem === subItem) {
                        animState.targetHeight = calculateDetailHeight(expandedSubItem);
                    } else {
                        animState.targetHeight = 0;
                    }
                    animState.currentHeight = lerp(animState.currentHeight, animState.targetHeight, 0.2);
                    if (animState.currentHeight < 1 && animState.targetHeight === 0) animState.currentHeight = 0; 
                    
                    if (animState.currentHeight > 0) {
                        totalHeight += animState.currentHeight + 5;
                    }

                    subYOffset += subItemH + 5;
                    if (animState.currentHeight > 0) {
                        subYOffset += animState.currentHeight + 5;
                    }
                }
            } else {
                // Animation calculation for non-category item
                let animState = animationStates[item.name];
                animState.targetHeight = expandedItem === item ? calculateDetailHeight(item) : 0;
                animState.currentHeight = lerp(animState.currentHeight, animState.targetHeight, 0.2);
                if (animState.currentHeight < 1 && animState.targetHeight === 0) animState.currentHeight = 0; 
                
                if (animState.currentHeight > 0) {
                    totalHeight += animState.currentHeight + 5;
                }
            }
        } else {
            // Ensure non-expanded items reset their animations
            if (!item.isCategory) {
                let animState = animationStates[item.name];
                animState.targetHeight = 0;
                animState.currentHeight = lerp(animState.currentHeight, 0, 0.2);
                if (animState.currentHeight < 1) animState.currentHeight = 0; 
                if (animState.currentHeight > 0) {
                     totalHeight += animState.currentHeight + 5;
                }
            }
        }
    }


    // --- Draw Panel ---
    fill(20, 30, 50, 220);
    noStroke();
    rect(invX, invY, invW, totalHeight, 10);
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text("Inventory", invX + 10, invY + 10);

    let yOffset = invY + 40;

    for (const item of currentInventory) {
        let itemX = invX + 10;
        let itemW = invW - 20;

        // Draw main item/category bar
        fill(item.isCategory ? '#5a5a8c' : '#3264c8');
        rect(itemX, yOffset, itemW, itemH, 6);
        fill(255);
        textAlign(LEFT, CENTER);
        textSize(12);
        let textMaxWidth = itemW - (item.isCategory ? 15 : 45);
        text(item.name, itemX + 10, yOffset + itemH / 2, textMaxWidth);

        if (!item.isCategory && item.info) {
            let infoBtnX = itemX + itemW - 18;
            fill(expandedItem === item ? '#00ffff' : '#00aaff');
            ellipse(infoBtnX, yOffset + itemH / 2, 20, 20);
            fill(0);
            text("i", infoBtnX, yOffset + itemH / 2);
        }

        yOffset += itemH + 5;

        if (expandedItem === item) {
            if (item.isCategory) {
                for (const subItem of item.subItems) {
                    let subItemX = itemX + 10;
                    let subItemW = itemW - 20;
                    
                    let animState = animationStates[subItem.name];

                    fill('#4a78d2');
                    rect(subItemX, yOffset, subItemW, subItemH, 4);
                    fill(255);
                    text(subItem.name, subItemX + 10, yOffset + subItemH / 2, subItemW - 40);

                    let infoBtnX = subItemX + subItemW - 18;
                    fill(expandedSubItem === subItem ? '#00ffff' : '#00aaff');
                    ellipse(infoBtnX, yOffset + subItemH / 2, 18, 18);
                    fill(0);
                    text("i", infoBtnX, yOffset + subItemH / 2);

                    yOffset += subItemH + 5;

                    if (animState.currentHeight > 0) {
                        drawDetailBox(subItem, subItemX, yOffset, subItemW, animState.currentHeight);
                        yOffset += animState.currentHeight + 5;
                    }
                }
            } else {
                let animState = animationStates[item.name];
                if (animState.currentHeight > 0) {
                    drawDetailBox(item, itemX, yOffset, itemW, animState.currentHeight);
                    yOffset += animState.currentHeight + 5;
                }
            }
        }
    }
}

function drawDetailBox(item, x, y, w, h) {
    push();
    // Use clipping to ensure the text and drawing stay within the animated height (h)
    drawingContext.save();
    drawingContext.beginPath();
    // Use rect to define the clipping area
    drawingContext.rect(x, y, w, h); 
    drawingContext.clip();

    fill(30, 40, 70, 255);
    stroke(0, 150, 255);
    rect(x, y, w, h, 6);
    noStroke();

    let textX = x + 10;
    let textW = w - 20;
    let currentY = y + 10;

    fill(255, 200, 100);
    textAlign(LEFT, TOP);
    textSize(12);
    text(`Energy: ${item.energy} | Power: ${item.power} | Cost: ${item.cost}`, textX, currentY);
    currentY += 25;

    fill(255);
    // Use text() with width constraint for word wrapping
    text(item.info.description, textX, currentY, textW);
    currentY += 40; // Approximate line spacing for description

    // Only draw specs if space allows
    if (currentY < y + h - 60) {
        fill(100, 255, 100);
        textSize(14);
        text("Specifications:", textX, currentY);
        currentY += 20;
        fill(255);
        textSize(11);
        for (const spec of item.info.specs) {
            if (currentY + 15 > y + h) break;
            text(`• ${spec}`, textX + 5, currentY);
            currentY += 15;
        }
    }

    // Only draw benefits if space allows
    if (currentY < y + h - 30) {
        fill(255, 200, 100);
        textSize(14);
        text("Benefits:", textX, currentY);
        currentY += 20;
        fill(255);
        textSize(11);
        for (const benefit of item.info.benefits) {
            if (currentY + 15 > y + h) break;
            text(`• ${benefit}`, textX + 5, currentY);
            currentY += 15;
        }
    }

    drawingContext.restore();
    pop();
}

// RESTORED HANDLEINVENTORYCLICK FOR CORRECT OFFSETS
function handleInventoryClick(mx, my) {
    let invX = windowWidth - 250;
    let invY = 150;
    let invW = 220;
    let itemH = 35;
    let subItemH = 30;
    let yOffset = invY + 40;

    const currentRoomName = reformingRoom ? reformingRoom.name : (roomTypes[currentRoomIndex] || "Stowage");
    const currentInventory = inventories[currentRoomName] || [];
    
    // Iterate through items, calculating position dynamically
    for (const item of currentInventory) {
        let itemX = invX + 10;
        let itemW = invW - 20;

        // 1. Check Main Item/Category Bar
        if (mx > itemX && mx < itemX + itemW && my > yOffset && my < yOffset + itemH) {
            if (item.isCategory) {
                expandedItem = (expandedItem === item) ? null : item;
                expandedSubItem = null;
                return true;
            } else {
                let infoBtnX = itemX + itemW - 18;
                let isInfoClick = item.info && dist(mx, my, infoBtnX, yOffset + itemH / 2) < 10;
                
                if (isInfoClick) {
                    expandedItem = (expandedItem === item) ? null : item;
                    expandedSubItem = null;
                    return true;
                } else if (mode === "place" || reformingRoom) { 
                    draggedItem = item;
                    return true;
                }
            }
        }

        yOffset += itemH + 5;
        
        // 2. Check Expanded Content
        if (expandedItem === item) {
            if (item.isCategory) {
                for (const subItem of item.subItems) {
                    let subItemX = itemX + 10;
                    let subItemW = itemW - 20;
                    
                    // 2a. Check SubItem Bar
                    if (mx > subItemX && mx < subItemX + subItemW && my > yOffset && my < yOffset + subItemH) {
                        let infoBtnX = subItemX + subItemW - 18;
                        let isInfoClick = dist(mx, my, infoBtnX, yOffset + subItemH / 2) < 10;
                        
                        if (isInfoClick) {
                            expandedSubItem = (expandedSubItem === subItem) ? null : subItem;
                            return true;
                        } else if (mode === "place" || reformingRoom) {
                            draggedItem = subItem;
                            return true;
                        }
                    }
                    
                    yOffset += subItemH + 5;

                    // 2b. Check SubItem Detail Box (for animation offset)
                    let animState = animationStates[subItem.name];
                    if (animState.currentHeight > 0) {
                        yOffset += animState.currentHeight + 5;
                    }
                }
            } else {
                // Check Item Detail Box (for animation offset)
                let animState = animationStates[item.name];
                if (animState.currentHeight > 0) {
                    yOffset += animState.currentHeight + 5;
                }
            }
        }
    }
    return false;
}

function mousePressed() {
    // 1. Handle Inventory Click (Highest Priority)
    if (handleInventoryClick(mouseX, mouseY)) {
        return;
    }
    
    // Reset info panels if we click elsewhere
    expandedItem = null;
    expandedSubItem = null;

    // 2. Handle Game Logic based on mode
    if (mode === "room") {
        let offsetX = (width - gridSize * cellSize) / 2;
        let offsetY = (height - gridSize * cellSize) / 2;

        let c = floor((mouseX - offsetX) / cellSize);
        let r = floor((mouseY - offsetY) / cellSize);
        
        // Only allow tile modification if click is within the grid area
        if (mouseX > offsetX && mouseX < offsetX + gridSize * cellSize &&
            mouseY > offsetY && mouseY < offsetY + gridSize * cellSize) {
            
            if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                let idx = roomTiles.findIndex(t => t.r === r && t.c === c);
                if (idx >= 0) roomTiles.splice(idx, 1);
                else roomTiles.push({ r, c });
            }
        }
    } else if (mode === "place") {
        // Allow removing placed objects by clicking on them
        for (let i = objects.length - 1; i >= 0; i--) {
            let obj = objects[i];
            if (mouseX > obj.x - 45 && mouseX < obj.x + 45 && mouseY > obj.y - 20 && mouseY < obj.y + 25) {
                let item = findItemDetails(obj.name);
                if (item) {
                    // Refund resources
                    energy += item.energy;
                    cost -= item.cost;
                    used--;
                    totalEnergy += item.energy;
                    totalCost -= item.cost;
                    totalPower -= item.power;
                    totalUsed--;
                }
                objects.splice(i, 1);
                return;
            }
        }
    } else if (mode === "final") {
        // Allow selecting a room for dragging/reforming
        for (let room of rooms) {
            // FIX: Use getRoomCenter result, then add offset
            let c = getRoomCenter(room.tiles);
            let cx = c.x + room.offsetX;
            let cy = c.y + room.offsetY;

            if (dist(mouseX, mouseY, cx, cy) < 50) {
                selectedRoom = room;
                reformBtn.show();
                draggingRoom = room;
                return; // Room selected, stop checking
            }
        }
        // If nothing was selected, deselect the room
        selectedRoom = null;
        reformBtn.hide();
    }
}


function drawObjects(objs) {
    for (let obj of objs) {
        const itemDetails = findItemDetails(obj.name);
        if (itemDetails && itemDetails.img) {
            imageMode(CENTER);
            image(itemDetails.img, obj.x, obj.y, 60, 60);
            imageMode(CORNER);
        } else {
            fill(255, 150, 0, 220);
            stroke(0, 150, 255);
            rect(obj.x - 40, obj.y - 20, 90, 45, 8);
            fill(0);
            noStroke();
            textSize(12);
            text(obj.name, obj.x, obj.y);
        }
    }
}

function drawDraggedItem(item) {
    if (item.img) {
        imageMode(CENTER);
        image(item.img, mouseX, mouseY, 60, 60);
        imageMode(CORNER);
    } else {
        fill(255, 180, 0, 220);
        stroke(0, 200, 255);
        rect(mouseX - 45, mouseY - 20, 90, 40, 8);
        fill(0);
        noStroke();
        textSize(12);
        text(item.name, mouseX, mouseY);
    }
}

function mouseReleased() {
    if (draggedItem && (mode === "place" || reformingRoom)) {
        // Check if the drop point is within the *current* room's tile set
        let dropPointInTiles = pointInRoom(mouseX, mouseY, roomTiles);
        
        // Resources check
        let isResourceValid = (totalEnergy - draggedItem.energy >= 0) && (totalCost + draggedItem.cost <= 200);

        if (dropPointInTiles && isResourceValid) {
            objects.push({ name: draggedItem.name, x: mouseX, y: mouseY });
            
            // Update local room stats
            energy -= draggedItem.energy;
            cost += draggedItem.cost;
            used++;
            
            // Update global total stats
            totalEnergy -= draggedItem.energy;
            totalCost += draggedItem.cost;
            totalPower += draggedItem.power;
            totalUsed++;
        } else if (!isResourceValid) {
            alert("Insufficient Energy or over budget! Cannot place this item.");
        } else {
            console.log("Can't place object outside the room");
        }
    }
    draggedItem = null;
    draggingObject = null;
    draggingRoom = null;
}

function finalizeRoom() {
    if (roomTiles.length === 0) return;
    
    let roomEnergy = 0;
    let roomCost = 0;
    let roomPower = 0;
    // Recalculate room totals based on final objects list
    for (let obj of objects) {
        let item = findItemDetails(obj.name);
        if (item) {
            roomEnergy += item.energy;
            roomCost += item.cost;
            roomPower += item.power;
        }
    }
    
    if (reformingRoom) {
        // When reforming, subtract old values before assigning new ones
        totalEnergy += reformingRoom.energy;
        totalCost -= reformingRoom.cost;
        totalPower -= reformingRoom.power;
        totalUsed -= reformingRoom.used;

        // Assign new values
        reformingRoom.tiles = [...roomTiles];
        reformingRoom.objects = [...objects];
        reformingRoom.decorations = [...decorations];
        reformingRoom.energy = roomEnergy;
        reformingRoom.cost = roomCost;
        reformingRoom.power = roomPower;
        reformingRoom.used = objects.length;
        reformingRoom = null;

        // Add new values back to totals
        totalEnergy -= roomEnergy;
        totalCost += roomCost;
        totalPower += roomPower;
        totalUsed += objects.length;
    } else {
        if (isOverlapping(roomTiles)) {
            alert("Cannot finalize: room overlaps with an existing one.");
            return;
        }
        let roomName = roomTypes[currentRoomIndex] || "Stowage";
        let newRoom = {
            name: roomName,
            tiles: [...roomTiles],
            objects: [...objects],
            decorations: [...decorations],
            energy: roomEnergy,
            cost: roomCost,
            power: roomPower,
            used: objects.length,
            floorColor: [random(80, 200), random(120, 200), random(200, 255), 180],
            wallColor: [random(20, 80), random(40, 100), random(150, 220), 220],
            offsetX: random(100, 300),
            offsetY: random(100, 300)
        };
        rooms.push(newRoom);
        
        // Update global totals only for *new* room
        totalEnergy -= roomEnergy;
        totalCost += roomCost;
        totalPower += roomPower;
        totalUsed += objects.length;

        if (roomName === "Control Room") {
            controlRoom = newRoom;
        }
        currentRoomIndex++;
    }

    // Check if all room types have been used
    if (currentRoomIndex >= roomTypes.length) {
        window.location.href = 'endgame.html'; 
        return;
    }

    mode = "final";
    // Reset local room state for the next build
    roomTiles = [];
    objects = [];
    decorations = [];
    energy = 100;
    cost = 200;
    used = 0;
    reformBtn.hide();
}

function isOverlapping(newTiles) {
    for (let room of rooms) {
        // FIX: The logic was inverted. Must return TRUE if overlap is found.
        for (let t of newTiles) {
            if (room.tiles.find(rt => rt.r === t.r && rt.c === t.c)) {
                return true; // Found an overlap
            }
        }
    }
    return false; // No overlap found after checking all rooms
}

function startNewRoom() {
    if (mode === "final") {
        roomTiles = [];
        objects = [];
        decorations = [];
        floorColor = [random(80, 200), random(120, 200), random(200, 255), 180];
        wallColor = [random(20, 80), random(40, 100), random(150, 220), 220];
        energy = 100;
        cost = 200;
        used = 0;
        mode = "room";
    }
}

function reformRoom() {
    if (selectedRoom) {
        reformingRoom = selectedRoom;
        roomTiles = [...selectedRoom.tiles];
        objects = [...selectedRoom.objects];
        decorations = [...selectedRoom.decorations];
        
        // Load the room's current resources as the starting point for reform
        energy = selectedRoom.energy; 
        cost = selectedRoom.cost;
        used = selectedRoom.used;
        
        floorColor = [...selectedRoom.floorColor];
        wallColor = [...selectedRoom.wallColor];
        mode = "room";
        selectedRoom = null;
        reformBtn.hide();
    }
}

function drawAllRooms() {
    for (let room of rooms) {
        push();
        translate(room.offsetX, room.offsetY);
        drawRoomWithWalls(room.tiles, room.floorColor, room.wallColor);
        drawObjects(room.objects);
        pop();
    }
}

function drawCorridors() {
    if (!controlRoom) return;
    let c1 = getRoomCenter(controlRoom.tiles);
    let cx1 = c1.x + controlRoom.offsetX;
    let cy1 = c1.y + controlRoom.offsetY;
    stroke(200);
    strokeWeight(2);
    drawingContext.setLineDash([5, 5]);
    for (let room of rooms) {
        if (room === controlRoom) continue;
        let c2 = getRoomCenter(room.tiles);
        let cx2 = c2.x + room.offsetX;
        let cy2 = c2.y + room.offsetY;
        line(cx1, cy1, cx2, cy2);
    }
    drawingContext.setLineDash([]);
}

function drawLifeSupport() {
    if (controlRoom) {
        let c = getRoomCenter(controlRoom.tiles);
        let cx = c.x + controlRoom.offsetX;
        let cy = c.y + controlRoom.offsetY;
        fill("red");
        noStroke();
        ellipse(cx, cy, 40, 40);
        fill(255);
        textSize(12);
        textAlign(CENTER, CENTER);
        text("Life Support", cx, cy - 30);
    }
}

function drawMiniMap() {
    miniMapX = windowWidth - miniMapW - 20;
    miniMapY = 20;
    fill(20, 180);
    stroke(200);
    rect(miniMapX, miniMapY, miniMapW, miniMapH);
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, TOP);
    text("Mini-map", miniMapX + miniMapW / 2, miniMapY + 5);
    push();
    translate(miniMapX + 10, miniMapY + 30);
    scale(miniScale);
    for (let room of rooms) {
        push();
        translate(room.offsetX, room.offsetY);
        let points = getRoomPoints(room.tiles);
        drawRoomWithWalls(room.tiles, room.floorColor, room.wallColor);
        // The drawing of lengths and angles is kept for now but might be overwhelming at this scale
        if (points.length > 2) {
            for (let i = 0; i < points.length; i++) {
                let p1 = points[i];
                let p2 = points[(i + 1) % points.length];
                let dx = (p2.x - p1.x) / cellSize;
                let dy = (p2.y - p1.y) / cellSize;
                let length = sqrt(dx * dx + dy * dy).toFixed(1);
                let mx = (p1.x + p2.x) / 2;
                let my = (p1.y + p2.y) / 2;
                fill(255, 200, 0);
                noStroke();
                textSize(40);
                textAlign(CENTER, CENTER);
                text(length, mx, my);
            }
            for (let i = 0; i < points.length; i++) {
                let prev = points[(i - 1 + points.length) % points.length];
                let curr = points[i];
                let next = points[(i + 1) % points.length];
                let v1 = createVector(prev.x - curr.x, prev.y - curr.y).normalize();
                let v2 = createVector(next.x - curr.x, next.y - curr.y).normalize();
                let angle = degrees(acos(constrain(v1.dot(v2), -1, 1))).toFixed(0);
                fill(0, 255, 0);
                noStroke();
                textSize(30);
                textAlign(CENTER, CENTER);
                text(angle + "°", curr.x, curr.y - 15);
            }
        }
        pop();
    }
    pop();
}

function getRoomPoints(tiles) {
    let points = tiles.map(t => createVector(t.c * cellSize + cellSize / 2, t.r * cellSize + cellSize / 2));
    if (points.length > 2) {
        let center = createVector(0, 0);
        for (let p of points) center.add(p);
        center.div(points.length);
        
        // Sort points clockwise/counter-clockwise to draw a convex hull or simple shape
        points.sort((a, b) => atan2(a.y - center.y, a.x - center.x) - atan2(b.y - center.y, b.x - center.x));
    }
    return points;
}

function getRoomCenter(tiles) {
    let points = getRoomPoints(tiles);
    let center = createVector(0, 0);
    for (let p of points) center.add(p);
    center.div(points.length || 1); 
    return center;
}

function drawRoomWithWalls(tiles, floorCol, wallCol) {
    let points = getRoomPoints(tiles);
    if (points.length > 2) {
        // Draw Floor
        fill(floorCol);
        stroke(0, 200, 255);
        beginShape();
        for (let p of points) vertex(p.x, p.y);
        endShape(CLOSE);
        
        // Draw Walls
        let wallHeight = 50;
        for (let i = 0; i < points.length; i++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % points.length];
            fill(wallColor);
            stroke(0, 100, 200);
            beginShape();
            vertex(p1.x, p1.y);
            vertex(p2.x, p2.y);
            vertex(p2.x, p2.y - wallHeight);
            vertex(p1.x, p1.y - wallHeight);
            endShape(CLOSE);
        }
    }
}

function drawRoomOutline(tiles) {
    let points = getRoomPoints(tiles);
    if (points.length > 2) {
        noFill();
        stroke(0, 200, 255);
        strokeWeight(2);
        beginShape();
        for (let p of points) vertex(p.x, p.y);
        endShape(CLOSE);
    }
}

function drawGrid() {
    stroke(100, 120);
    let gridW = gridSize * cellSize;
    let gridH = gridSize * cellSize;
    let topMargin = 100;
    let bottomMargin = 100;
    
    // Center the grid
    let offsetX = (width - gridW) / 2;
    let offsetY = (height - gridH - bottomMargin - topMargin) / 2 + topMargin;
    
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            let x = c * cellSize + offsetX;
            let y = r * cellSize + offsetY;
            noFill();
            rect(x, y, cellSize, cellSize);
        }
    }
}

function highlightSelectedTiles() {
    fill(0, 150, 255, 120);
    noStroke();
    let offsetX = (width - gridSize * cellSize) / 2;
    let offsetY = (height - gridSize * cellSize) / 2;
    for (let t of roomTiles) {
        let x = t.c * cellSize + offsetX; 
        let y = t.r * cellSize + offsetY;
        rect(x, y, cellSize, cellSize, 5);
    }
}

function drawStats() {
    let statsX = windowWidth - 250;
    let statsY = 20;
    let barWidth = 200;
    let barHeight = 15;
    fill(0, 180);
    rect(statsX, statsY, 220, 120, 10);
    let energyBarX = statsX + 10;
    let energyBarY = statsY + 10;
    let energyPercent = map(totalEnergy, 0, 100, 0, barWidth, true); // Clamp value
    fill(50, 50, 50, 200);
    rect(energyBarX, energyBarY, barWidth, barHeight, 5);
    fill(0, 255, 0);
    rect(energyBarX, energyBarY, energyPercent, barHeight, 5);
    fill(255);
    textAlign(LEFT, TOP);
    textSize(14);
    text(`Energy: ${totalEnergy.toFixed(1)} / 100`, energyBarX + 5, energyBarY);

    let costBarY = statsY + 40;
    let maxCost = 200;
    let costPercent = map(totalCost, 0, maxCost, 0, barWidth, true); // Clamp value
    fill(50, 50, 50, 200);
    rect(energyBarX, costBarY, barWidth, barHeight, 5);
    fill(255, 200, 0);
    rect(energyBarX, costBarY, costPercent, barHeight, 5);
    fill(255);
    text(`Cost: ${totalCost.toFixed(1)} / ${maxCost}`, energyBarX + 5, costBarY);

    let powerBarY = statsY + 70;
    let maxPower = 50;
    let powerPercent = map(totalPower, 0, maxPower, 0, barWidth, true); // Clamp value
    fill(50, 50, 50, 200);
    rect(energyBarX, powerBarY, barWidth, barHeight, 5);
    fill(0, 200, 255);
    rect(energyBarX, powerBarY, powerPercent, barHeight, 5);
    fill(255);
    text(`Power: ${totalPower.toFixed(1)} / ${maxPower}`, energyBarX + 5, powerBarY);
}

function drawTitle() {
    textAlign(LEFT, TOP);
    textSize(28);
    fill(255);
    stroke(0);
    strokeWeight(3);
    text("SPACE HOUSE BUILDER", 40, 30);
}

function styleButton(btn) {
    btn.style("background", "linear-gradient(90deg,#0040ff,#00d4ff)");
    btn.style("color", "#fff");
    btn.style("border", "none");
    btn.style("padding", "8px 16px");
    btn.style("border-radius", "8px");
    btn.style("font-family", "Arial"); 
    btn.style("cursor", "pointer");
    btn.style("width", "200px");
}

function mouseDragged() {
    if (draggingRoom) {
        // Dragging a room in 'final' mode
        draggingRoom.offsetX = mouseX;
        draggingRoom.offsetY = mouseY;
    } else if (draggedItem) {
        // Dragging a new item from the inventory
        // (No action needed here, as drawDraggedItem just follows the mouse)
    }
}

function getRoomBounds(tiles) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    // Calculate the bounding box based on the grid tiles (r, c)
    for (let tile of tiles) {
        let x = tile.c * cellSize;
        let y = tile.r * cellSize;
        minX = min(minX, x);
        maxX = max(maxX, x + cellSize);
        minY = min(minY, y);
        maxY = max(maxY, y + cellSize);
    }
    return { minX, maxX, minY, maxY };
}

function pointInRoom(px, py, tiles) {
    let points = getRoomPoints(tiles);
    if (points.length < 3) return false;

    // Point-in-polygon algorithm (Ray casting)
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        let xi = points[i].x,
            yi = points[i].y;
        let xj = points[j].x,
            yj = points[j].y;
        
        // FIX: The cut-off logic is completed here
        let intersect = ((yi > py) != (yj > py)) && 
                        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}