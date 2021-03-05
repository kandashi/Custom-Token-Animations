class CTA {

    static canvasTweens = []

    static ready() {
        Hooks.on("canvasInit", async () => {
            CTA.canvasTweens.forEach(t => t.kill())
            CTA.canvasTweens = []
            Hooks.once("canvasPan", () => {
                CTA.AddTweens()
            })
        });
        Hooks.on("preDeleteToken", (scene, token) => {
            let deleteToken = canvas.tokens.get(token._id)
            TweenMax.killTweensOf(deleteToken.children)
        });
        Hooks.on("createToken", (scene, token) => {
            let tokenInstance = canvas.tokens.get(token._id)
            let flags = tokenInstance.getFlag("Custom-Token-Animations", "anim") ? tokenInstance.getFlag("Custom-Token-Animations", "anim") : []
            if (flags) CTA.AddTweens(tokenInstance)
        });
    }


    static async addAnimation(token, texture, scale, speed, pushToken, pushActor, name, multiple) {
        let CTAtexture = await loadTexture(texture)
        const textureSize = token.data.height * canvas.grid.size;
        CTAtexture.orig = { height: textureSize * scale, width: textureSize * scale, x: (textureSize) / 2, y: (textureSize) / 2 }

        for (i = 0; i <= multiple - 1; i++) {
            let sprite = new PIXI.Sprite(CTAtexture)
            sprite.anchor.set(0.5)
            sprite.pivot.set(textureSize / 2)
            sprite.position.set(textureSize / 2)
            var i;
            let icon = await token.addChild(sprite)
            await icon.position.set(token.data.height * canvas.grid.size / 2)
            const source = getProperty(icon._texture, "baseTexture.resource.source")
            if (source && (source.tagName === "VIDEO")) {
                source.loop = true;
                source.muted = true;
                game.video.play(source);
            }
            icon.CTA = true
            let delay = i * (speed / multiple)
            let tween = TweenMax.to(icon, speed, { angle: 360, repeat: -1, ease: Linear.easeNone, delay: delay });
            CTA.canvasTweens.push(tween)
        }


        if (pushToken) {
            let flags = token.getFlag("Custom-Token-Animations", "anim") ? token.getFlag("Custom-Token-Animations", "anim") : []
            flags.push({
                name: name !== undefined ? name : flags.length,
                texture: texture,
                scale: scale,
                speed: speed,
                multiple: multiple,
                id: randomID()
            })
            await token.setFlag("Custom-Token-Animations", "anim", flags)
        }
        if (pushActor) {
            let flags = getProperty(token, "actor.data.token.flags.Custom-Token-Animations.anim") ? getProperty(token, "actor.data.token.flags.Custom-Token-Animations.anim") : []
            flags.push({
                name: name !== undefined ? name : flags.length,
                texture: texture,
                scale: scale,
                speed: speed,
                multiple: multiple,
                id: randomID()
            })
            await token.actor.update({ "token.flags.Custom-Token-Animations.anim": flags })
        }
    }



    static AddTweens(token) {
        let testArray = []
        if (token) testArray.push(token)
        else testArray = canvas.tokens.placeables
        for (let testToken of testArray) {
            let flag = testToken.getFlag("Custom-Token-Animations", "anim")
            if (!flag) continue;
            flag.forEach(f => CTA.addAnimation(testToken, f.texture, f.scale, f.speed, false, false, f.name, f.multiple))
        }
    }


    static animationDialog(OGpath, token) {
        if (canvas.tokens.controlled > 1 && !token) {
            ui.notifications.error("Please select only one token");
            return;
        }
        function shortLeft(string, boxLength) {
            let PREFIXDIRSTR = "...";
            boxLength += PREFIXDIRSTR.length;
            let splitString = string.substring(((string.length - 1) - boxLength), (string.length));
            splitString = PREFIXDIRSTR + splitString;
            return splitString;
        }

        if (!token) token = canvas.tokens.controlled[0]
        new Dialog({
            title: "Pick Animation Effects",
            content: `
        <form>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
                    <label for="name">Name: </label>
                    <input id="name" name="name" type="text"></input>
            </div>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
                    <label for="path">Image Path: </label>
                    <input id="path" name="path" type="text" value= "${shortLeft(OGpath, 20)}"></input>
            </div>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
                    <label for="scale">Scale: </label>
                    <input id="scale" name="scale" type="number" step="0.1"></input>
            </div>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
                    <label for="speed">Speed of rotation: </label>
                    <input id="speed" name="speed" type="number" step="0.1" placeholder="seconds per rotation"></input>
            </div>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
            <label for="pushToken">Permenant on Token?: </label>
            <input id="pushToken" name="pushToken" type="checkbox" ></input>
            </div>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
            <label for="pushActor">Permenant on Actor?: </label>
            <input id="pushActor" name="pushActor" type="checkbox" ></input>
        </div>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
            <label for="multiple">Nubmer of Copies: </label>
            <input id="multiple" name="multiple" type="number" min="1"</input>
    </div>
`,
            buttons: {
                one: {
                    label: "Create",
                    callback: (html) => {
                        let path = OGpath ? OGpath : html.find("#path")[0].value
                        let name = html.find("#name")[0].value
                        let scale = Number(html.find("#scale")[0].value)
                        let speed = Number(html.find("#speed")[0].value)
                        let pushToken = html.find("#pushToken")[0].value === "on" ? true : false
                        let pushActor = html.find("#pushActor")[0].value === "on" ? true : false
                        let multiple = parseInt(html.find("#multiple")[0].value)
                        CTA.addAnimation(token, path, scale, speed, pushToken, pushActor, name, multiple)
                    }
                }
            }
        }).render(true)
    }


    static pickEffect(token) {
        let CTAPick = new FilePicker({
            type: "imagevideo",
            current: "",
            callback: path => {
                CTA.animationDialog(path, token)
            },

        })
        CTAPick.browse();
    }


    static async updateEffect(token, name, key, value) {
        let anims = await token.getFlag("Custom-Token-Animations", "anim")
        for (let i of anims) {
            if (i.name === name) {
                i[key] = value;
                break;
            }
        }
        await token.setFlag("Custom-Token-Animations", "anim", anims)
        CTA.resetTweens(token)
    }

    static async resetTweens(token) {
        let CTAtweens = token.children.filter(c => c.CTA === true)
        for (let child of CTAtweens) {
            TweenMax.killTweensOf(child)
            child.destroy()
        }

        let flag = token.getFlag("Custom-Token-Animations", "anim")
        if (!flag) return;
        flag.forEach(f => CTA.addAnimation(token, f.texture, f.scale, f.speed, false, f.name, f.multiple))
    }

    static async incrementDialog(token, animId) {
        let anims = await token.getFlag("Custom-Token-Animations", "anim")
        let anim = anims.find(p => p.id === animId)
        new Dialog({
            title: `Increment ${anim.name}`,
            content: `
            <div class="form-group">
                    <label for="value">Amount to increment: </label>
                    <input id="value" name="value" type="number" placeholder="+/- value"></input>
            </div>
            `,
            buttons: {
                one: {
                    title: "Confirm",
                    icon: `<i class="fas fa-check"></i>`,
                    callback: (html) => {
                        let value = html.find("#value")[0].value
                        CTA.incrementEffect(token, animId, value)
                    }
                },
                two: {
                    title: "Cancel",
                    icon: `<i class="fas fa-undo-alt"></i>`,
                }
            }
        }).render(true)
    }

    static async incrementEffect(token, animId, value) {
        let anims = await token.getFlag("Custom-Token-Animations", "anim")
        let updateAnim = anims.find(i => i.id === animId)
        let updateValue = parseInt(updateAnim.multiple) + parseInt(value)
        updateAnim.multiple = updateValue;
        await token.setFlag("Custom-Token-Animations", "anim", anims)
        CTA.resetTweens(token)
    }
    static getSceneControlButtons(buttons) {
        let tokenButton = buttons.find(b => b.name == "token")

        if (tokenButton) {
            tokenButton.tools.push({
                name: "cta-anim",
                title: "Add Animation",
                icon: "fas fa-spinner",
                visible: game.user.isGM,
                onClick: () => CTA.getAnims(),
                button: true
            });
        }
    }

    static async removeAnim(token, animId, actorRemoval) {
        let anims = await token.getFlag("Custom-Token-Animations", "anim")
        let removeAnim = anims.findIndex(i => i.id === animId)
        anims.splice(removeAnim, 1)
        if (actorRemoval) await token.actor.update({ "token.flags.Custom-Token-Animations.anim": anims })
        await token.setFlag("Custom-Token-Animations", "anim", anims)
        CTA.resetTweens(token)
    }

    static async getAnims(token) {
        if (canvas.tokens.controlled.length !== 1) { ui.notifications.notify("Please select one token"); return; }
        if (!token) token = canvas.tokens.controlled[0]
        let anims = await token.getFlag("Custom-Token-Animations", "anim")
        let content = ``;
        let allButtons = {
            one: {
                label: "Update",
                icon: `<i class="fas fa-edit"></i>`,
                callback: (html) => {
                    let updateAnim = html.find("[name=anims]")[0].value;
                    CTA.incrementDialog(token, updateAnim)
                }
            },
            two: {
                label: "Delete",
                icon: `<i class="fas fa-trash-alt"></i>`,
                callback: (html) => {
                    let updateAnim = html.find("[name=anims]")[0].value;

                    new Dialog({
                        title: "Conformation",
                        content: `Are you sure you want to remove this animation`,
                        buttons: {
                            one: {
                                label: "Delete from Actor",
                                icon: `<i class="fas fa-check"></i>`,
                                callback: () => {
                                    CTA.removeAnim(token, updateAnim, true)
                                }
                            },
                            two: {
                                label: "Delete from Token",
                                icon: `<i class="fas fa-check"></i>`,
                                callback: () => {
                                    CTA.removeAnim(token, updateAnim, false)
                                }
                            },
                            three: {
                                label: "Return",
                                icon: `<i class="fas fa-undo-alt"></i>`,
                                callback: () => {
                                    CTA.getAnims(token)
                                }
                            }
                        }
                    }).render(true)
                }
            },
            three: {
                label: "Add New",
                icon: `<i class="fas fa-plus"></i>`,
                callback: () => {
                    CTA.pickEffect(token)
                }
            }
        }
        let addButton = {
            one: {
                label: "Add New",
                icon: `<i class="fas fa-plus"></i>`,
                callback: () => {
                    CTA.pickEffect(token)
                }
            }
        }
        if (anims && anims !== []) {
            content = `<div class="form group">
                            <label> Animations: </label>
                            <div><select name="anims">${anims.reduce((acc, anim) => acc += `<option value = ${anim.id}>${anim.name}</option>`, '')}</select></div>
                        </div>`;
            addButton = allButtons
        };
        new Dialog({
            title: "CTA Animation Picker",
            content: content,
            buttons: addButton
        }).render(true)
    }
}

Hooks.on('init', CTA.ready);
Hooks.on('getSceneControlButtons', CTA.getSceneControlButtons)