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

    function Admin() {
        new ActionFormData()
            .title(`§l§bADMIN CONTROLS`)
            .button("§o§bCombat Profile")
            .button("§o§bLumber Profile")
            .button("§o§bMining Profile")
            .button("§o§bFarming Profile")
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) main(player)
                if (r.selection == 1) main(player)
                if (r.selection == 2) main(player)
                if (r.selection == 3) main(player)
                if (r.selection == 4) main(player)
            })
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
        } else if (combatLVL >= 20) {
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
        const canAscend = combatLVL >= 20 && combatASC < 5;

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

// On death, reward all attackers
world.afterEvents.entityDie.subscribe((mcch) => {
    const deadEntity = mcch.deadEntity;
    const attackers = mobAttackers.get(deadEntity);
    if (!attackers) return;

    for (const killer of attackers) {
    
        if (
            deadEntity.typeId === `minecraft:magma_cube` ||
            deadEntity.typeId === `minecraft:slime`
        ) {
            const randomXP = numgen(3, 5, 4, 1); //min, max, mean, stddev

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
                combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
                combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));

                setScore("combatXP", killer, combatXP);
                setScore("combatLVL", killer, combatLVL);
                setScore("combatNextLVL", killer, combatNextLVL);
                setScore("combatlimitXP", killer, combatlimitXP);

                system.runTimeout(() => {
                    deadEntity.runCommand(`title @p title Combat Leveled up!`);
                }, 0);

                if (combatLVL >= 20 && combatASC < 5) {
                    system.runTimeout(() => {
                        player.runCommand(`title @s title Combat Ascension Ready!`);
                    }, 60);
                    break;
                }
            }
        }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (
            deadEntity.typeId === `minecraft:creeper` ||
            deadEntity.typeId === `minecraft:endermite` ||
            deadEntity.typeId === `minecraft:phantom` ||
            deadEntity.typeId === `minecraft:silverfish` ||
            deadEntity.typeId === `minecraft:skeleton` ||
            deadEntity.typeId === `minecraft:spider` ||
            deadEntity.typeId === `minecraft:cave_spider` ||
            deadEntity.typeId === `minecraft:zombie` ||
            deadEntity.typeId === `minecraft:zombie_villager`
        ) {

            const randomXP = numgen(15, 20, 17, 2); //min, max, mean, stddev

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
                combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
                combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));

                setScore("combatXP", killer, combatXP);
                setScore("combatLVL", killer, combatLVL);
                setScore("combatNextLVL", killer, combatNextLVL);
                setScore("combatlimitXP", killer, combatlimitXP);

                system.runTimeout(() => {
                    deadEntity.runCommand(`title @p title Combat Leveled up!`);
                }, 0);

                if (combatLVL >= 20 && combatASC < 5) {
                    system.runTimeout(() => {
                        killer.runCommand(`title @s title Combat Ascension Ready!`);
                    }, 60);
                    break;
                }
            }
        }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (
            deadEntity.typeId === `minecraft:blaze` ||
            deadEntity.typeId === `minecraft:bogged` ||
            deadEntity.typeId === `minecraft:breeze` ||
            deadEntity.typeId === `minecraft:creaking` ||
            deadEntity.typeId === `minecraft:husk` ||
            deadEntity.typeId === `minecraft:enderman` ||
            deadEntity.typeId === `minecraft:shulker` ||
            deadEntity.typeId === `minecraft:stray` ||
            deadEntity.typeId === `minecraft:witch`
        ) {
            const randomXP = numgen(60, 70, 65, 3); //min, max, mean, stddev

            addScore("combatXP", player, randomXP);
            addScore("overallXP", killer, randomXP);

            let combatXP = getScore("combatXP", killer)
            let combatLVL = getScore("combatLVL", killer)
            let combatNextLVL = getScore("combatNextLVL", killer) || 100;
            let combatlimitXP = getScore("combatlimitXP", killer) || 100;
            let combatASC = getScore("combatASC", killer)

            txtclr = !txtclr;
            const color = txtclr ? "§e" : "§f";
            system.runTimeout(() => {
                deadEntity.runCommand(`title @s actionbar ${color}Combat +${randomXP}XP`);
            }, 0);

            while (combatXP >= combatlimitXP) {
                combatXP -= combatNextLVL;
                combatLVL++;
                combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
                combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));

                setScore("combatXP", player, combatXP);
                setScore("combatLVL", player, combatLVL);
                setScore("combatNextLVL", player, combatNextLVL);
                setScore("combatlimitXP", player, combatlimitXP);

                system.runTimeout(() => {
                    deadEntity.runCommand(`title "${player.name}" title Combat Leveled up!`);
                }, 0);

                if (combatLVL >= 20 && combatASC < 5) {
                    system.runTimeout(() => {
                        player.runCommand(`title @s title Combat Ascension Ready!`);
                    }, 60);
                    break;
                }
            }
        }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (
            deadEntity.typeId === `minecraft:ghast` ||
            deadEntity.typeId === `minecraft:hoglin` ||
            deadEntity.typeId === `minecraft:piglin` ||
            deadEntity.typeId === `minecraft:pillager` ||
            deadEntity.typeId === `minecraft:vex` ||
            deadEntity.typeId === `minecraft:zoglin` ||
            deadEntity.typeId === `minecraft:zombie_pigman`
        ) {
            const randomXP = numgen(130, 150, 140, 7); //min, max, mean, stddev

            addScore("combatXP", player, randomXP);
            addScore("overallXP", killer, randomXP);

            let combatXP = getScore("combatXP", killer)
            let combatLVL = getScore("combatLVL", killer)
            let combatNextLVL = getScore("combatNextLVL", killer) || 100;
            let combatlimitXP = getScore("combatlimitXP", killer) || 100;
            let combatASC = getScore("combatASC", killer)

            txtclr = !txtclr;
            const color = txtclr ? "§e" : "§f";
            system.runTimeout(() => {
                deadEntity.runCommand(`title @s actionbar ${color}Combat +${randomXP}XP`);
            }, 0);

            while (combatXP >= combatlimitXP) {
                combatXP -= combatNextLVL;
                combatLVL++;
                combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
                combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));

                setScore("combatXP", player, combatXP);
                setScore("combatLVL", player, combatLVL);
                setScore("combatNextLVL", player, combatNextLVL);
                setScore("combatlimitXP", player, combatlimitXP);

                system.runTimeout(() => {
                    deadEntity.runCommand(`title "${player.name}" title Combat Leveled up!`);
                }, 0);

                if (combatLVL >= 20 && combatASC < 5) {
                    system.runTimeout(() => {
                        player.runCommand(`title @s title Combat Ascension Ready!`);
                    }, 60);
                    break;
                }
            }
        }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (
            deadEntity.typeId === `minecraft:elder_guardian` ||
            deadEntity.typeId === `minecraft:guardian` ||
            deadEntity.typeId === `minecraft:evocation_illager` ||
            deadEntity.typeId === `minecraft:piglin_brute` ||
            deadEntity.typeId === `minecraft:ravager` ||
            deadEntity.typeId === `minecraft:vindicator` ||
            deadEntity.typeId === `minecraft:wither_skeleton`
        ) {
            const randomXP = numgen(220, 250, 235, 15); //min, max, mean, stddev
            
            addScore("combatXP", player, randomXP);
            addScore("overallXP", killer, randomXP);

            let combatXP = getScore("combatXP", killer)
            let combatLVL = getScore("combatLVL", killer)
            let combatNextLVL = getScore("combatNextLVL", killer) || 100;
            let combatlimitXP = getScore("combatlimitXP", killer) || 100;
            let combatASC = getScore("combatASC", killer)

            txtclr = !txtclr;
            const color = txtclr ? "§e" : "§f";
            system.runTimeout(() => {
                deadEntity.runCommand(`title @s actionbar ${color}Combat +${randomXP}XP`);
            }, 0);

            while (combatXP >= combatlimitXP) {
                combatXP -= combatNextLVL;
                combatLVL++;
                combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
                combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));

                setScore("combatXP", player, combatXP);
                setScore("combatLVL", player, combatLVL);
                setScore("combatNextLVL", player, combatNextLVL);
                setScore("combatlimitXP", player, combatlimitXP);

                system.runTimeout(() => {
                    deadEntity.runCommand(`title "${player.name}" title Combat Leveled up!`);
                }, 0);

                if (combatLVL >= 20 && combatASC < 5) {
                    system.runTimeout(() => {
                        player.runCommand(`title @s title Combat Ascension Ready!`);
                    }, 60);
                    break;
                }
            }
        }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (
            deadEntity.typeId === `minecraft:wither`
        ) {

            addScore("combatXP", player, 1000);
            addScore("overallXP", killer, 1000);

            let combatXP = getScore("combatXP", killer)
            let combatLVL = getScore("combatLVL", killer)
            let combatNextLVL = getScore("combatNextLVL", killer) || 100;
            let combatlimitXP = getScore("combatlimitXP", killer) || 100;
            let combatASC = getScore("combatASC", killer)

            txtclr = !txtclr;
            const color = txtclr ? "§e" : "§f";
            system.runTimeout(() => {
                deadEntity.runCommand(`title @s actionbar ${color}Combat +${randomXP}XP`);
            }, 0);

            while (combatXP >= combatlimitXP) {
                combatXP -= combatNextLVL;
                combatLVL++;
                combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
                combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));

                setScore("combatXP", player, combatXP);
                setScore("combatLVL", player, combatLVL);
                setScore("combatNextLVL", player, combatNextLVL);
                setScore("combatlimitXP", player, combatlimitXP);

                system.runTimeout(() => {
                    deadEntity.runCommand(`title "${player.name}" title Combat Leveled up!`);
                }, 0);

                if (combatLVL >= 20 && combatASC < 5) {
                    system.runTimeout(() => {
                        player.runCommand(`title @s title Combat Ascension Ready!`);
                    }, 60);
                    break;
                }
            }
        }
    

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


        if (
            deadEntity.typeId === `minecraft:warden`
        ) {

            addScore("combatXP", player, 5000);
            addScore("overallXP", killer, 5000);

            let combatXP = getScore("combatXP", killer)
            let combatLVL = getScore("combatLVL", killer)
            let combatNextLVL = getScore("combatNextLVL", killer) || 100;
            let combatlimitXP = getScore("combatlimitXP", killer) || 100;
            let combatASC = getScore("combatASC", killer)

            txtclr = !txtclr;
            const color = txtclr ? "§e" : "§f";
            system.runTimeout(() => {
                deadEntity.runCommand(`title @s actionbar ${color}Combat +${randomXP}XP`);
            }, 0);

            while (combatXP >= combatlimitXP) {
                combatXP -= combatNextLVL;
                combatLVL++;
                combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
                combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));

                setScore("combatXP", player, combatXP);
                setScore("combatLVL", player, combatLVL);
                setScore("combatNextLVL", player, combatNextLVL);
                setScore("combatlimitXP", player, combatlimitXP);

                system.runTimeout(() => {
                    deadEntity.runCommand(`title "${player.name}" title Combat Leveled up!`);
                }, 0);

                if (combatLVL >= 20 && combatASC < 5) {
                    system.runTimeout(() => {
                        player.runCommand(`title @s title Combat Ascension Ready!`);
                    }, 60);
                    break;
                }
            }
        }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (
            deadEntity.typeId === `minecraft:ender_dragon`
        ) {

            addScore("combatXP", player, 50000);
            addScore("overallXP", killer, 50000);

            let combatXP = getScore("combatXP", killer)
            let combatLVL = getScore("combatLVL", killer)
            let combatNextLVL = getScore("combatNextLVL", killer) || 100;
            let combatlimitXP = getScore("combatlimitXP", killer) || 100;
            let combatASC = getScore("combatASC", killer)

            txtclr = !txtclr;
            const color = txtclr ? "§e" : "§f";
            system.runTimeout(() => {
                deadEntity.runCommand(`title @s actionbar ${color}Combat +${randomXP}XP`);
            }, 0);

            while (combatXP >= combatlimitXP) {
                combatXP -= combatNextLVL;
                combatLVL++;
                combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
                combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));

                setScore("combatXP", player, combatXP);
                setScore("combatLVL", player, combatLVL);
                setScore("combatNextLVL", player, combatNextLVL);
                setScore("combatlimitXP", player, combatlimitXP);

                system.runTimeout(() => {
                    deadEntity.runCommand(`title "${player.name}" title Combat Leveled up!`);
                }, 0);

                if (combatLVL >= 20 && combatASC < 5) {
                    system.runTimeout(() => {
                        player.runCommand(`title @s title Combat Ascension Ready!`);
                    }, 60);
                    break;
                }
            }
        }
        mobAttackers.delete(deadEntity);
    }
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