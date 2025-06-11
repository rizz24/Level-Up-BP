console.warn(' main.js loaded')

import { world, system, ItemStack } from "@minecraft/server"
import "./onjoin/index.js"
import { adminUsernames } from "./onjoin/index.js"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

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
    while (u === 0) u = Math.random(); // Avoid 0
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num * stddev + mean;

    num = Math.max(min, Math.min(max, Math.round(num)));
    return num;
}

const tierConfigs = {
    "Tier 1 Mobs": [3, 5, 4, 1],
    "Tier 2 Mobs": [15, 20, 17, 2],
    "Tier 3 Mobs": [60, 70, 65, 3],
    "Tier 4 Mobs": [130, 150, 140, 7],
    "Tier 5 Mobs": [220, 250, 235, 15],
    "Warden": [10000, 10000, 10000, 0],
    "Wither": [25000, 25000, 25000, 0],
    "Ender Dragon": [50000, 50000, 50000, 0]
};

const mobTiers = {
    "Tier 1 Mobs": [
        "minecraft:slime", "minecraft:magma_cube"
    ],
    "Tier 2 Mobs": [
        "minecraft:creeper", "minecraft:endermite", "minecraft:phantom", "minecraft:silverfish", "minecraft:skeleton", "minecraft:spider", "minecraft:cave_spider", "minecraft:zombie", "minecraft:zombie_villager"
    ],
    "Tier 3 Mobs": [
        "minecraft:blaze", "minecraft:bogged", "minecraft:breeze", "minecraft:creaking", "minecraft:husk", "minecraft:enderman", "minecraft:shulker", "minecraft:stray", "minecraft:witch"
    ],
    "Tier 4 Mobs": [
        "minecraft:ghast", "minecraft:hoglin", "minecraft:piglin", "minecraft:pillager", "minecraft:vex", "minecraft:zoglin", "minecraft:zombie_pigman"
    ],
    "Tier 5 Mobs": [
        "minecraft:elder_guardian", "minecraft:guardian", "minecraft:evocation_illager", "minecraft:piglin_brute", "minecraft:ravager", "minecraft:vindicator", "minecraft:wither_skeleton"
    ],
    "Warden": ["minecraft:warden"],
    "Wither": ["minecraft:wither"],
    "Ender Dragon": ["minecraft:ender_dragon"]
};

let txtclr =  false;

// - - - - - - - - - - - - - - - - - - - - - - - - - - MENU - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


world.beforeEvents.itemUse.subscribe(data => {
    let player = data.source
    let title = "§l§aLeveling Orb"
    if (data.itemStack.typeId == "minecraft:compass") system.run(() => main(player))
    
    function isAdmin(username) {
        return adminUsernames.includes(username);
    }

    function main() {

        if (isAdmin(player.name)) {
            const form = new ActionFormData()
                .title(title)
                .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
                .button(`§bProfile`)
                .button(`§bAscension`)
                .button(`§cClose`)
                .button(`ADMIN CONTROLS`)

            form.show(player).then(r => {
                if (r.selection == 0) Profile(player)
                if (r.selection == 1) Ascension(player)
                if (r.selection == 2) {}
                if (r.selection == 3) Admin(player)
            })

        } else {
            const form = new ActionFormData()
                .title(title)
                .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
                .button(`§bProfile`)
                .button(`§bAscension`)
                .button(`§cClose`)
            
            form.show(player).then(r => {
                if (r.selection == 0) Profile(player)
                if (r.selection == 1) Ascension(player)
                if (r.selection == 2) {}
            })
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v ADMIN v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function Admin(player) {
        const form = new ActionFormData()
            .title("§l§cAdmin Controls")
            .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
            .button(`§bEdit Tier1 XP`)
            .button(`§bEdit Tier2 XP`)
            .button(`§bEdit Tier3 XP`)
            .button(`§bEdit Tier4 XP`)
            .button(`§bEdit Tier5 XP`)
            .button(`§bEdit Warden XP`)
            .button(`§bEdit Wither XP`)
            .button(`§bEdit Ender Dragon XP`)
            .button(`§cClose`)

        form.show(player).then(r => {
            if (r.selection == 0) tier1(player)
            if (r.selection == 1) tier2(player)
            if (r.selection == 2) tier3(player)
            if (r.selection == 3) tier4(player)
            if (r.selection == 4) tier5(player)
            if (r.selection == 5) warden(player)
            if (r.selection == 6) wither(player)
            if (r.selection == 7) enderDragon(player)
            if (r.selection == 8) main(player)
        })
    }

    function tier1() {
        const form = new ModalFormData()
            .title("§l§bEdit Tier 1 XP")
            .textField("§fEnter new XP range (min, max, mean, stddev):", "3, 5, 4, 1");

        form.show(player).then(r => {
            if (r.canceled) return;
            const input = r.formValues[0].split(",").map(Number);
            if (input.length === 4 && input.every(num => !isNaN(num))) {
                tierConfigs["Tier 1 Mobs"] = input;
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aTier 1 XP updated to: ${input.join(", ")}"}]}`);
            } else {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cInvalid input! Please enter four numbers separated by commas."}]}`);
            }
        });
    }

    function tier2() {
        const form = new ModalFormData()
            .title("§l§bEdit Tier 2 XP")
            .textField("§fEnter new XP range (min, max, mean, stddev):", "15, 20, 7, 2");

        form.show(player).then(r => {
            if (r.canceled) return;
            const input = r.formValues[0].split(",").map(Number);
            if (input.length === 4 && input.every(num => !isNaN(num))) {
                tierConfigs["Tier 1 Mobs"] = input;
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aTier 2 XP updated to: ${input.join(", ")}"}]}`);
            } else {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cInvalid input! Please enter four numbers separated by commas."}]}`);
            }
        });
    }

    function tier3() {
        const form = new ModalFormData()
            .title("§l§bEdit Tier 3 XP")
            .textField("§fEnter new XP range (min, max, mean, stddev):", "60, 70, 65, 3");

        form.show(player).then(r => {
            if (r.canceled) return;
            const input = r.formValues[0].split(",").map(Number);
            if (input.length === 4 && input.every(num => !isNaN(num))) {
                tierConfigs["Tier 1 Mobs"] = input;
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aTier 3 XP updated to: ${input.join(", ")}"}]}`);
            } else {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cInvalid input! Please enter four numbers separated by commas."}]}`);
            }
        });
    }

    function tier4() {
        const form = new ModalFormData()
            .title("§l§bEdit Tier 4 XP")
            .textField("§fEnter new XP range (min, max, mean, stddev):", "130, 150, 140, 7");

        form.show(player).then(r => {
            if (r.canceled) return;
            const input = r.formValues[0].split(",").map(Number);
            if (input.length === 4 && input.every(num => !isNaN(num))) {
                tierConfigs["Tier 1 Mobs"] = input;
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aTier 4 XP updated to: ${input.join(", ")}"}]}`);
            } else {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cInvalid input! Please enter four numbers separated by commas."}]}`);
            }
        });
    }

    function tier5() {
        const form = new ModalFormData()
            .title("§l§bEdit Tier 5 XP")
            .textField("§fEnter new XP range (min, max, mean, stddev):", "220, 250, 235, 15");

        form.show(player).then(r => {
            if (r.canceled) return;
            const input = r.formValues[0].split(",").map(Number);
            if (input.length === 4 && input.every(num => !isNaN(num))) {
                tierConfigs["Tier 1 Mobs"] = input;
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aTier 5 XP updated to: ${input.join(", ")}"}]}`);
            } else {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cInvalid input! Please enter four numbers separated by commas."}]}`);
            }
        });
    }

    function warden() {
        const form = new ModalFormData()
            .title("§l§bEdit Warden XP")
            .textField("§fEnter new XP value:", "10000");

        form.show(player).then(r => {
            if (r.canceled) return;
            const input = parseInt(r.formValues[0]);
            if (!isNaN(input)) {
                tierConfigs["Warden"] = [input, input, input, 0];
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aWarden XP updated to: ${input}"}]}`);
            } else {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cInvalid input! Please enter a valid number."}]}`);
            }
        });
    }

    function wither() {
        const form = new ModalFormData()
            .title("§l§bEdit Wither XP")
            .textField("§fEnter new XP value:", "25000");

        form.show(player).then(r => {
            if (r.canceled) return;
            const input = parseInt(r.formValues[0]);
            if (!isNaN(input)) {
                tierConfigs["Wither"] = [input, input, input, 0];
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aWither XP updated to: ${input}"}]}`);
            } else {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cInvalid input! Please enter a valid number."}]}`);
            }
        });
    }

    function enderDragon() {
        const form = new ModalFormData()
            .title("§l§bEdit Ender Dragon XP")
            .textField("§fEnter new XP value:", "50000");

        form.show(player).then(r => {
            if (r.canceled) return;
            const input = parseInt(r.formValues[0]);
            if (!isNaN(input)) {
                tierConfigs["Ender Dragon"] = [input, input, input, 0];
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§aEnder Dragon XP updated to: ${input}"}]}`);
            } else {
                player.runCommand(`tellraw @s {"rawtext":[{"text":"§cInvalid input! Please enter a valid number."}]}`);
            }
        });
    }

// - - - - - - - - - - - - - - - - - - - - - - - ^ ADMIN ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function Profile(player) {
        const overallXP = getScore("overallXP", player);
        const combatLVL = getScore("combatLVL", player);
        const combatXP = getScore("combatXP", player);
        const combatNextLVL = getScore("combatNextLVL", player) || 100;
        const combatASC = getScore("combatASC", player);
        const combatlimitXP = combatNextLVL - combatXP;

        // Check if max ascension
        let maxAsc = combatASC >= 5;

        if (maxAsc) {
            new ActionFormData()
                .title(`§l§bCombat Profile`)
                .body(
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n` +
                    `    §fCombat Level: ${combatLVL}\n\n` +
                    `    Combat XP: ${overallXP}\n` +
                    `  \n          ( MAX ASCENSION )\n\n` +
                    `    Combat Ascension: §cMAXED (5)\n\n` +
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
                .button("§l§cBack")
                .show(player).then(r => {
                    if (r.selection == 0) main(player)
                });
        } else if (combatLVL >= 50) {
            new ActionFormData()
                .title(`§l§bCombat Profile`)
                .body(
                    `§a - - - - - - - - - - - - - - - - - - -\n\n\n` +
                    `    §fCombat Level: ${combatLVL}\n\n` +
                    `    Combat XP: ${overallXP}\n` +
                    `  \n          ( Ready for Ascension )\n\n` +
                    `    Combat Ascension: ${combatASC}\n\n\n` +
                    `§a - - - - - - - - - - - - - - - - - - -\n`
                )
                .button("§l§aAscend")
                .button("§l§cBack")
                .show(player).then(r => {
                    if (r.selection == 0) Ascension(player)
                    if (r.selection == 1) main(player)
                });
        } else {
            new ActionFormData()
                .title(`§l§bCombat Profile`)
                .body(
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n\n` +
                    `    §fCombat Level: ${combatLVL} \n\n` +
                    `    Combat XP:\n       ${combatXP} / ${combatNextLVL}` +
                    `  \n      ( ${combatlimitXP} XP to go )\n\n` +
                    `    Combat Ascension: ${combatASC}\n\n\n` +
                    `§a  - - - - - - - - - - - - - - - - - - -\n`
                )
                .button("§l§cBack")
                .show(player).then(r => {
                    if (r.selection == 0) main(player)
                });
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function Ascension(player) {
        const combatLVL = getScore("combatLVL", player)
        const combatASC = getScore("combatASC", player)
        const canAscend = combatLVL >= 50 && combatASC < 5;

        let form = new ActionFormData()
            .title("§l§dCombat Ascension")
            .body(
                `§a - - - - - - - - - - - - - - - - - - -\n\n\n` +
                `    §fCombat Level: §b${combatLVL}\n` +
                `    §fAscensions: §d${combatASC} / 5\n\n` +
                (canAscend
                    ? "    §eYou are eligible to ascend!\n\n\n"
                    : combatASC >= 5
                    ? "   §cYou have reached max ascension.\n\n\n"
                    : "    §7Reach level 20 to ascend.\n\n\n") +
                `§a - - - - - - - - - - - - - - - - - - -\n`
            )
            .button("§l§aAscend")
            .button("§l§cBack");

        form.show(player).then(r => {
            if (r.canceled) return;
            if (r.selection === 0 && canAscend) {
                // Ascend logic
                setScore("combatASC", player, combatASC + 1);
                setScore("combatLVL", player, 0);
                setScore("combatXP", player, 0);
                setScore("combatNextLVL", player, 100);
                setScore("combatlimitXP", player, 100);
                system.runTimeout(() => {
                    player.runCommand(`title @s title §dAscended!`);
                    player.runCommand('playsound random.levelup @s');
                }, 0);
            } else if (r.selection === 1) {
                main(player);
            } else if (r.selection === 0 && combatASC >= 5) {
                player.runCommand(`title @s title §cMax Ascension Reached!`);
                player.runCommand(`title @s subtitle §7You cannot ascend further.`);
            } else if (r.selection === 0 && !canAscend) {
                player.runCommand(`title @s title §cAscension Failed!`);
                player.runCommand(`title @s subtitle §7Reach Level 20 to ascend.`);
            }
        });
    }

})

// - - - - - - - - - - - - - - - - - - - - - - - ^ Menu ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - - v Events v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// At the top of your file:
const mobAttackers = new Map();

// Track attackers
world.afterEvents.entityHitEntity.subscribe((event) => {
    const { hitEntity, damagingEntity } = event;
    if (!hitEntity || !damagingEntity) return;
    if (damagingEntity.typeId !== "minecraft:player") return;

    // Get or create the set of attackers for this mob
    let attackers = mobAttackers.get(hitEntity);
    if (!attackers) {
        attackers = new Set();
        mobAttackers.set(hitEntity, attackers);
    }
    attackers.add(damagingEntity);
});

world.afterEvents.entityDie.subscribe((mcch) => {
    const deadEntity = mcch.deadEntity;
    const attackers = mobAttackers.get(deadEntity);
    if (!attackers) return;

    for (const killer of attackers) {
        // Find the tier for this mob
        let foundTier = null;
        for (const [tier, mobs] of Object.entries(mobTiers)) {
            if (mobs.includes(deadEntity.typeId)) {
                foundTier = tier;
                break;
            }
        }
        if (!foundTier) continue;

        const [min, max, mean, stddev] = tierConfigs[foundTier];
        const randomXP = numgen(min, max, mean, stddev);

        addScore("combatXP", killer, randomXP);
        addScore("overallXP", killer, randomXP);

        let combatXP = getScore("combatXP", killer)
        let combatLVL = getScore("combatLVL", killer)
        let combatNextLVL = getScore("combatNextLVL", killer) || 100;
        let combatlimitXP = getScore("combatlimitXP", killer) || 100;
        let combatASC = getScore("combatASC", killer)

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            killer.runCommand(`title @s actionbar ${color}Combat +${randomXP}XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP -= combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.6));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.6));

            setScore("combatXP", killer, combatXP);
            setScore("combatLVL", killer, combatLVL);
            setScore("combatNextLVL", killer, combatNextLVL);
            setScore("combatlimitXP", killer, combatlimitXP);

            system.runTimeout(() => {
                killer.runCommand(`title @s title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 50 && combatASC < 5) {
                system.runTimeout(() => {
                    killer.runCommand(`title @s title Combat Ascension Ready!`);
                }, 60);
                break;
            }
        }
    }
    mobAttackers.delete(deadEntity);
});

// - - - - - - - - - - - - - - - - - - - - - - - ^ Combat ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

world.beforeEvents.chatSend.subscribe((mcch) => {
    let player = mcch.sender;
    let message = mcch.message.toLowerCase();

    if (message === `!help`) {
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `\n§a- - - - - - - - - - - §fHelp (1) §a- - - - - - - - - - - -\n`+
                `§f !help - shows this help\n`+
                `§f !start - gives you the RPG Menu Book\n`+
                `§f !lb - shows overall leaderboard\n\n`+
                `"}]}`);
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
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
            `Welcome ${player.nameTag}! Type 'r!help' for guide!`+
            `"}]}`);
        }
        }, 0);
    }

    if (message === `!lb`) {
        mcch.cancel = true;

        // Gather all players' stats
        let stats = [];
        for (const p of world.getPlayers()) {
            stats.push({
                name: p.nameTag,
                lvl: getScore("combatLVL", p),
                xp: getScore("overallXP", p),
                asc: getScore("combatASC", p)
            });
        }

        // Sort and build Combat XP leaderboard
        let xpSorted = [...stats].sort((a, b) => b.xp - a.xp);
        let xpText = `§a- - - - - - - §fOverall Combat XP Leaderboard §a- - - - - - - -\n`;
        xpSorted.slice(0, 5).forEach((entry, i) => {
            xpText += `§e${i + 1}. §b${entry.name} §7- §a${entry.xp} XP §7- §aLvl ${entry.lvl}\n`;
        });

        // Sort and build Ascension leaderboard
        let ascSorted = [...stats].sort((a, b) => b.asc - a.asc);
        let ascText = `\n§d- - - - - - - - - §fAscension Leaderboard §d- - - - - - - - - -\n`;
        ascSorted.slice(0, 5).forEach((entry, i) => {
            ascText += `§e${i + 1}. §b${entry.name} §7- §d${entry.asc} Ascensions\n`;
        });

        let lbText = `\n${xpText}${ascText}\n§a- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -`;

        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"${lbText}"}]}`);
        }, 0);
    }

});