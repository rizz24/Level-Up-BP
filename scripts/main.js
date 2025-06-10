console.warn(' main.js loaded')

import { world, system, ItemStack } from "@minecraft/server"
import "./onjoin/index.js"
import { adminUsernames } from "./onjoin/index.js"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

export function getScore(obj, player, useZero = true) {
    try {
        const objective = world.scoreboard.getObjective(obj);
        return objective.getScore(player.scoreboard);
    } catch {
        return useZero ? 0 : NaN;
    }
}
export function setScore(obj, player, value) {
    try {
        const objective = world.scoreboard.getObjective(obj);
        objective.setScore(player.scoreboard, value);
    } catch {
        player.runCommandAsync(`scoreboard objectives add ${obj} dummy`);
        world.scoreboard.getObjective(obj).setScore(player.scoreboard, value);
    }
}
export function addScore(obj, player, value) {
    setScore(obj, player, getScore(obj, player) + value);
}
export function removeScore(obj, player, value) {
    setScore(obj, player, getScore(obj, player) - value);
}

function ensurePlayerStats(player) {
    if (isNaN(getScore("combatLVL", player, false))) setScore("combatLVL", player, 0);
    if (isNaN(getScore("combatXP", player, false))) setScore("combatXP", player, 0);
    if (isNaN(getScore("combatlimitXP", player, false))) setScore("combatlimitXP", player, 100);
    if (isNaN(getScore("combatNextLVL", player, false))) setScore("combatNextLVL", player, 100);
    if (isNaN(getScore("combatASC", player, false))) setScore("combatASC", player, 0);
}

let txtclr =  false;
let allXP = 0;
let nextXP = 0;

world.beforeEvents.itemUse.subscribe(data => {
    let player = data.source
    let title = "§l§aLeveling Orb"
    if (data.itemStack.typeId == "level_up:level_orb") system.run(() => main(player))
    
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
                .button(`§bShop`)
                .button(`ADMIN CONTROLS`)

            form.show(player).then(r => {
                if (r.selection == 0) Profile(player)
                if (r.selection == 1) Ascension(player)
                if (r.selection == 2) Shop(player)
                if (r.selection == 3) Admin(player)
            })

        } else {
            const form = new ActionFormData()
                .title(title)
                .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
                .button(`§bProfile`)
                .button(`§bAscension`)
                .button(`§bShop`)
            
            form.show(player).then(r => {
                if (r.selection == 0) Profile(player)
                if (r.selection == 1) Ascension(player)
                if (r.selection == 2) Shop(player)
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
        ensurePlayerStats(player);
        let combatLVL = getScore("combatLVL", player);
        let combatXP = getScore("combatXP", player);
        let combatNextLVL = getScore("combatNextLVL", player);
        let combatASC = getScore("combatASC", player);
        let combatRemain = combatNextLVL - combatXP;

        // Check if max ascension
        let maxAsc = combatASC >= 5;

        if (maxAsc) {
            new ActionFormData()
                .title(`§l§bCombat Profile`)
                .body(
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n` +
                    `    §fCombat Level: ` + combatLVL + `\n\n` +
                    `    Combat XP: §lMAXED§r§f\n` +
                    `  \n          ( MAX ASCENSION )\n\n` +
                    `    Combat Ascension: §cMAXED (5)\n\n` +
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
                .button("§l§cBack")
                .show(player).then(r => {
                    if (r.selection == 0) Profile(player)
                    if (r.selection == 1) Profile(player)
                });
        } else if (combatLVL >= 20) {
            new ActionFormData()
                .title(`§l§bCombat Profile`)
                .body(
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n` +
                    `    §fCombat Level: ` + combatLVL + `\n\n` +
                    `    Combat XP: §lFull§r§f\n` +
                    `  \n          ( Ready for Ascension )\n\n` +
                    `    Combat Ascension: ` + combatASC + `\n\n` +
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
                .button("§l§cBack")
                .show(player).then(r => {
                    if (r.selection == 0) Profile(player)
                    if (r.selection == 1) Profile(player)
                });
        } else {
            new ActionFormData()
                .title(`§l§bCombat Profile`)
                .body(
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n` +
                    `    §fCombat Level: ` + combatLVL + `\n\n` +
                    `    Combat XP:\n       ` + combatXP + ` / ` + combatNextLVL +
                    `  \n      ( ` + combatRemain + `XP to go )\n\n` +
                    `    Combat Ascension: ` + combatASC + `\n\n` +
                    `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
                .button("§l§cBack")
                .show(player).then(r => {
                    if (r.selection == 0) Profile(player)
                    if (r.selection == 1) Profile(player)
                });
        }
    }

    function Ascension() {
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

    // function combatP() {
    //     let xp = combatXP
    //     let nxtLvl = combatNextLVL
    //     combatRemain = nxtLvl - xp

    //     if (combatCanAscend === !false) {
    //         new ActionFormData()
    //         .title(`§l§bCombat Profile`)
    //         .body(
    //             `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
    //             `    §fCombat Level: `+ combatLVL +`\n\n`+
    //             `    Combat XP: §lFull§r§f\n` +
    //             `  \n          ( Ready for Ascension )\n\n`+
    //             `    Combat Ascension: `+ combatASC +`\n\n`+
    //             `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
    //             )
    //         .button("§l§cBack")
    //         .show(player).then(r => {
    //             if (r.selection == 0) Profile(player)
    //             if (r.selection == 1) Profile(player)
    //         })
    //     } else {
    //         new ActionFormData()
    //         .title(`§l§bCombat Profile`)
    //         .body(
    //             `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
    //             `    §fCombat Level: `+ combatLVL +`\n\n`+
    //             `    Combat XP:\n       `+ combatXP +` / `+ combatNextLVL +
    //             `  \n      ( `+ combatRemain +`XP to go )\n\n`+
    //             `    Combat Ascension: `+ combatASC +`\n\n`+
    //             `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
    //             )
    //         .button("§l§cBack")
    //         .show(player).then(r => {
    //             if (r.selection == 0) Profile(player)
    //             if (r.selection == 1) Profile(player)
    //         })
    //     }
    // }

})

// - - - - - - - - - - - - - - - - - - - - - - - ^ Menu ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - - v Events v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// world.afterEvents.entityHitEntity.subscribe((mcch) => {
//     const EPSILON = 0.0001;
//     const hitEntity = mcch.hitEntity;
//     if (hitEntity.typeId === `minecraft:zombie`) {

//         combatXP += 0.1;

//         system.runTimeout(() => {
//             hitEntity.runCommand(`title @p actionbar Combat +0.1XP`);
//         }, 0);

//         if (combatXP + EPSILON >= combatlimitXP) {
//             combatXP = combatXP - combatNextLVL;
//             combatLVL++;
//             combatNextLVL ++;
//             combatlimitXP ++;

//             system.runTimeout(() => {
//                 hitEntity.runCommand(`title @p title Combat Leveled up!`);
//             }, 0);
//         }

//     }
// });

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

    for (const player of attackers) {
    
        if (
            deadEntity.typeId === `minecraft:magma_cube` ||
            deadEntity.typeId === `minecraft:slime`
        ) {
            const randomXP = numgen(3, 5, 4, 1); //min, max, mean, stddev

            addScore("combatXP", player, randomXP);

            let combatXP = getScore("combatXP", player);
            let combatLVL = getScore("combatLVL", player);
            let combatNextLVL = getScore("combatNextLVL", player);
            let combatlimitXP = getScore("combatlimitXP", player);
            let combatASC = getScore("combatASC", player);

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

           addScore("combatXP", player, randomXP);

            let combatXP = getScore("combatXP", player);
            let combatLVL = getScore("combatLVL", player);
            let combatNextLVL = getScore("combatNextLVL", player);
            let combatlimitXP = getScore("combatlimitXP", player);
            let combatASC = getScore("combatASC", player);

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

            let combatXP = getScore("combatXP", player);
            let combatLVL = getScore("combatLVL", player);
            let combatNextLVL = getScore("combatNextLVL", player);
            let combatlimitXP = getScore("combatlimitXP", player);
            let combatASC = getScore("combatASC", player);

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

            let combatXP = getScore("combatXP", player);
            let combatLVL = getScore("combatLVL", player);
            let combatNextLVL = getScore("combatNextLVL", player);
            let combatlimitXP = getScore("combatlimitXP", player);
            let combatASC = getScore("combatASC", player);

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

            let combatXP = getScore("combatXP", player);
            let combatLVL = getScore("combatLVL", player);
            let combatNextLVL = getScore("combatNextLVL", player);
            let combatlimitXP = getScore("combatlimitXP", player);
            let combatASC = getScore("combatASC", player);

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

        if (
            deadEntity.typeId === `minecraft:wither`
        ) {

            addScore("combatXP", player, 1000);

            let combatXP = getScore("combatXP", player);
            let combatLVL = getScore("combatLVL", player);
            let combatNextLVL = getScore("combatNextLVL", player);
            let combatlimitXP = getScore("combatlimitXP", player);
            let combatASC = getScore("combatASC", player);

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
    

// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


        if (
            deadEntity.typeId === `minecraft:warden`
        ) {

            addScore("combatXP", player, 5000);

            let combatXP = getScore("combatXP", player);
            let combatLVL = getScore("combatLVL", player);
            let combatNextLVL = getScore("combatNextLVL", player);
            let combatlimitXP = getScore("combatlimitXP", player);
            let combatASC = getScore("combatASC", player);

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

// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (
            deadEntity.typeId === `minecraft:ender_dragon`
        ) {

            addScore("combatXP", player, 50000);

            let combatXP = getScore("combatXP", player);
            let combatLVL = getScore("combatLVL", player);
            let combatNextLVL = getScore("combatNextLVL", player);
            let combatlimitXP = getScore("combatlimitXP", player);
            let combatASC = getScore("combatASC", player);

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

// - - - - - - - - - - - - - - - - - - - - - - - v Rank CMD v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // if (message === `rank`) {
    //     system.runTimeout(() => {
    //         player.runCommand(`tag @s add "openmenu:main"`);
    //     }, 0);
    // }

    // function isAdmin(username) {
    //     return adminUsernames.includes(username);
    // }

    // function main() {

    //     if (isAdmin(player.name)) {
    //         const form = new ActionFormData()
    //             .title(`ADMIN CONTROLS`)
    //             .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
    //             .button(`§bProfile`)
    //             .button(`§bMoney`)
    //             .button(`§bShop`)
    //             .button(`ADMIN CONTROLS`)

    //         form.show(player).then(r => {
    //             if (r.selection == 0) Profile(player)
    //             if (r.selection == 1) Money(player)
    //             if (r.selection == 2) Shop(player)
    //             if (r.selection == 3) Admin(player)
    //         })

    //     } else {
    //         const form = new ActionFormData()
    //             .title(title)
    //             .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
    //             .button(`§bProfile`)
    //             .button(`§bMoney`)
    //             .button(`§bShop`)
            
    //         form.show(player).then(r => {
    //             if (r.selection == 0) Profile(player)
    //             if (r.selection == 1) Money(player)
    //             if (r.selection == 2) Shop(player)
    //         })
    //     }
    // }

    // system.runInterval(() => {
    // for (let player of world .getPlayers()) {
    //     if (player.hasTag("openmenu:main")) {
    //         system.run(() => {
    //             main();
    //             player.runCommand(`tag @s remove "openmenu:main"`);
    //         });
    //     }
    // }
    // }, 20);

// - - - - - - - - - - - - - - - - - - - - - - - ^ Rank CMD ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if (message === `help`) {
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `\n§a- - - - - - - - - - - §fHelp (1) §a- - - - - - - - - - - -\n`+
                `§f r!help - shows this help\n`+
                `§f r!start - gives you the RPG Menu Book\n`+
                `§f r!bal - shows overall leaderboard\n\n`+
                `"}]}`);
        }, 0);
    }

    if (message === `start`) {
        mcch.cancel = true;
        system.runTimeout(() => {
        if (player.hasTag("has_started")) {
            player.sendMessage("You already did that. Sorry.");
        } else {
            const item = new ItemStack("level_up:level_orb", 1);
            const inventory = player.getComponent("minecraft:inventory").container;
            inventory.addItem(item);
            player.addTag("has_started");
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
            `Welcome ${player.nameTag}! Type 'r!help' for guide!`+
            `"}]}`);
        }
        }, 0);
    }

    // if (message === `1`) {
    //     combatXP = combatXP + combatNextLVL;
    //     nextXP = combatXP;
    //     allXP += nextXP;
    //     while (combatXP >= combatlimitXP) {
    //     combatXP = combatXP - combatNextLVL;
    //     combatLVL++;
    //     combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
    //     combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
    //     }
    //     mcch.cancel = true;
    //     system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `+1 CombatLevel (${combatLVL})\nAll XP: ${allXP}\nNext Level XP: ${combatNextLVL}\n\n`+
    //             `"}]}`);
    //     }, 0);
    // }

    // if (message === `full`) {
    //     combatXP = 22875;

    //     if (combatLVL >= 20 && !ascended) {
    //     system.runTimeout(() => {
    //         deadEntity.runCommand(`title @p actionbar §cCombat Level Cap Reached! Ascend to continue.`);
    //     }, 0);
    //     return; // stop further XP processing
    // }

    //     allXP = combatXP;
    //     while (combatXP >= combatlimitXP) {
    //     combatXP = combatXP - combatNextLVL;
    //     combatLVL++;
    //     combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
    //     combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
    //     }
    //     mcch.cancel = true;
    //     system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `+1 CombatLevel (${combatLVL})\nAll XP: ${allXP}\nNext Level XP: ${combatNextLVL}\n\n`+
    //             `"}]}`);
    //     }, 0);
    // }

    // if (message === `up`) {
    //     mcch.cancel = true;

    //     combatASC++;
    //     switch (combatASC) {
    //         case 1:
    //             CombatAscended = true;
    //             break;
    //         case 2:
    //             CombatAscended2 = true;
    //             break;
    //         case 3:
    //             CombatAscended3 = true;
    //             break;
    //         case 4:
    //             CombatAscended4 = true;
    //             break;
    //         case 5:
    //             CombatAscended5 = true;
    //             break;
    //     }

    //     combatLVL = 0;
    //     combatXP = 0;
    //     combatlimitXP = 100;
    //     combatNextLVL = 100;
    //     combatRemain = 0;

    //     system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `Added 1 to Combat Ascension`+
    //             `"}]}`);
    //     }, 0);

    //     combatCanAscend = false;
    // }

    // if (message === `asc`) {
    //     mcch.cancel = true;
    //     if (CombatAscended === !false) {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `\n1 = true`+
    //             `"}]}`);
    //         }, 0);
    //     } else {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `\n1 = false`+
    //             `"}]}`);
    //         }, 0);
    //     }

    //     if (CombatAscended2 === !false) {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `2 = true`+
    //             `"}]}`);
    //         }, 0);
    //     } else {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `2 = false`+
    //             `"}]}`);
    //         }, 0);
    //     }

    //     if (CombatAscended3 === !false) {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `3 = true`+
    //             `"}]}`);
    //         }, 0);
    //     } else {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `3 = false`+
    //             `"}]}`);
    //         }, 0);
    //     }

    //     if (CombatAscended4 === !false) {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `4 = true`+
    //             `"}]}`);
    //         }, 0);
    //     } else {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `4 = false`+
    //             `"}]}`);
    //         }, 0);
    //     }

    //     if (CombatAscended5 === !false) {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `5 = true`+
    //             `"}]}`);
    //         }, 0);
    //     } else {
    //         system.runTimeout(() => {
    //         player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
    //             `5 = false`+
    //             `"}]}`);
    //         }, 0);
    //     }
    // }

    // if (message === `lb`) {
    //     mcch.cancel = true;
    //     system.runTimeout(() => {
    //         player.runCommand(`tellraw @p {"rawtext":[{"text":"`+
    //             `\n§a- - - - - - - - - §fLeaderboard §a- - - - - - - - - - -\n`+
    //             `§f|   Rank   |             Name              |        Level      |\n`+
    //             `§a- - - - - - - - - - - - - - - - - - - - - - - - - - -\n`+
    //             `§f|    01    |             Name              |        Level      |\n`+
    //             `§f|    02    |             Name              |        Level      |\n`+
    //             `§f|    03    |             Name              |        Level      |\n`+
    //             `§f|    04    |             Name              |        Level      |\n`+
    //             `§f|    05    |             Name              |        Level      |\n`+
    //             `§a- - - - - - - - - - - - - - - - - - - - - - - - - - -\n\n`+
    //             `"}]}`);
    //     }, 0);
    // }

    // if (message === `rpg cp`) {
    //     system.runTimeout(() => {
    //         player.runCommand(`tellraw @p {"rawtext":[{"text":"`+
    //             `§a- - - - - - - - - - - - - - - - - - -\n`+
    //             `    §fCombat Level: `+ combatLVL +`\n`+
    //             `    Combat XP: `+ combatXP +`\n`+
    //             `    Combat Ascension: `+ combatASC +`\n`+
    //             `§a- - - - - - - - - - - - - - - - - - -\n`+
    //             `"}]}`);
    //     }, 0);
    // }

});