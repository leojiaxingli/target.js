# Target.js

## Landing Page

https://target-js.herokuapp.com/

## API documentation

https://target-js.herokuapp.com/api


## To get started

Download target.js and target.css to be included in your project. Follow the [EXAMPLES](https://target-js.herokuapp.com/examples) and [API Documentation](https://target-js.herokuapp.com/api) To create your own custom target face!

## Documentation

### API

#### Settings

Change by Target.changeSettings(Object)

| Property           | Default | Type    | Description                                          |
|--------------------|---------|---------|------------------------------------------------------|
| ringHighlightColor | green   | Color   | The highlight color when mouse is hovering on a ring |
| ringRadius         | 50%     | String  | The ring radius (50% for a circle)                   |
| pinColor           | orange  | Color   | The color of pins being placed on the target         |
| pinDiameter        | 8       | Int     | The diameter of pins in pixels                       |
| showGrouping       | FALSE   | Boolean | Determine whether the grouping circle will be shown  |
| pinImage           | null    | Image   | Custom image for pins                                |
| pinImageWidth      | 20      | Int     | Custom pin image width                               |
| pinImageHeight     | 20      | Int     | Custom pin image height                              |

### Objects
#### Objects that are available for public access

| Name     | Constructor                                                                  |
|----------|------------------------------------------------------------------------------|
| Target   | container: HTMLElement - That will contain the target                        |
| RingInfo | color: Color - Ring Color                                                    |
|          | borderColor: Color - Ring border color                                       |
|          | borderWidth: Int - Ring border width in pixel                                |
|          | score: Int - Score for a hit registered on the ring                          |
|          | scoreTextColor: Color - The text color for score to be displayed on the ring |

### Functions
#### Functions that are available for public access

| Name                  | Parameters                     | Description                                                          |
|-----------------------|--------------------------------|----------------------------------------------------------------------|
| Target.createTarget   | ringInfo: An array of RingInfo | Use the ring info array to generate the target                       |
| Target.changeSettings | newSettings: Object            | Use the new object to update the target settings                     |
| Target.showGrouping   | show: Boolean                  | Determine if the grouping circle should be shown                     |
| Target.removePin      | index: Int                     | Remove a pin with corresponding index                                |
| Target.clearPins      |                                | Clear all pins                                                       |
| Target.addHitCallback | callback: Function             | Add a function to be called back when a hit is registered or updated |

### Constants
#### Constants that are available for public access

| Value       | Description                                 |
|-------------|---------------------------------------------|
| presets.WA6 | Preset for World Archery 6-ring target face |
| presets.GUN | Preset for man shaped gun shotting target   |
