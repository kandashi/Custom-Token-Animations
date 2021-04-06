# Custom-Token-Animations

![niceVisuals](https://github.com/kandashi/Custom-Token-Animations/blob/main/CTA%20full.gif?raw=true)

This adds the option to add custom defined icons onto tokens. Add static icons, animated assets, rotating ioun stones etc. onto your tokens. 

There are several macro commands to alter these traits but the simplest option is to use the "dotted circle" icon in the token control bar with a token selected.

##Animation Effects Breakdown
-Name : name of the effect, must be unique to that token, an update with the same name will overwrite the previous effect
-Image Path: path to the image to be used
--Scale: how large the individual asset should be compared to the token its applied to (1 = same size)
Static Image: is the image static, or with rotation
-Speed of Rotation: how fast should the asset rotate around the center, measured in seconds per full rotation
-Radius of Rotation: how far should the asset expand past the token borders, measured in token width (1 width token with radius of 1 would have the assets rotate 1 square away from the token border)
-Number of Copies: how many assets to add (rotation only)
- Position on X scale: where on the x scale should the center of the asset sit, 0 is left boundary of the token, 1 is right boundary of the token (you can exceed these values in either direction)
- Position on Y scale: where on the y scale should the center of the asset sit, 0 is top boundary of the token, 1 is bottom boundary of the token (you can exceed these values in either direction)
- Render below Token: render the asset below the token image (useful for spirit guardians etc)
- Permanent on Actor: Permanently add this asset to the actors token, useful for persisting between scenes

## API/Macro Commands
Preface these with `CTA.` 
### pickEffect(token)
- Trigger the asset selection popup
- `token` is the token to add the effect onto

### addAnimation(token, textureData, pushToken, pushActor, name, update)
- Individually add an animation to a token
- `token` is the token 
- `pushToken` set to true
- `pushActor` true = permanently apply to actor
- `name` is the effect name
- `update` set to false unless you are overwriting an effect
- `textureData` holds the details of the data:
- textureData = {
                            texturePath: path,
                            scale: scale,
                            speed: speed,
                            multiple: multiple, (normal value*2)
                            rotation: rotation ("static" or "rotation")
                            xScale: xScale,
                            yScale: yScale,
                            belowToken: belowToken, (boolean)
                            radius: radius 
                        }

### animationDialog(OGpath, token, oldData, name)
- Trigger the main effect creation dialog
- `OGPath` is the path to the effect, optional
- `token` is the token 
- `oldData` is optional, can update an existing effect
- `name` is optional, can update an existing effect

### resetTweens(token)
- Reset the effects on a specific token

### getAnims(token)
- Trigger the Update pathway for a specific token
- Launches into the pickEffect => animationDialog
