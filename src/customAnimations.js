let canvasTweens = []

async function CTAaddAnimation(token, texture, scale, speed, push, name, multiple) {
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
        canvasTweens.push(tween)
    }


    if (push) {
        let flags = token.getFlag("Custom-Token-Animations", "anim") ? token.getFlag("Custom-Token-Animations", "anim") : []
        flags.push({
            name: name !== undefined ? name : flags.length,
            texture: texture,
            scale: scale,
            speed: speed,
            multiple: multiple
        })
        token.setFlag("Custom-Token-Animations", "anim", flags)
    }
}


Hooks.on("canvasInit", async () => {
    canvasTweens.forEach(t => t.kill())
    canvasTweens = []
    Hooks.once("canvasPan", () => {
        AddTweens()
    })
})



Hooks.on("preDeleteToken", (scene, token) => {
    let deleteToken = canvas.tokens.get(token._id)
    TweenMax.killTweensOf(deleteToken.children)
})

function AddTweens() {
    for (let testToken of canvas.tokens.placeables) {
        let flag = testToken.getFlag("Custom-Token-Animations", "anim")
        if (!flag) return;
        flag.forEach(f => CTAaddAnimation(testToken, f.texture, f.scale, f.speed, false, f.name, f.multiple))
    }
}


function animationDialog(OGpath) {
    if (canvas.tokens.controlled > 1) {
        ui.notifications.error("Please select only one token");
        return;
    }
    function shortLeft(string, boxLength) {
        let PREFIXDIRSTR = "...";
        boxLength += PREFIXDIRSTR.length;
        let splitString = string.substring(((string.length - 1) - boxLength), (string.length));
        splitString = PREFIXDIRSTR + splitString;
        console.log(splitString);
        return splitString;
    }

    let token = canvas.tokens.controlled[0]
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
                    <input id="scale" name="scale" type="number"></input>
            </div>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
                    <label for="speed">Speed of rotation: </label>
                    <input id="speed" name="speed" type="number" placeholder="seconds per rotation"></input>
            </div>
        <div class="form-group" clear: both; display: flex; flex-direction: row; flex-wrap: wrap;margin: 3px 0;align-items: center;">
            <label for="push">Push to Flagsc: </label>
            <input id="push" name="push" type="checkbox" ></input>
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
                    let push = html.find("#push")[0].value === "on" ? true : false
                    let multiple = parseInt(html.find("#multiple")[0].value)
                    CTAaddAnimation(token, path, scale, speed, push, name, multiple)
                }
            }
        }
    }).render(true)
}


function CTApickEffect() {
    let CTAPick = new FilePicker({
        type: "imagevideo",
        current: "",
        callback: path => {
            animationDialog(path)
        },

    })
    CTAPick.browse();
}


async function CTAupdateEffect(token, name, key, value) {
    let anims = await token.getFlag("Custom-Token-Animations", "anim")
    for (let i of anims) {
        if (i.name === name) {
            i[key] = value;
            break;
        }
    }
    await token.setFlag("Custom-Token-Animations", "anim", anims)
    CTAresetTweens(token)
}

async function CTAresetTweens(token) {
    let CTAtweens = token.children.filter(c => c.CTA === true)
    for (let child of CTAtweens) {
        TweenMax.killTweensOf(child)
        child.destroy()
    }

    let flag = token.getFlag("Custom-Token-Animations", "anim")
    if (!flag) return;
    flag.forEach(f => CTAaddAnimation(token, f.texture, f.scale, f.speed, false, f.name, f.multiple))
}

async function CTAincrementEffect(token, name, value){
    let anims = await token.getFlag("Custom-Token-Animations", "anim")
    for (let i of anims) {
        if (i.name === name) {
            i.multiple += value;
            break;
        }
    }
    await token.setFlag("Custom-Token-Animations", "anim", anims)
    CTAresetTweens(token)
}