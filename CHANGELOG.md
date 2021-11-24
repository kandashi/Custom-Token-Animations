## 0.2.50  
 Added support for a Preset list
    You can use the function `CTA.AddPreset` to add a preset to that world
    These can then be called by using their name in place of a textureData object

Added support for addition and removal of multiple effects at once
    `textureData` and `name` on the `CTA.addAnimation` command both accept arrays of their relevant types now, 
    `CTA.removeAnimByName` accepts an array of strings to remove multiple effects

Changed the generated macros to toggle on/off the affect

## 0.2.6
Added more european accessability, due to issues with using `,` to mark decimal places
    To navigate this, you can now use `/` to split scale fields, which will be used preferentially over `,`
Updated the `isEquipment` to properly work with 0.8
Updated CTA player permissions to allow users with Create Drawing permission to use the CTA controls


## 0.2.7

- V9 compatibility and a few tweaks