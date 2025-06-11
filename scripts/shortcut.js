import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { adminUsernames } from "./onjoin/index.js";

function getScore(obj, player) {
    try {
        const objective = world.scoreboard.getObjective(obj);
        return objective.getScore(player) || 0;
    } catch {
        return 0;
    }
}
function setScore(obj, player, value) {
    try {
        const objective = world.scoreboard.getObjective(obj);
        objective.setScore(player, value);
    } catch {
        player.runCommandAsync(`scoreboard objectives add ${obj} dummy`);
        world.scoreboard.getObjective(obj).setScore(player, value);
    }
}
function addScore(obj, player, value) {
    setScore(obj, player, getScore(obj, player) + value);
}
function numgen(min, max, mean, stddev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num * stddev + mean;
    return Math.max(min, Math.min(max, Math.round(num)));
}

const mobAttackers = new Map();
let txtclr = false;

// Track attackers
world.afterEvents.entityHitEntity.subscribe(event => {
    const { hitEntity, damagingEntity } = event;
    if (!hitEntity || !damagingEntity) return;
    if (damagingEntity.typeId !== "minecraft:player") return;
    let attackers = mobAttackers.get(hitEntity);
    if (!attackers) {
        attackers = new Set();
        mobAttackers.set(hitEntity, attackers);
    }
    attackers.add(damagingEntity);
});

// Reward XP and handle leveling/ascension
world.afterEvents.entityDie.subscribe(event => {
    const deadEntity = event.deadEntity;
    const attackers = mobAttackers.get(deadEntity);
    if (!attackers) return;

    for (const killer of attackers) {
        let randomXP = 0;
        if (["minecraft:magma_cube", "minecraft:slime"].includes(deadEntity.typeId)) randomXP = numgen(3, 5, 4, 1);
        else if (["minecraft:creeper", "minecraft:endermite", "minecraft:phantom", "minecraft:silverfish", "minecraft:skeleton", "minecraft:spider", "minecraft:cave_spider", "minecraft:zombie", "minecraft:zombie_villager"].includes(deadEntity.typeId)) randomXP = numgen(15, 20, 17, 2);
        else if (["minecraft:blaze", "minecraft:bogged", "minecraft:breeze", "minecraft:creaking", "minecraft:husk", "minecraft:enderman", "minecraft:shulker", "minecraft:stray", "minecraft:witch"].includes(deadEntity.typeId)) randomXP = numgen(60, 70, 65, 3);
        else if (["minecraft:ghast", "minecraft:hoglin", "minecraft:piglin", "minecraft:pillager", "minecraft:vex", "minecraft:zoglin", "minecraft:zombie_pigman"].includes(deadEntity.typeId)) randomXP = numgen(130, 150, 140, 7);
        else if (["minecraft:elder_guardian", "minecraft:guardian", "minecraft:evocation_illager", "minecraft:piglin_brute", "minecraft:ravager", "minecraft:vindicator", "minecraft:wither_skeleton"].includes(deadEntity.typeId)) randomXP = numgen(220, 250, 235, 15);
        else if (deadEntity.typeId === "minecraft:wither") randomXP = 1000;
        else if (deadEntity.typeId === "minecraft:warden") randomXP = 5000;
        else if (deadEntity.typeId === "minecraft:ender_dragon") randomXP = 50000;
        else continue;

        addScore("combatXP", killer, randomXP);
        addScore("overallXP", killer, randomXP);

        let combatXP = getScore("combatXP", killer);
        let combatLVL = getScore("combatLVL", killer) || 1;
        let combatNextLVL = getScore("combatNextLVL", killer) || 100;
        let combatlimitXP = getScore("combatlimitXP", killer) || 100;
        let combatASC = getScore("combatASC", killer) || 0;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            killer.runCommandAsync(`title @s actionbar ${color}Combat +${randomXP}XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP -= combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            setScore("combatXP", killer, combatXP);
            setScore("combatLVL", killer, combatLVL);
            setScore("combatNextLVL", killer, combatNextLVL);
            setScore("combatlimitXP", killer, combatlimitXP);
            system.runTimeout(() => {
                killer.runCommandAsync(`title @s title Combat Leveled up!`);
            }, 0);
            if (combatLVL >= 20 && combatASC < 5) {
                system.runTimeout(() => {
                    killer.runCommandAsync(`title @s title Combat Ascension Ready!`);
                }, 60);
                break;
            }
        }
    }
    mobAttackers.delete(deadEntity);
});

// Menu and UI
world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source;
    const title = "§l§aLeveling Orb";
    if (data.itemStack.typeId == "minecraft:compass") system.run(() => main(player));

    function isAdmin(username) {
        return adminUsernames.includes(username);
    }

    function main(player) {
        const form = new ActionFormData()
            .title(title)
            .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
            .button(`§bProfile`)
            .button(`§bAscension`)
            .button(`§cClose`)
            .button(isAdmin(player.name) ? `ADMIN CONTROLS` : undefined)
        form.show(player).then(r => {
            if (r.selection == 0) Profile(player);
            if (r.selection == 1) Ascension(player);
            if (r.selection == 3 && isAdmin(player.name)) Admin(player);
        });
    }

    function Profile(player) {
        const combatLVL = getScore("combatLVL", player);
        const combatXP = getScore("combatXP", player);
        const combatNextLVL = getScore("combatNextLVL", player) || 100;
        const combatASC = getScore("combatASC", player);
        const combatlimitXP = combatNextLVL - combatXP;
        let maxAsc = combatASC >= 5;
        let body = maxAsc
            ? `§fCombat Level: ${combatLVL}\nCombat XP: ${combatXP}\n(MAX ASCENSION)\nCombat Ascension: §cMAXED (5)`
            : combatLVL >= 20
                ? `§fCombat Level: ${combatLVL}\nCombat XP: ${combatXP}\n(Ready for Ascension)\nCombat Ascension: ${combatASC}`
                : `§fCombat Level: ${combatLVL}\nCombat XP: ${combatXP} / ${combatNextLVL}\n(${combatlimitXP} XP to go)\nCombat Ascension: ${combatASC}`;
        const form = new ActionFormData()
            .title(`§l§bCombat Profile`)
            .body(body)
            .button(maxAsc ? "§l§cBack" : combatLVL >= 20 ? "§l§aAscend" : "§l§cBack");
        form.show(player).then(r => {
            if (r.selection == 0 && combatLVL >= 20 && !maxAsc) Ascension(player);
            else main(player);
        });
    }

    function Ascension(player) {
        const combatLVL = getScore("combatLVL", player);
        const combatASC = getScore("combatASC", player);
        const canAscend = combatLVL >= 20 && combatASC < 5;
        const form = new ActionFormData()
            .title("§l§dCombat Ascension")
            .body(
                `§fCombat Level: §b${combatLVL}\n` +
                `§fAscensions: §d${combatASC} / 5\n` +
                (canAscend
                    ? "§eYou are eligible to ascend!"
                    : combatASC >= 5
                        ? "§cYou have reached max ascension."
                        : "§7Reach level 20 to ascend.")
            )
            .button("§l§aAscend")
            .button("§l§cBack");
        form.show(player).then(r => {
            if (r.canceled) return;
            if (r.selection === 0 && canAscend) {
                setScore("combatASC", player, combatASC + 1);
                setScore("combatLVL", player, 0);
                setScore("combatXP", player, 0);
                setScore("combatNextLVL", player, 100);
                setScore("combatlimitXP", player, 100);
                system.runTimeout(() => {
                    player.runCommandAsync(`title @s title §dAscended!`);
                    player.runCommandAsync('playsound random.levelup @s');
                }, 0);
                Ascension(player);
            } else if (r.selection === 1) {
                main(player);
            } else if (r.selection === 0 && !canAscend) {
                system.runTimeout(() => {
                    player.runCommandAsync(`title @s title §cAscension Failed!`);
                    player.runCommandAsync(`title @s subtitle §7Reach Level 20 to ascend.`);
                }, 0);
                Ascension(player);
            }
        });
    }

    function Admin(player) {
        new ActionFormData()
            .title(`§l§bADMIN CONTROLS`)
            .button("§o§bCombat Profile")
            .button("§o§bLumber Profile")
            .button("§o§bMining Profile")
            .button("§o§bFarming Profile")
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) Profile(player);
                if (r.selection == 4) main(player);
            });
    }
});

// Leaderboard chat command
world.beforeEvents.chatSend.subscribe(mcch => {
    let player = mcch.sender;
    let message = mcch.message.toLowerCase();

    if (message === `!help`) {
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"\n§a- - - - - - - - - - - §fHelp (1) §a- - - - - - - - - - - -\n§f !help - shows this help\n§f !start - gives you the RPG Menu Book\n§f !lb - shows overall leaderboard\n\n"}]}`);
        }, 0);
    }

    if (message === `!start`) {
        mcch.cancel = true;
        system.runTimeout(() => {
            if (player.hasTag("has_started")) {
                player.sendMessage("You already did that. Sorry.");
            } else {
                const item = new ItemStack("minecraft:compass", 1);
                const inventory = player.getComponent("minecraft:inventory").container;
                inventory.addItem(item);
                player.addTag("has_started");
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"Welcome ${player.nameTag}! Type '!help' for guide!"}]}`);
            }
        }, 0);
    }

    if (message === `!lb`) {
        mcch.cancel = true;
        let stats = [];
        for (const p of world.getPlayers()) {
            stats.push({
                name: p.nameTag,
                lvl: getScore("combatLVL", p) || 1,
                xp: getScore("combatXP", p) || 0,
                asc: getScore("combatASC", p) || 0
            });
        }
        let xpSorted = [...stats].sort((a, b) => b.xp - a.xp);
        let xpText = `§a- - - - - - - §fCombat XP Leaderboard §a- - - - - - - - - - - -\n`;
        xpSorted.slice(0, 5).forEach((entry, i) => {
            xpText += `§e${i + 1}. §b${entry.name} §7- §aLvl ${entry.lvl} §7- §a${entry.xp} XP\n`;
        });
        let ascSorted = [...stats].sort((a, b) => b.asc - a.asc);
        let ascText = `\n§d- - - - - - - §fAscension Leaderboard §d- - - - - - - - - - - -\n`;
        ascSorted.slice(0, 5).forEach((entry, i) => {
            ascText += `§e${i + 1}. §b${entry.name} §7- §aLvl ${entry.lvl} §7- §d${entry.asc} Ascensions\n`;
        });
        let lbText = `\n${xpText}${ascText}\n§a- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -`;
        system.runTimeout(() => {
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"${lbText}"}]}`);
        }, 0);
    }
});