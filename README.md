![](https://img.shields.io/badge/Foundry-v0.8.6-informational)![Latest Release Download Count](https://img.shields.io/github/downloads/kandashi/Custom-Token-Animations/latest/module.zip)![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2FCustom-Token-Animations&colorB=4aa94a)

# Custom-Token-Animations

![niceVisuals](https://github.com/kandashi/Custom-Token-Animations/blob/main/CTA%20full.gif?raw=true)

This adds the option to add custom defined icons onto tokens. Add static icons, animated assets, rotating ioun stones etc. onto your tokens. 

There are several macro commands to alter these traits but the simplest option is to use the "dotted circle" icon in the token control bar with a token selected.
![Toolbar](https://github.com/kandashi/Custom-Token-Animations/blob/main/cta%20demo.PNG?raw=true)

When removed effects will slowly fade over 2 seconds.

Custom Token Animations requires the use of the SocketLib module (https://foundryvtt.com/packages/socketlib)

## Animation Effects Breakdown
- Name : name of the effect, must be unique to that token, an update with the same name will overwrite the previous effect
- Image Path: path to the image to be used
- Scale: how large the individual asset should be compared to the token its applied to (1 = same size), this can be a single digit or two matching x/y eg. "1,2" would result in a tall, narrow asset  (negative values will flip in that axis)
- Static Image: is the image static, or with rotation
- Speed of Rotation: how fast should the asset rotate around the center, measured in seconds per full rotation
- Radius of Rotation: how far should the asset expand past the token borders, measured in token width (1 width token with radius of 1 would have the assets rotate 1 square away from the token border)
- Number of Copies: how many assets to add (rotation only)
- Position on X scale: where on the x scale should the center of the asset sit, 0 is left boundary of the token, 1 is right boundary of the token (you can exceed these values in either direction)
- Position on Y scale: where on the y scale should the center of the asset sit, 0 is top boundary of the token, 1 is bottom boundary of the token (you can exceed these values in either direction)
- Opacity: how opaque the asset is 0-1
- Tint: what tint is applied to the asset, defaults to pure white for no tint
- Render below Token: render the asset below the token image (useful for spirit guardians etc)
- Permanent on Actor: Permanently add this asset to the actors token, useful for persisting between scenes
- Apply as Equipment: Will now match rotate around the center point of the token to match the token image


To see the macro list, refer to the API.md
