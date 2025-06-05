console.warn(' main.js loaded');

import { world, system, ItemStack } from "@minecraft/server";
import "./onjoin/index.js";
import { adminUsernames } from "./onjoin/index.js";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// --- Skill Data ---
const skills = {
    combat: { LVL: 0, XP: 0, limitXP: 100, NextLVL: 100, ASC: 0, CanAscend: false, Ascended: [false, false, false, false, false] },
    lumber: { LVL: 0, XP: 0, limitXP: 100, NextLVL: 100, ASC: 0, CanAscend: false, Ascended: [false, false, false, false, false] },
    mining: { LVL: 0, XP: 0, limitXP: 100, NextLVL: 100, ASC: 0, CanAscend: false, Ascended: [false, false, false, false, false] },
    farming: { LVL: 0, XP: 0, limitXP: 100, NextLVL: 100, ASC: 0, CanAscend: false, Ascended: [false, false, false, false, false] }
};
let txtclr = false, allXP = 0;

// --- XP Tables ---
const entityXP = {
    // Small mobs
    "minecraft:magma_cube": [3, 5, 4, 1],
    "minecraft:slime": [3, 5, 4, 1],
    // Common mobs
    "minecraft:creeper": [15, 20, 17, 2], "minecraft:endermite": [15, 20, 17, 2], "minecraft:phantom": [15, 20, 17, 2],
    "minecraft:silverfish": [15, 20, 17, 2], "minecraft:skeleton": [15, 20, 17, 2], "minecraft:spider": [15, 20, 17, 2],
    "minecraft:cave_spider": [15, 20, 17, 2], "minecraft:zombie": [15, 20, 17, 2], "minecraft:zombie_villager": [15, 20, 17, 2],
    // Mid mobs
    "minecraft:blaze": [60, 70, 65, 3], "minecraft:bogged": [60, 70, 65, 3], "minecraft:breeze": [60, 70, 65, 3],
    "minecraft:creaking": [60, 70, 65, 3], "minecraft:husk": [60, 70, 65, 3], "minecraft:enderman": [60, 70, 65, 3],
    "minecraft:shulker": [60, 70, 65, 3], "minecraft:stray": [60, 70, 65, 3], "minecraft:witch": [60, 70, 65, 3],
    // Strong mobs
    "minecraft:ghast": [130, 150, 140, 7], "minecraft:hoglin": [130, 150, 140, 7], "minecraft:piglin": [130, 150, 140, 7],
    "minecraft:pillager": [130, 150, 140, 7], "minecraft:vex": [130, 150, 140, 7], "minecraft:zoglin": [130, 150, 140, 7],
    "minecraft:zombie_pigman": [130, 150, 140, 7],
    // Boss/elite mobs
    "minecraft:elder_guardian": [220, 250, 235, 15], "minecraft:guardian": [220, 250, 235, 15],
    "minecraft:evocation_illager": [220, 250, 235, 15], "minecraft:piglin_brute": [220, 250, 235, 15],
    "minecraft:ravager": [220, 250, 235, 15], "minecraft:vindicator": [220, 250, 235, 15],
    "minecraft:wither_skeleton": [220, 250, 235, 15],
    // Bosses
    "minecraft:wither": [1000, 1000, 1000, 0], "minecraft:warden": [5000, 5000, 5000, 0], "minecraft:ender_dragon": [50000, 50000, 50000, 0]
};
const blockXP = {
    // Lumber
    "minecraft:acacia_log": ["lumber", 10], "minecraft:birch_log": ["lumber", 10], "minecraft:cherry_log": ["lumber", 10],
    "minecraft:dark_oak_log": ["lumber", 10], "minecraft:jungle_log": ["lumber", 10], "minecraft:mangrove_log": ["lumber", 10],
    "minecraft:oak_log": ["lumber", 10], "minecraft:pale_oak_log": ["lumber", 10], "minecraft:spruce_log": ["lumber", 10],
    "minecraft:crimson_stem": ["lumber", 10], "minecraft:warped_stem": ["lumber", 10],
    // Mining
    "minecraft:coal_ore": ["mining", 10], "minecraft:copper_ore": ["mining", 10], "minecraft:deepslate_coal_ore": ["mining", 10],
    "minecraft:deepslate_copper_ore": ["mining", 10], "minecraft:deepslate_diamond_ore": ["mining", 10], "minecraft:deepslate_emerald_ore": ["mining", 10],
    "minecraft:deepslate_gold_ore": ["mining", 10], "minecraft:deepslate_iron_ore": ["mining", 10], "minecraft:deepslate_lapis_ore": ["mining", 10],
    "minecraft:deepslate_redstone_ore": ["mining", 10], "minecraft:diamond_ore": ["mining", 10], "minecraft:emerald_ore": ["mining", 10],
    "minecraft:gold_ore": ["mining", 10], "minecraft:iron_ore": ["mining", 10], "minecraft:lapis_ore": ["mining", 10],
    "minecraft:nether_gold_ore": ["mining", 10], "minecraft:quartz_ore": ["mining", 10], "minecraft:redstone_ore": ["mining", 10],
    // Farming
    "minecraft:melon_block": ["farming", 10], "minecraft:pumpkin": ["farming", 10], "minecraft:carved_pumpkin": ["farming", 10]
};
const cropTypes = ["minecraft:wheat", "minecraft:carrots", "minecraft:potatoes", "minecraft:beetroot"];

// --- Utility ---
function getBlockKey(block) {
    return `${block.location.x},${block.location.y},${block.location.z},${block.dimension.id}`;
}
function getScore(objective, target, useZero = true) {
    try {
        const obj = world.scoreboard.getObjective(objective);
        if (typeof target == 'string') {
            return obj.getScore(obj.getParticipants().find(v => v.displayName == target));
        }
        return obj.getScore(target.scoreboard);
    } catch {
        return useZero ? 0 : NaN;
    }
}

// --- Placed Block Tracking ---
const placedBlocks = new Set();
world.afterEvents.playerPlaceBlock.subscribe(event => {
    const block = event.block;
    if (blockXP[block.typeId]) placedBlocks.add(getBlockKey(block));
});

// --- Block Break (XP) ---
world.beforeEvents.playerBreakBlock.subscribe(({ block, player }) => {
    const key = getBlockKey(block);
    // Block XP
    if (blockXP[block.typeId]) {
        if (placedBlocks.has(key)) { placedBlocks.delete(key); return; }
        const [skill, xp] = blockXP[block.typeId];
        addXP(skill, xp, player);
    }
    // Crops (must be fully grown)
    if (cropTypes.includes(block.typeId)) {
        try {
            const states = block.permutation.getAllStates();
            const age = states.growth ?? -1;
            const maxAge = block.typeId === "minecraft:beetroot" ? 3 : 7;
            if (age === maxAge) addXP("farming", 10, player);
        } catch { }
    }
});

// --- Entity Kill (Combat XP) ---
world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
    const killer = damageSource?.damagingEntity;
    if (!killer || killer.typeId !== "minecraft:player") return;
    if (entityXP[deadEntity.typeId]) {
        addXP("combat", randomXP(entityXP[deadEntity.typeId]), killer);
    }
});

// --- Add XP Function ---
function addXP(skill, amount, player) {
    const s = skills[skill];
    s.XP += amount;
    txtclr = !txtclr;
    const color = txtclr ? "§e" : "§f";
    system.runTimeout(() => {
        player.runCommand(`tellraw @s {"rawtext":[{"text":"${color}${skill.charAt(0).toUpperCase() + skill.slice(1)} +${amount}XP"}]}`);
    }, 0);
    while (s.XP >= s.limitXP) {
        s.XP -= s.NextLVL;
        s.LVL++;
        s.NextLVL += Math.round(Math.pow(s.NextLVL, 0.75));
        s.limitXP += Math.round(Math.pow(s.limitXP, 0.75));
        system.runTimeout(() => {
            player.runCommand(`title @p title ${skill.charAt(0).toUpperCase() + skill.slice(1)} Leveled up!`);
        }, 0);
        if (s.LVL >= 20 && s.Ascended.some(a => !a)) {
            s.CanAscend = true;
            system.runTimeout(() => {
                player.runCommand(`title @p title ${skill.charAt(0).toUpperCase() + skill.slice(1)} Ascension Ready!`);
            }, 60);
        }
    }
}

// --- Block Break (Mining XP) ---
function randomXP([min, max, mean, stddev]) {
    if (stddev === 0) return mean;
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num * stddev + mean;
    return Math.max(min, Math.min(max, Math.round(num)));
}

// --- Item Use (Open Main Menu) ---
world.beforeEvents.itemUse.subscribe(data => {
    if (data.itemStack.typeId === "level_up:level_orb") system.run(() => main(data.source));
});

// --- Menus ---
function showProfile(player, skill) {
    const s = skills[skill];
    let body;
    if (s.CanAscend) {
        body = `§a  - - - - - - - - - - - - - - - - - - -\n\n` +
            `    §f${skill.charAt(0).toUpperCase() + skill.slice(1)} Level: ${s.LVL}\n\n` +
            `    ${skill.charAt(0).toUpperCase() + skill.slice(1)} XP: §lFull§r§f\n` +
            `  \n          ( Ready for Ascension )\n\n` +
            `    ${skill.charAt(0).toUpperCase() + skill.slice(1)} Ascension: ${s.ASC}\n\n` +
            `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`;
    } else {
        body = `§a  - - - - - - - - - - - - - - - - - - -\n\n` +
            `    §f${skill.charAt(0).toUpperCase() + skill.slice(1)} Level: ${s.LVL}\n\n` +
            `    ${skill.charAt(0).toUpperCase() + skill.slice(1)} XP:\n       ${s.XP} / ${s.NextLVL}` +
            `  \n      ( ${s.NextLVL - s.XP}XP to go )\n\n` +
            `    ${skill.charAt(0).toUpperCase() + skill.slice(1)} Ascension: ${s.ASC}\n\n` +
            `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`;
    }
    new ActionFormData()
        .title(`§l§b${skill.charAt(0).toUpperCase() + skill.slice(1)} Profile`)
        .body(body)
        .button("§l§cBack")
        .show(player).then(r => {
            if (r.selection === 0) Profile(player);
        });
}
function Profile(player) {
    const skillKeys = Object.keys(skills);
    const form = new ActionFormData().title(`§l§bProfile`);
    skillKeys.forEach(k => form.button(`§o§b${k.charAt(0).toUpperCase() + k.slice(1)} Profile`));
    form.button(`§l§cBack`);
    form.show(player).then(r => {
        if (r.selection < skillKeys.length) showProfile(player, skillKeys[r.selection]);
        else main(player);
    });
}
function Admin(player) {
    const skillKeys = Object.keys(skills);
    const form = new ActionFormData().title(`§l§bADMIN CONTROLS`);
    skillKeys.forEach(k => form.button(`§o§b${k.charAt(0).toUpperCase() + k.slice(1)} Profile`));
    form.button(`§l§cBack`);
    form.show(player).then(() => main(player));
}
function Money(player) {
    const players = [...world.getPlayers()];
    new ModalFormData()
        .title(`§a§lMoney Transfer`)
        .dropdown('\n §o§5Choose Who To Send Money!', players.map(p => p.nameTag))
        .textField(`\n §uEnter The Amount Your Sending!\n§d Your current balance:\n §5$${getScore('Money', player.nameTag)}\n`, `§o              Only Use Numbers`)
        .show(player)
        .then(({ formValues: [dropdown, textField] }) => {
            const selectedPlayer = players[dropdown];
            if (selectedPlayer === player) {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cYou Can't Select Yourself"}]}`);
                return;
            }
            if (textField.includes("-")) {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cOnly Use Numbers"}]}`);
                return;
            }
            if (getScore('Money', player.nameTag) < textField) {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cYou Dont Have Enough Money"}]}`);
                return;
            }
            try {
                player.runCommand(`scoreboard players remove @s Money ${textField}`);
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aSent §l${selectedPlayer.nameTag} §r§2$${textField}"}]}`);
                selectedPlayer.runCommand(`tellraw @s {"rawtext":[{"text":"§l${player.nameTag} §r§aHas Given You §2$${textField}"}]}`);
                selectedPlayer.runCommand(`scoreboard players add @s Money ${textField}`);
            } catch {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cOnly Use Numbers"}]}`);
            }
        });
}
function main(player) {
    const form = new ActionFormData()
        .title("§l§aLeveling Orb")
        .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
        .button(`§bProfile`)
        .button(`§bMoney`)
        .button(`§bShop`);
    if (adminUsernames.includes(player.name)) form.button(`ADMIN CONTROLS`);
    form.show(player).then(r => {
        if (r.selection === 0) Profile(player);
        else if (r.selection === 1) Money(player);
        else if (r.selection === 2) {/* Shop(player); */ }
        else if (r.selection === 3) Admin(player);
    });
}

// --- Chat Commands (help, start, bal, etc) ---
world.beforeEvents.chatSend.subscribe(mcch => {
    const player = mcch.sender;
    const message = mcch.message.toLowerCase();
    if (message === "help" || message === "r!help") {
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"\n§a- - - - - - - - - - - §fHelp (1) §a- - - - - - - - - - - -\n§f r!help - shows this help\n§f r!start - gives you the RPG Menu Book\n§f r!bal - shows overall leaderboard\n\n"}]}`);
        }, 0);
    }
    if (message === "start" || message === "r!start") {
        mcch.cancel = true;
        system.runTimeout(() => {
            if (player.hasTag("has_started")) {
                player.sendMessage("You already did that. Sorry.");
            } else {
                const item = new ItemStack("level_up:level_orb", 1);
                const inventory = player.getComponent("minecraft:inventory").container;
                inventory.addItem(item);
                player.addTag("has_started");
                player.runCommand(`tellraw @s {"rawtext":[{"text":"Welcome ${player.nameTag}! Type 'r!help' for guide!"}]}`);
            }
        }, 0);
    }
    if (message === "bal" || message === "r!bal") {
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"Your current money balance is $${getScore('Money', player.nameTag)}"}]}`);
        }, 0);
    }
    // Debug/cheat commands (optional)
    if (message === "1") {
        skills.combat.XP += skills.combat.NextLVL;
        allXP += skills.combat.XP;
        while (skills.combat.XP >= skills.combat.limitXP) {
            skills.combat.XP -= skills.combat.NextLVL;
            skills.combat.LVL++;
            skills.combat.NextLVL += Math.round(Math.pow(skills.combat.NextLVL, 0.75));
            skills.combat.limitXP += Math.round(Math.pow(skills.combat.limitXP, 0.75));
        }
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"+1 CombatLevel (${skills.combat.LVL})\nAll XP: ${allXP}\nNext Level XP: ${skills.combat.NextLVL}\n\n"}]}`);
        }, 0);
    }
});