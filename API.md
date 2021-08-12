


### pickEffect(token, oldData)

- Trigger the asset selection popup

|Param| Type |Description| 
|--|--|--|
| token| Object  | Token instance to effect
|oldData| Object | Optional data to pass into the animation dialog

  

### addAnimation(token, textureData, pushActor, name, oldID)
- Individually add an animation to a token

|Param| Type |Description| 
|--|--|--|
| token| Object  | Token instance to effect
|textureData| Object| Details of the effect, can be an array of objects. Can also be a String Name to add a preset
|pushActor| Boolean| Add effect to prototype token for the actor
|name| String| Effect Name
|id| String| id of the flag, leave false unless known

```
textureData = {

texturePath: string

scale: number

speed: number

multiple: number value*2

rotation: "static" or "rotation"

xScale: number

yScale: number

opacity: number, 0-1

tint: decimal color code

belowToken: boolean

radius: number

equip: boolean

}
```

### animationDialog(OGpath, token, oldData, name)

- Trigger the main effect creation dialog

|Param| Type |Description| 
|--|--|--|
|OGPath|String| Optional, Path to effect
|token| Object| Token to apply the effect to
|oldData| Obejct| Optional, passed when updating an existing effect
|name| String| Optional, passed to update an existing effect


### resetTweens(token) 
[DEPRECATED] Do not use
- Reset the effects on a specific token

|Param| Type |Description| 
|--|--|--|
|token| Object| Token to apply the effect to
  

### getAnims(token)

- Trigger the Update pathway for a specific token
- Launches into the pickEffect => animationDialog

|Param| Type |Description| 
|--|--|--|
|token| Object| Token to apply the effect to

### removeAnim(token, animId, actorRemoval, fadeOut)

- Remove an animation by its effect ID

|Param| Type |Description| 
|--|--|--|
|token| Object| Token to apply the effect to
|animID| String | ID of effect to remove 
|actorRemoval| Boolean| Remove from prototype token or not
|fadeOut | Boolean | Animate a fadeout of the effect

### removeAnimByName(token, name, removeActor, fadeOut)

- Remove an animation by its effect name
- Internally calls `removeAnim`

|Param| Type |Description| 
|--|--|--|
|token| Object| Token to apply the effect to
|name| String | Name of effect to remove (case sensitive), can be an array of strings
|removeActor| Boolean| Remove from prototype token or not
|fadeOut | Boolean | Animate a fadeout of the effect

### hasAnim(token, name)

- Boolean check for animation on a token

|Param| Type |Description| 
|--|--|--|
|token| Object| Token to apply the effect to
|name| String | Name of effect to check

### AddPreset(name, object)

- Add animation data to preset list

|Param| Type |Description| 
|--|--|--|
|name| String| Name of the preset
|object| Object | The textureData to add to the preset


### RemovePreset(name)

- Remove animation data from the preset list

|Param| Type |Description| 
|--|--|--|
|name| String| Name of the preset to remove

### ListPresets()

- Lists all presets in the chat
