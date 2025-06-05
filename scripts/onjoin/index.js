import { world } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui"
import { wait } from "../functions/index.js"

export const adminUsernames = [
    //List all the nametags here if you want someone to be added as an admin
    "Rizu4K",
    "",
];

world.afterEvents.playerSpawn.subscribe(async ({ player, initialSpawn }) => {
    if (!initialSpawn) return
    await wait(60)
    JoinForm(player)
})

function JoinForm(player) {
    new ActionFormData()
        .title(`hello`)
        .body(`sample text`)
        .button(`§cClose`)
        .show(player).then(({ selection, canceled }) => {
            if (canceled) return JoinForm(player);
            switch (selection) {
                case 0:
                    player.sendMessage(`Thank you`);
                    break;
            }
        });
}