## 0.2.50  
 Added support for a Preset list
    You can use the function `CTA.AddPreset` to add a preset to that world
    These can then be called by using their name in place of a textureData object

Added support for addition and removal of multiple effects at once
    `textureData` and `name` on the `CTA.addAnimation` command both accept arrays of their relevant types now, 
    `CTA.removeAnimByName` accepts an array of strings to remove multiple effects

Changed the generated macros to toggle on/off the affect