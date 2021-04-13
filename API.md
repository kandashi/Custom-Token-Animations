


### pickEffect(token)

- Trigger the asset selection popup

|Param| Type |Desctiption| 
|--|--|--|
| token| Object  | Token instance to effect

  

### addAnimation(token, textureData, pushToken, pushActor, name, update)
- Individually add an animation to a token

|Param| Type |Desctiption| 
|--|--|--|
| token| Object  | Token instance to effect
|pushToken | Boolean| Add effect to token or not
|pushActor| Boolean| Add effect to prototype token for the actor
|name| String| Effect Name
|update| Boolean| Overright existing effect
|textueData| Object| Details of the effect
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

|Param| Type |Desctiption| 
|--|--|--|
|OGPath|String| Optional, Path to effect
|token| Object| Token to apply the effect to
|oldData| Obejct| Optional, passed when updating an existing effect
|name| String| Optional, passed to update an existing effect


### resetTweens(token)

- Reset the effects on a specific token

|Param| Type |Desctiption| 
|--|--|--|
|token| Object| Token to apply the effect to
  

### getAnims(token)

- Trigger the Update pathway for a specific token
- Launches into the pickEffect => animationDialog

|Param| Type |Desctiption| 
|--|--|--|
|OGPath|String| Optional, Path to effect
|token| Object| Token to apply the effect to

### removeAnimByName(token, name, removeActor)

- Remove an animation by its effect name

|Param| Type |Desctiption| 
|--|--|--|
|OGPath|String| Optional, Path to effect
|token| Object| Token to apply the effect to
|name| String | Name of effect to remove (case sensitive)
|removeActor| Boolean| Remove from prototype token or not