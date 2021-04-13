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
            if (!deleteToken) return;
            TweenMax.killTweensOf(deleteToken.children)
        });
        Hooks.on("createToken", (scene, token) => {
            let tokenInstance = canvas.tokens.get(token._id)
            if (!tokenInstance) return;
            let flags = tokenInstance.getFlag("Custom-Token-Animations", "anim") ? tokenInstance.getFlag("Custom-Token-Animations", "anim") : []
            if (flags) CTA.AddTweens(tokenInstance)
        });
        Hooks.on("preUpdateToken", async (_scene, token, update) => {
            if ("height" in update || "width" in update) {
                let fullToken = canvas.tokens.get(token._id)
                let CTAtweens = fullToken.children.filter(c => c.CTA === true)
                for (let child of CTAtweens) {
                    TweenMax.killTweensOf(child)
                    child.destroy()
                }
            }
        })
        Hooks.on("updateToken", (_scene, token, update) => {
            if ("height" in update || "width" in update) {
                let fullToken = canvas.tokens.get(token._id)
                CTA.resetTweens(fullToken, false)
            }
        })
    }


    /**
     * 
     * @param {Object} token token to affect
     * @param {Object} textureData data of the effect to add
     * @param {Boolean} pushToken permanent effect on the token, persists through refresh if true
     * @param {Boolean} pushActor permanent effect on the actors token, persists through re-placing actor
     * @param {String} name name of the effect, unique per actor/token
     * @param {Boolean} update replace effect by name
     * @param {String} id id of the flag
     */
    static async addAnimation(token, textureData, pushToken, pushActor, name, update, oldID) {
        let { texturePath, scale, speed, multiple, rotation, xScale, yScale, belowToken, radius, opacity, tint, equip } = textureData
        let newID = oldID || randomID()
        let CTAtexture = await loadTexture(texturePath)
        const textureSize = token.data.height * canvas.grid.size;
        var i, container;
        if (typeof scale === "number") {
            scale = [`${scale}`, `${scale}`];
        }
        else {
            scale = scale.split(",")
            if (scale.length === 1) scale[1] = scale[0]
        }
        if (equip) {
            container = token.children.find(i => i.isSprite && i.texture.baseTexture?.imageUrl?.includes(token.data.img))
            container.CTAcontainer = true
            CTAtexture.orig = { height: textureSize * parseFloat(scale[1]) / container.scale.x, width: textureSize * parseFloat(scale[0]) / container.scale.y, x: -textureSize, y: -textureSize }
        }
        else {
            container = token
            CTAtexture.orig = { height: textureSize * parseFloat(scale[1]), width: textureSize * parseFloat(scale[0]), x: -textureSize, y: -textureSize }
        }
        if (rotation === "rotation" && !update) {
            token.sortableChildren = true
            for (i = 0; i <= multiple - 1; i++) {
                let sprite = new PIXI.Sprite(CTAtexture)
                //sprite.anchor.set(0.5)
                sprite.anchor.set(radius)
                sprite.pivot.set(textureSize / 2)
                sprite.position.set(textureSize / 2)
                let icon = await token.addChild(sprite)
                await icon.position.set(token.data.width * canvas.grid.w * xScale, token.data.height * canvas.grid.h * yScale)
                const source = getProperty(icon._texture, "baseTexture.resource.source")
                if (source && (source.tagName === "VIDEO")) {
                    source.loop = true;
                    source.muted = true;
                    game.video.play(source);
                }
                icon.CTA = true;
                icon.CTAid = newID
                icon.alpha = opacity;
                icon.tint = tint;
                if (belowToken) icon.zIndex = -1
                icon.angle = i * (360 / multiple)
                let tween = TweenMax.to(icon, speed, { angle: (360 + icon.angle), repeat: -1, ease: Linear.easeNone });
                CTA.canvasTweens.push(tween)

            }
        }
        if (rotation === "static" && !update) {
            token.sortableChildren = true
            let sprite = new PIXI.Sprite(CTAtexture)
            sprite.anchor.set(0.5)
            let icon = await container.addChild(sprite)
            if (!equip) {
                await icon.position.set(token.data.width * canvas.grid.w * xScale, token.data.height * canvas.grid.h * yScale)
            } else {
                let xPos = container.texture.width * xScale - (container.texture.width / 2)
                let yPos = container.texture.height * yScale - (container.texture.height / 2)
                await icon.position.set(xPos, yPos)
            }
            const source = getProperty(icon._texture, "baseTexture.resource.source")
            if (source && (source.tagName === "VIDEO")) {
                source.loop = true;
                source.muted = true;
                game.video.play(source);
            }
            icon.CTA = true
            icon.CTAid = newID
            icon.alpha = opacity;
            icon.tint = tint;
            icon.angle = token.data.rotation
            if (belowToken) icon.zIndex = -1
        }

        if (pushToken) {
            //let flags = token.getFlag("Custom-Token-Animations", "anim") ? token.getFlag("Custom-Token-Animations", "anim") : []
            let flagData = token.getFlag("Custom-Token-Animations", "anim") || []
            let flags = Array.from(flagData)
            let duplicate = flags.find(i => i.name === name)
            if (duplicate) {
                let index = flags.indexOf(duplicate)
                if (index > -1) {
                    flags.splice(index, 1)
                }
            }
            flags.push({
                name: name !== undefined ? name : flags.length,
                textureData: textureData,
                id: newID
            })
            await token.setFlag("Custom-Token-Animations", "anim", flags)
        }
        if (pushActor) {
            let flagData = getProperty(token, "actor.data.token.flags.Custom-Token-Animations.anim") || []
            let flags = Array.from(flagData)
            let duplicate = flags.find(i => i.name === name)
            if (duplicate) {
                let index = flags.indexOf(duplicate)
                if (index > -1) {
                    flags.splice(index, 1)
                }
            }
            flags.push({
                name: name !== undefined ? name : flags.length,
                textureData: textureData,
                id: newID
            })
            await token.actor.update({ "token.flags.Custom-Token-Animations.anim": flags })
        }
        if (update) CTA.resetTweens(token,false )

        if (this.isSocket) return;
        let socketData = {
            method: "apply",
            sceneId: canvas.scene.id,
            tokenId: token.id
        }
        game.socket.emit('module.Custom-Token-Animations', socketData)
    }


    /**
     * Add effects from token flags
     * @param {Object} token token to add to
     */
    static AddTweens(token) {
        let testArray = []
        if (token) testArray.push(token)
        else testArray = canvas.tokens.placeables
        for (let testToken of testArray) {
            let flag = testToken.getFlag("Custom-Token-Animations", "anim")
            if (!flag) continue;
            flag.forEach(f => {
                CTA.addAnimation(testToken, f.textureData, false, false, f.name, false, f.id)
            })
        }
    }

    /**
     * 
     * @param {String} OGpath original texture path
     * @param {Object} token Token to apply to
     * @param {Object} oldData Previous effect data, used in update pathway
     * @param {String} name name of the effect
     * @returns 
     */
    static async animationDialog(OGpath, token, oldData, name) {
        if (canvas.tokens.controlled > 1 && !token) {
            ui.notifications.error("Please select only one token");
            return;
        }
        if (!OGpath) OGpath = oldData.texturePath
        function shortLeft(string, boxLength) {
            let PREFIXDIRSTR = "...";
            boxLength += PREFIXDIRSTR.length;
            let splitString = string.substring(((string.length - 1) - boxLength), (string.length));
            splitString = PREFIXDIRSTR + splitString;
            return splitString;
        }
        let actorFlags = getProperty(token, "actor.data.token.flags.Custom-Token-Animations.anim") || []
        let animFlag = !!actorFlags.find(i => i.name === name)
        if (!token) token = canvas.tokens.controlled[0]
        let hexColour = oldData?.tint?.toString(16).padStart(6, '0').toUpperCase() || "FFFFFF"
        let oldX = typeof oldData?.xScale === "number" ? oldData.xScale : 0.5
        let oldY = typeof oldData?.yScale === "number" ? oldData.yScale : 0.5


        let dialog = await new Dialog({

            title: "Pick Animation Effects",
            content: `
            <style> 
            .pickDialog .form-group {
                clear: both;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                margin: 3px 0;
                align-items: center;
            }
            .pickDialog label span {
                display: block;
            }

            </style>
        <form class="pickDialog">
        <div class="form-group">
                    <label for="name">Name: </label>
                    <input id="name" name="name" type="text" value= "${name || ""}"></input>
            </div>
        <div class="form-group">
                    <label for="path">Image Path: </label>
                    <input id="path" name="path" type="text" value= "${shortLeft(OGpath, 20)}" required></input>
            </div>
        <div class="form-group">
                    <label for="scale"><span>Scale:</span>
                    <span class="units">(compared to token)</span></label>
                    <input id="scale" name="scale" type="text" value= "${oldData?.scale || "1"}" required></input>
            </div>
        <div class="form-group">
            <label for="rotation">Static Image: </label>
            <input id="rotation" name="rotation" type="checkbox" ${oldData?.rotation === "static" ? 'checked' : ''} ></input>
            </div>
        <div class="form-group">
                    <label for="speed"><span>Speed of rotation: </span>
                     <span class="units">(seconds per rotation)</span>
                     </label>
                    <input id="speed" name="speed" type="number" step="0.1" value= "${oldData?.speed || 0}" ${oldData?.rotation === "static" ? 'disabled' : ''}></input>
            </div>
        <div class="form-group">
                    <label for="radius"><span>Radius of Rotation:</span>
                    <span class="units">(per token width)</span> </label>
                    <input id="radius" name="radius" type="number" step="0.1"  value= "${oldData?.radius / 2 || 1}" ${oldData?.rotation === "static" ? 'disabled' : ''}></input>
        </div>
        <div class="form-group">
            <label for="multiple">Number of Copies: </label>
            <input id="multiple" name="multiple" type="number" min="1" value= "${oldData?.multiple || 1}" ${oldData?.rotation === "static" ? 'disabled' : ''}></input>
            </div>
        <div class="form-group">
            <label for="xScale">Position on X scale: </label>
            <input id="xScale" name="xScale" type="number" placeholder="0 for far left, 1 for far right" value= "${oldX}" required></input>
        </div>
        <div class="form-group">
            <label for="yScale">Position on Y scale: </label>
            <input id="yScale" name="yScale" type="number" placeholder="0 for top, 1 for bottom" value= "${oldY}" required></input>
        </div>
        <div class="form-group">
            <label for="opacity">Opacity: </label>
            <input id="opacity" name="opacity" type="number" min="0" max="1" value= "${oldData?.opacity || 1}" required></input>
        </div>
        <div class="form-group">
                <label for="tint">Asset Tint: </label>
                <input type="color" id="tint" name="tint" value="#${hexColour || "FFFFFF"}">
            </div>
        <div class="form-group">
            <label for="belowToken">Render below Token: </label>
            <input id="belowToken" name="belowToken" type="checkbox" ${oldData?.belowToken === true ? 'checked' : ''}></input>
        </div>
        <div class="form-group">
            <label for="pushActor">Permanent on Actor: </label>
            <input id="pushActor" name="pushActor" type="checkbox" ${animFlag === true ? 'checked' : ''}></input>
        </div>
        <div class="form-group">
            <label for="equip">Apply as Equipment: </label>
            <input id="equip" name="equip" type="checkbox" ${oldData?.equip === true ? 'checked' : ''}></input>
        </div>
        
`,
            buttons: {
                one: {
                    label: "Create",
                    callback: (html) => {
                        let path = OGpath ? OGpath : html.find("#path")[0].value
                        let name = html.find("#name")[0].value
                        let scale = html.find("#scale")[0].value
                        let speed = Number(html.find("#speed")[0].value)
                        let rotation = html.find("#rotation")[0].checked ? "static" : "rotation"
                        let pushActor = html.find("#pushActor")[0].checked
                        let multiple = Number(html.find("#multiple")[0].value)
                        let xScale = Number(html.find("#xScale")[0].value)
                        let yScale = Number(html.find("#yScale")[0].value)
                        let opacity = Number(html.find("#opacity")[0].value)
                        let tint = parseInt(html.find("#tint")[0].value.substr(1), 16)
                        let belowToken = html.find("#belowToken")[0].checked
                        let radius = Number(html.find("#radius")[0].value) * 2
                        let equip = html.find("#equip")[0].checked
                        let textureData = {
                            texturePath: path,
                            scale: scale,
                            speed: speed,
                            multiple: multiple,
                            rotation: rotation,
                            xScale: xScale,
                            yScale: yScale,
                            opacity: opacity,
                            tint: tint,
                            belowToken: belowToken,
                            radius: radius,
                            equip: equip
                        }
                        CTA.addAnimation(token, textureData, true, pushActor, name, true, null)
                    }
                }
            }
        })._render(true)


        $('.form-group #rotation').change(function () {
            if ($(this).is(':checked')) {
                $('.pickDialog #multiple')[0].disabled = true
                $('.pickDialog #speed')[0].disabled = true
                $('.pickDialog #radius')[0].disabled = true
            }
            else {
                $('.pickDialog #multiple')[0].disabled = false
                $('.pickDialog #speed')[0].disabled = false
                $('.pickDialog #radius')[0].disabled = true
            }
        })

    }


    /**
     * Start the "full pathway"
     * @param {Object} token Token to apply too
     */
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

    /**
     * Deprecated
     */
    static async updateEffect(token, name, key, value) {
        let anims = await token.getFlag("Custom-Token-Animations", "anim")
        for (let i of anims) {
            if (i.name === name) {
                i[key] = value;
                break;
            }
        }
        await token.setFlag("Custom-Token-Animations", "anim", anims)
        CTA.resetTweens(token, false)
    }

    /**
     * Refreshes any tweens/effects on a give token, prevents spam messages
     * @param {Object} token Token to update
     * @returns 
     */
    static async resetTweens(token, isSocket) {
        this.isSocket = isSocket
        let CTAtweens = token.children?.filter(c => c.CTA === true)
        let equipTweens = token.children.find(c => c.CTAcontainer)?.children || []
        CTAtweens = CTAtweens.concat(equipTweens)
        for (let child of CTAtweens) {
            TweenMax.killTweensOf(child)
            child.destroy()
        }

        let flag = token.getFlag("Custom-Token-Animations", "anim")
        if (!flag) return;
        flag.forEach(f => {
            CTA.addAnimation(token, f.textureData, false, false, f.name, false, f.id)
        })
    }

    /**
     * Create a macro from selected effect data
     * @param {Object} oldData Data to transform into a macro
     */
    static generateMacro(oldData) {
        let data = duplicate(oldData)
        let image = data.textureData.texturePath.includes(".webm") ? "icons/svg/acid.svg" : data.textureData.texturePath
        let macroData = {
            command: `
            let textureData = {
                texturePath: "${data.textureData.texturePath}",
                scale: "${data.textureData.scale}",
                speed: ${data.textureData.speed},
                multiple: ${data.textureData.multiple},
                rotation: "${data.textureData.rotation}",
                xScale: ${data.textureData.xScale},
                yScale: ${data.textureData.yScale},
                belowToken: ${data.textureData.belowToken},
                radius: ${data.textureData.radius},
                opacity: ${data.textureData.opacity},
                tint: ${data.textureData.tint},
                equip: ${data.textureData.equip}
            }
            CTA.addAnimation(token, textureData, true, false, "${data.name}", false, null)
            `,
            img: image,
            name: `CTA ${data.name}`,
            scope: "global",
            type: "script"
        }
        Macro.create(macroData)
    }


    /**
     * Deprecated
     */
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

    /**
    * Deprecated
    */
    static async incrementEffect(token, animId, value) {
        let anims = await token.getFlag("Custom-Token-Animations", "anim")
        let updateAnim = anims.find(i => i.id === animId)
        let updateValue = parseInt(updateAnim.multiple) + parseInt(value)
        updateAnim.multiple = updateValue;
        await token.setFlag("Custom-Token-Animations", "anim", anims)
        CTA.resetTweens(token, false)
    }

    // Add button to sidebar
    static getSceneControlButtons(buttons) {
        let tokenButton = buttons.find(b => b.name == "token")
        let playerPermissions = game.settings.get("Custom-Token-Animations", "playerPermissions") === true ? true : game.user.isGM
        if (tokenButton) {
            tokenButton.tools.push({
                name: "cta-anim",
                title: "Add Animation",
                icon: "fas fa-spinner",
                visible: playerPermissions,
                onClick: () => CTA.getAnims(),
                button: true
            });
        }
    }

    /**
     * Remove an effect from selected token
     * @param {Object} token Token to act upon
     * @param {String} animId Id of the effect to remove
     * @param {Boolean} actorRemoval Remove from prototype token
     *      * @param {Boolean} fadeOut optional fade out
     */
    static async removeAnim(token, animId, actorRemoval, fadeOut) {
        let anims = await duplicate(token.getFlag("Custom-Token-Animations", "anim"))
        let removeAnim = anims.findIndex(i => i.id === animId)
        let oldAnim = anims.splice(removeAnim, 1)
        let icon = token.children.find(c => c.CTAid = oldAnim[0].id)
        let fade = fadeOut || game.settings.get("Custom-Token-Animations", "fadeOut")
        if (fade) {
            TweenMax.to(icon, 2, { alpha: 0, onComplete: CTA._FinalRemoval, onCompleteParams: [token, actorRemoval, anims]})
        }
        else { CTA._FinalRemoval(token, actorRemoval, anims) }

    }

    /**
     * 
     * @param {Object} token token to remove from
     * @param {String} animName name of animation to remove
     * @param {Boolean} actorRemoval remove from actor
     * @param {Boolean} fadeOut optional fade out
     */
    static async removeAnimByName(token, animName, actorRemoval, fadeOut) {
        let anims = await duplicate(token.getFlag("Custom-Token-Animations", "anim"))
        let removeAnim = anims.findIndex(i => i.name === animName)
        let oldAnim = anims.splice(removeAnim, 1)
        let icon = token.children.find(c => c.CTAid = oldAnim[0].id)
        let fade = fadeOut || game.settings.get("Custom-Token-Animations", "fadeOut")
        if (fade) {
            TweenMax.to(icon, 2, { alpha: 0, onComplete: CTA._FinalRemoval, onCompleteParams: [token, actorRemoval, anims]})
        }
        else { CTA._FinalRemoval(token, actorRemoval, anims) }

    }

    /**
     * 
     * @param {Object} token token to remove from
     * @param {Boolean} actorRemoval remove from actor
     * @param {Object} anims anims to set as new flags
     */
    static async _FinalRemoval(token, actorRemoval, anims) {
        if (actorRemoval) await token.actor.update({ "token.flags.Custom-Token-Animations.anim": anims })
        await token.setFlag("Custom-Token-Animations", "anim", anims)
        CTA.resetTweens(token, false)
    }

    /**
     * Prompt for full pathway
     * @param {Object} token token to update
     * @returns 
     */
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
                    let animId = html.find("[name=anims]")[0].value;
                    let updateAnim = anims.find(i => i.id === animId)
                    CTA.animationDialog(undefined, token, updateAnim.textureData, updateAnim.name)
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
                label: "Replicate to Macro",
                icon: `<i class="fas fa-file-import"></i>`,
                callback: (html) => {
                    let animId = html.find("[name=anims]")[0].value;
                    let updateAnim = anims.find(i => i.id === animId)
                    CTA.generateMacro(updateAnim)
                }
            },
            four: {
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
        if (anims && anims.length > 0) {
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

    /**
     * 
     * @param {Object <token5e>} token 
     * @param {String} name 
     */
    static hasAnim(token, name) {
        let anims = token.getFlag("Custom-Token-Animations", "anim")
        if (!anims) return false;
        for (let testAnim of anims) {
            if (testAnim.name === name) return true;
        }
        return false;
    }

}

Hooks.on('init', CTA.ready);
Hooks.on('getSceneControlButtons', CTA.getSceneControlButtons)

Hooks.on('ready', () => {
    game.socket.on('module.Custom-Token-Animations', socketData => {
        if (socketData.sceneId !== canvas.scene.id) return;
        if (socketData.method === "apply") {
            let token = canvas.tokens.get(socketData.tokenId)
            CTA.resetTweens(token, true)
        }
    })
})

Hooks.on("updateToken", (scene, token, update) => {
    if (!getProperty(update, "rotation")) return;
    let fullToken = canvas.tokens.get(token._id)
    let icons = fullToken.children.filter(i => i.CTA)
    icons.forEach(i => i.angle = update.rotation)
})


Hooks.on('init', () => {
    game.settings.register("Custom-Token-Animations", "playerPermissions", {
        name: "Player Permissions",
        hint: "Allow players to alter their own CTA effects",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register("Custom-Token-Animations", "fadeOut", {
        name: "Fade Animations",
        hint: "Animations will fade to opaque before removal",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });
})